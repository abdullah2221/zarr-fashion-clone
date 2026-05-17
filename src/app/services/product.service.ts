import { Injectable, computed, inject, signal } from '@angular/core';
import { Product, Category, ProductImage } from '../shared/models/models';
import { CATEGORIES, POPULAR_PRODUCTS, PRODUCTS, SALE_PRODUCTS } from '../data/data';
import { SupabaseClientService } from '../core/supabase/supabase-client.service';
import {
  SupabaseCategoryRepository,
  SupabaseProductRepository,
  SupabaseStorageRepository,
} from '../data-access/supabase/supabase.repositories';
import { Tables } from '../data-access/models/database.types';

export type ProductSortBy =
  | 'featured'
  | 'price-low'
  | 'price-high'
  | 'rating-high'
  | 'newest';

export type CatalogSource = 'supabase' | 'local';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private static readonly PRODUCT_PLACEHOLDER_URL = '/images/product-placeholder.svg';
  private readonly supabaseClient = inject(SupabaseClientService);
  private readonly supabaseProducts = inject(SupabaseProductRepository);
  private readonly supabaseCategories = inject(SupabaseCategoryRepository);
  private readonly supabaseStorage = inject(SupabaseStorageRepository);

  private readonly productsSignal = signal<Product[]>(PRODUCTS);
  private readonly categoriesSignal = signal<Category[]>(CATEGORIES);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly sourceSignal = signal<CatalogSource>('local');

  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly source = this.sourceSignal.asReadonly();

  private readonly popularProductsSignal = computed(() =>
    this.productsSignal().filter(product => product.badge === 'Best Seller' || product.isTrending || product.isNew).slice(0, 5)
  );
  private readonly saleProductsSignal = computed(() =>
    this.productsSignal().filter(product => Boolean(product.originalPrice || product.discount)).slice(0, 5)
  );

  constructor() {
    void this.loadCatalog();
  }

  getProducts() {
    return this.productsSignal.asReadonly();
  }

  getCategories() {
    return this.categoriesSignal.asReadonly();
  }

  getPopularProducts() {
    return this.popularProductsSignal;
  }

  getSaleProducts() {
    return this.saleProductsSignal;
  }

  getProductById(id: number) {
    return this.productsSignal().find(product => product.id === id);
  }

  getProductsByCategory(slug: string) {
    const normalized = slug.toLowerCase().trim();
    return this.productsSignal().filter(product =>
      product.categorySlug === normalized ||
      product.category?.toLowerCase().replace(/\s+/g, '-') === normalized
    );
  }

  queryProducts(options: { categorySlug?: string; search?: string; sortBy?: ProductSortBy }) {
    const search = (options.search || '').toLowerCase().trim();
    const sortBy = options.sortBy || 'featured';

    let list = [...this.productsSignal()];

    if (options.categorySlug) {
      list = this.getProductsByCategory(options.categorySlug);
    }

    if (search) {
      list = list.filter(product => {
        const haystack = [
          product.name,
          product.brand,
          product.category,
          product.collection,
          ...(product.campaignTags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    switch (sortBy) {
      case 'price-low':
        list.sort((a, b) => this.getPriceValue(a) - this.getPriceValue(b));
        break;
      case 'price-high':
        list.sort((a, b) => this.getPriceValue(b) - this.getPriceValue(a));
        break;
      case 'rating-high':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || b.id - a.id);
        break;
      default:
        list.sort((a, b) => this.featuredScore(b) - this.featuredScore(a));
        break;
    }

    return list;
  }

  async refreshCatalog() {
    await this.loadCatalog();
  }

  private async loadCatalog() {
    if (!this.supabaseClient.isConfigured()) {
      this.useLocalCatalog();
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const [categories, products] = await Promise.all([
        this.supabaseCategories.listActive(),
        this.supabaseProducts.listActive(),
      ]);

      const productImageEntries = await Promise.all(
        products.map(async product => [product.id, await this.supabaseProducts.getImages(product.id)] as const)
      );
      const imagesByProduct = new Map(productImageEntries);

      this.categoriesSignal.set(categories.map(category => this.mapCategory(category)));
      this.productsSignal.set(products.map(product => this.mapProduct(product, categories, imagesByProduct.get(product.id) || [])));
      this.sourceSignal.set('supabase');
    } catch (error) {
      this.errorSignal.set('Live catalog is temporarily unavailable. Showing saved collection data instead.');
      this.useLocalCatalog();
      console.error('Failed to load Supabase catalog, falling back to local data.', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private useLocalCatalog() {
    this.categoriesSignal.set(CATEGORIES);
    this.productsSignal.set(PRODUCTS.map(product => this.withResolvedLocalImages(product)));
    this.sourceSignal.set('local');
  }

  private mapCategory(category: Tables<'categories'>): Category {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      subtitle: category.description || undefined,
      imageUrl: category.image_path ? this.supabaseStorage.getProductImageUrl(category.image_path) : '',
    };
  }

  private mapProduct(product: Tables<'products'>, categories: Tables<'categories'>[], images: Tables<'product_images'>[]): Product {
    const category = categories.find(item => item.id === product.category_id);
    const metadata = this.asRecord(product.metadata);
    const galleryImages = this.resolveSupabaseGallery(images, product.name);
    const primaryImage = galleryImages[0];
    const hoverImage = galleryImages[1] ?? primaryImage;
    const price = this.formatPrice(product.price);
    const originalPrice = product.original_price == null ? undefined : this.formatPrice(product.original_price);

    return {
      id: product.legacy_id,
      brand: product.brand || 'UR-Fashion',
      name: product.name,
      price,
      priceValue: product.price,
      originalPrice,
      originalPriceValue: product.original_price ?? undefined,
      discount: originalPrice ? this.discountLabel(product.price, product.original_price || product.price) : undefined,
      imageUrl: primaryImage.url,
      hoverImageUrl: hoverImage?.url ?? primaryImage.url,
      images: galleryImages,
      url: `/product/${product.legacy_id}`,
      category: category?.name,
      categorySlug: category?.slug || 'shop',
      collection: this.stringValue(metadata['collection']) as Product['collection'],
      description: product.description || undefined,
      rating: this.numberValue(metadata['rating']),
      reviewCount: this.numberValue(metadata['reviewCount']),
      sizes: this.stringArray(metadata['sizes']),
      badge: this.stringValue(metadata['badge']) as Product['badge'],
      stockLabel: this.stringValue(metadata['stockLabel']),
      isNew: this.booleanValue(metadata['isNew']),
      isTrending: this.booleanValue(metadata['isTrending']),
      campaignTags: this.stringArray(metadata['campaignTags']),
    };
  }

  private withResolvedLocalImages(product: Product): Product {
    const galleryImages = this.deduplicateImages(
      [
        {
          url: product.imageUrl,
          alt: `${product.name} primary image`,
          isPrimary: true,
        },
        product.hoverImageUrl
          ? {
              url: product.hoverImageUrl,
              alt: `${product.name} alternate image`,
            }
          : undefined,
      ],
      product.name
    );
    const primaryImage = galleryImages[0];
    const hoverImage = galleryImages[1] ?? primaryImage;

    return {
      ...product,
      imageUrl: primaryImage.url,
      hoverImageUrl: hoverImage?.url ?? primaryImage.url,
      images: galleryImages,
    };
  }

  private resolveSupabaseGallery(images: Tables<'product_images'>[], productName: string): ProductImage[] {
    const orderedImages = [...images].sort(
      (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
    );
    const galleryImages = this.deduplicateImages(
      orderedImages.map(image => ({
        url: this.supabaseStorage.getProductImageUrl(image.storage_path),
        storagePath: image.storage_path,
        alt: image.alt_text || `${productName} image`,
        isPrimary: image.is_primary,
      })),
      productName
    );

    return galleryImages.length
      ? galleryImages
      : [
          {
            url: ProductService.PRODUCT_PLACEHOLDER_URL,
            alt: `${productName} placeholder image`,
            isPrimary: true,
          },
        ];
  }

  private deduplicateImages(images: Array<ProductImage | undefined>, productName: string): ProductImage[] {
    const seen = new Set<string>();
    const uniqueImages: ProductImage[] = [];

    for (const image of images) {
      if (!image?.url) continue;

      const key = this.imageDedupKey(image);
      if (seen.has(key)) continue;

      seen.add(key);
      uniqueImages.push({
        ...image,
        alt: image.alt || `${productName} image`,
      });
    }

    return uniqueImages;
  }

  private imageDedupKey(image: ProductImage): string {
    return (image.storagePath || image.url).trim().toLowerCase();
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  }

  private stringValue(value: unknown) {
    return typeof value === 'string' ? value : undefined;
  }

  private numberValue(value: unknown) {
    return typeof value === 'number' ? value : undefined;
  }

  private booleanValue(value: unknown) {
    return typeof value === 'boolean' ? value : undefined;
  }

  private stringArray(value: unknown) {
    return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : undefined;
  }

  private formatPrice(value: number) {
    return `Rs. ${value.toLocaleString('en-PK')}`;
  }

  private discountLabel(price: number, originalPrice: number) {
    if (originalPrice <= price) return undefined;
    return `-${Math.round((1 - price / originalPrice) * 100)}%`;
  }

  private getPriceValue(product: Product) {
    if (typeof product.priceValue === 'number') return product.priceValue;
    return parseFloat(product.price.replace(/[^\d.]/g, '')) || 0;
  }

  private featuredScore(product: Product) {
    return (
      (product.isTrending ? 6 : 0) +
      (product.isNew ? 4 : 0) +
      (product.discount ? 3 : 0) +
      (product.badge === 'Best Seller' ? 5 : 0) +
      ((product.rating || 0) / 2)
    );
  }
}

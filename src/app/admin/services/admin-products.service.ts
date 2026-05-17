import { Injectable, computed, inject, signal } from '@angular/core';
import { Inserts, Json, Tables, Updates } from '../../data-access/models/database.types';
import { SupabaseCategoryRepository, SupabaseProductRepository, SupabaseStorageRepository } from '../../data-access/supabase/supabase.repositories';
import { ProductService } from '../../services/product.service';
import {
  AdminImageDraft,
  AdminProductEditorState,
  AdminProductFormValue,
  AdminProductListItem,
  AdminProductMetadata,
  AdminProductStatusFilter,
  AdminFeaturedFilter,
  AdminProductSort,
  AdminStockFilter,
} from '../models/admin-catalog.models';

@Injectable({ providedIn: 'root' })
export class AdminProductsService {
  private readonly productRepository = inject(SupabaseProductRepository);
  private readonly categoryRepository = inject(SupabaseCategoryRepository);
  private readonly storageRepository = inject(SupabaseStorageRepository);
  private readonly productService = inject(ProductService);

  private readonly productsSignal = signal<Tables<'products'>[]>([]);
  private readonly categoriesSignal = signal<Tables<'categories'>[]>([]);
  private readonly imagesSignal = signal<Record<string, Tables<'product_images'>[]>>({});
  private readonly loadingSignal = signal(false);

  readonly isLoading = this.loadingSignal.asReadonly();
  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly productList = computed<AdminProductListItem[]>(() => {
    const categoriesById = new Map(this.categoriesSignal().map(category => [category.id, category]));
    return this.productsSignal().map(product => {
      const metadata = this.readMetadata(product.metadata);
      const images = this.imagesSignal()[product.id] || [];
      const primaryImage = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0];
      return {
        record: product,
        categoryName: categoriesById.get(product.category_id || '')?.name || 'Unassigned',
        imageUrl: primaryImage ? this.storageRepository.getProductImageUrl(primaryImage.storage_path) : '/images/product-placeholder.svg',
        currentPrice: product.price,
        originalPrice: product.original_price,
        campaignTags: metadata.campaignTags || [],
        metadata,
      };
    });
  });

  async load() {
    this.loadingSignal.set(true);
    try {
      const [products, categories] = await Promise.all([
        this.productRepository.listAll(),
        this.categoryRepository.listAll(),
      ]);
      const imagesEntries = await Promise.all(products.map(async product => [product.id, await this.productRepository.getImages(product.id)] as const));
      this.productsSignal.set(products);
      this.categoriesSignal.set(categories);
      this.imagesSignal.set(Object.fromEntries(imagesEntries));
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadEditorState(productId: string | null): Promise<AdminProductEditorState> {
    const categories = await this.categoryRepository.listAll();
    if (!productId) {
      return { product: null, images: [], categories };
    }

    const [product, images] = await Promise.all([
      this.productRepository.getById(productId),
      this.productRepository.getImages(productId),
    ]);

    return {
      product,
      images,
      categories,
    };
  }

  createDefaultFormValue(): AdminProductFormValue {
    return {
      name: '',
      slug: '',
      sku: '',
      brand: 'UR-Fashion',
      description: '',
      categoryId: '',
      regularPrice: null,
      salePrice: null,
      stockQuantity: 0,
      isActive: true,
      isFeatured: false,
      collection: '',
      fabric: '',
      sizes: '',
      colors: '',
      campaignTags: '',
      seoTitle: '',
      seoDescription: '',
      badge: '',
      deliveryNote: '',
      codAvailable: true,
      exchangeEligible: true,
      productType: '',
      season: '',
      isReadyToWear: false,
      isLawnCollection: false,
      isEidCollection: false,
      isWeddingFormal: false,
    };
  }

  createFormValueFromRecord(product: Tables<'products'> | null): AdminProductFormValue {
    if (!product) return this.createDefaultFormValue();

    const metadata = this.readMetadata(product.metadata);
    const regularPrice = product.original_price ?? product.price;
    const salePrice = product.original_price ? product.price : null;

    return {
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand || 'UR-Fashion',
      description: product.description || '',
      categoryId: product.category_id || '',
      regularPrice,
      salePrice,
      stockQuantity: product.stock_quantity,
      isActive: product.is_active,
      isFeatured: product.is_featured,
      collection: metadata.collection || '',
      fabric: metadata.fabric || '',
      sizes: (metadata.sizes || []).join(', '),
      colors: (metadata.colors || []).join(', '),
      campaignTags: (metadata.campaignTags || []).join(', '),
      seoTitle: metadata.seoTitle || '',
      seoDescription: metadata.seoDescription || '',
      badge: metadata.badge || '',
      deliveryNote: metadata.deliveryNote || '',
      codAvailable: metadata.codAvailable ?? true,
      exchangeEligible: metadata.exchangeEligible ?? true,
      productType: metadata.productType || '',
      season: metadata.season || '',
      isReadyToWear: metadata.isReadyToWear ?? false,
      isLawnCollection: metadata.isLawnCollection ?? false,
      isEidCollection: metadata.isEidCollection ?? false,
      isWeddingFormal: metadata.isWeddingFormal ?? false,
    };
  }

  createImageDrafts(productName: string, images: Tables<'product_images'>[]): AdminImageDraft[] {
    const ordered = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
    return ordered.map((image, index) => ({
      id: image.id,
      storagePath: image.storage_path,
      previewUrl: this.storageRepository.getProductImageUrl(image.storage_path),
      altText: image.alt_text || `${productName} image`,
      isPrimary: index === 0 || image.is_primary,
      sortOrder: image.sort_order,
    }));
  }

  async saveProduct(
    currentProduct: Tables<'products'> | null,
    formValue: AdminProductFormValue,
    images: AdminImageDraft[]
  ) {
    const legacyId = currentProduct?.legacy_id ?? (await this.nextLegacyId());
    const productPayload = this.toProductPayload(formValue, legacyId);

    const savedProduct = currentProduct
      ? await this.productRepository.update(currentProduct.id, productPayload)
      : await this.productRepository.create(productPayload as Inserts<'products'>);

    await this.syncImages(savedProduct, images);
    await this.load();
    await this.productService.refreshCatalog();
    return savedProduct;
  }

  async deleteProduct(id: string) {
    const images = await this.productRepository.getImages(id);
    for (const image of images) {
      await this.deleteImageRecord(image.id, image.storage_path);
    }
    await this.productRepository.delete(id);
    await this.load();
    await this.productService.refreshCatalog();
  }

  async toggleProductActive(product: Tables<'products'>, isActive: boolean) {
    await this.productRepository.update(product.id, { is_active: isActive });
    await this.load();
    await this.productService.refreshCatalog();
  }

  async toggleProductFeatured(product: Tables<'products'>, isFeatured: boolean) {
    await this.productRepository.update(product.id, { is_featured: isFeatured });
    await this.load();
    await this.productService.refreshCatalog();
  }

  filterProducts(
    items: AdminProductListItem[],
    filters: {
      search: string;
      categoryId: string;
      status: AdminProductStatusFilter;
      featured: AdminFeaturedFilter;
      stock: AdminStockFilter;
      sort: AdminProductSort;
    }
  ) {
    const search = filters.search.toLowerCase().trim();
    let next = [...items];

    if (search) {
      next = next.filter(item => {
        const haystack = [
          item.record.name,
          item.record.sku,
          item.categoryName,
          ...(item.metadata.campaignTags || []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    if (filters.categoryId) {
      next = next.filter(item => item.record.category_id === filters.categoryId);
    }

    if (filters.status !== 'all') {
      next = next.filter(item => item.record.is_active === (filters.status === 'active'));
    }

    if (filters.featured !== 'all') {
      next = next.filter(item => item.record.is_featured === (filters.featured === 'featured'));
    }

    if (filters.stock !== 'all') {
      next = next.filter(item => {
        if (filters.stock === 'out') return item.record.stock_quantity === 0;
        if (filters.stock === 'low') return item.record.stock_quantity > 0 && item.record.stock_quantity <= 5;
        return item.record.stock_quantity > 5;
      });
    }

    switch (filters.sort) {
      case 'name':
        next.sort((a, b) => a.record.name.localeCompare(b.record.name));
        break;
      case 'price-high':
        next.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'price-low':
        next.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'stock-high':
        next.sort((a, b) => b.record.stock_quantity - a.record.stock_quantity);
        break;
      case 'stock-low':
        next.sort((a, b) => a.record.stock_quantity - b.record.stock_quantity);
        break;
      default:
        next.sort((a, b) => Date.parse(b.record.created_at) - Date.parse(a.record.created_at));
        break;
    }

    return next;
  }

  slugExists(slug: string, excludingId?: string) {
    const normalized = slug.trim().toLowerCase();
    return this.productsSignal().some(product => product.slug.toLowerCase() === normalized && product.id !== excludingId);
  }

  skuExists(sku: string, excludingId?: string) {
    const normalized = sku.trim().toLowerCase();
    return this.productsSignal().some(product => product.sku.toLowerCase() === normalized && product.id !== excludingId);
  }

  private async syncImages(product: Tables<'products'>, images: AdminImageDraft[]) {
    const activeImages = this.normalizeImageDrafts(images.filter(image => !image.markedForDeletion));
    const existingImages = activeImages.filter(image => image.id);
    const newImages = activeImages.filter(image => image.file);
    const productFolder = `products/${product.legacy_id || product.id}`;

    for (const image of images.filter(image => image.markedForDeletion && image.id && image.storagePath)) {
      if (!image.storagePath) continue;
      await this.deleteImageRecord(image.id!, image.storagePath);
    }

    for (const image of existingImages) {
      await this.productRepository.updateImage(image.id!, {
        alt_text: image.altText,
        is_primary: image.isPrimary,
        sort_order: image.sortOrder,
      });
    }

    for (const image of newImages) {
      const path = image.sortOrder === 0 ? `${productFolder}/main.jpg` : `${productFolder}/gallery-${image.sortOrder}.jpg`;
      await this.storageRepository.uploadProductImage(path, image.file!, { upsert: true });
      await this.productRepository.createImage({
        product_id: product.id,
        storage_path: path,
        alt_text: image.altText,
        is_primary: image.isPrimary,
        sort_order: image.sortOrder,
      });
    }

    const refreshedImages = await this.productRepository.getImages(product.id);
    const reordered = refreshedImages.sort((a, b) => a.sort_order - b.sort_order);
    for (const [index, image] of reordered.entries()) {
      if (image.sort_order !== index || image.is_primary !== (index === 0)) {
        await this.productRepository.updateImage(image.id, {
          sort_order: index,
          is_primary: index === 0,
        });
      }
    }

  }

  private async deleteImageRecord(id: string, storagePath: string) {
    await this.productRepository.deleteImage(id);
    await this.storageRepository.removeProductImage(storagePath);
  }

  private normalizeImageDrafts(images: AdminImageDraft[]) {
    const next = [...images].map((image, index) => ({
        ...image,
        isPrimary: index === 0,
        sortOrder: index,
      }));

    const seen = new Set<string>();
    return next.filter(image => {
      const key = (image.storagePath || `${image.file?.name}_${image.file?.size}` || image.previewUrl).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private toProductPayload(formValue: AdminProductFormValue, legacyId: number): Updates<'products'> {
    const regularPrice = formValue.regularPrice ?? 0;
    const salePrice = formValue.salePrice ?? null;
    const hasSale = salePrice != null && salePrice > 0;

    return {
      legacy_id: legacyId,
      sku: formValue.sku.trim(),
      name: formValue.name.trim(),
      slug: formValue.slug.trim().toLowerCase(),
      brand: formValue.brand.trim() || 'UR-Fashion',
      description: formValue.description.trim() || null,
      category_id: formValue.categoryId || null,
      price: hasSale ? salePrice! : regularPrice,
      original_price: hasSale ? regularPrice : null,
      is_active: formValue.isActive,
      is_featured: formValue.isFeatured,
      stock_quantity: formValue.stockQuantity ?? 0,
      metadata: this.toProductMetadata(formValue),
    };
  }

  private toProductMetadata(formValue: AdminProductFormValue): Json {
    const metadata: AdminProductMetadata = {
      collection: (formValue.collection || undefined) as AdminProductMetadata['collection'],
      fabric: formValue.fabric.trim() || undefined,
      sizes: this.parseCommaList(formValue.sizes),
      colors: this.parseCommaList(formValue.colors),
      badge: (formValue.badge || undefined) as AdminProductMetadata['badge'],
      campaignTags: this.parseCommaList(formValue.campaignTags),
      seoTitle: formValue.seoTitle.trim() || undefined,
      seoDescription: formValue.seoDescription.trim() || undefined,
      deliveryNote: formValue.deliveryNote.trim() || undefined,
      codAvailable: formValue.codAvailable,
      exchangeEligible: formValue.exchangeEligible,
      productType: (formValue.productType || undefined) as AdminProductMetadata['productType'],
      season: (formValue.season || undefined) as AdminProductMetadata['season'],
      isReadyToWear: formValue.isReadyToWear,
      isLawnCollection: formValue.isLawnCollection,
      isEidCollection: formValue.isEidCollection,
      isWeddingFormal: formValue.isWeddingFormal,
    };

    return Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined && value !== '')) as Json;
  }

  private readMetadata(value: Json): AdminProductMetadata {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as AdminProductMetadata : {};
  }

  private parseCommaList(value: string) {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  private async nextLegacyId() {
    const products = this.productsSignal().length ? this.productsSignal() : await this.productRepository.listAll();
    const maxLegacyId = products.reduce((max, product) => Math.max(max, product.legacy_id), 0);
    return maxLegacyId + 1;
  }
}

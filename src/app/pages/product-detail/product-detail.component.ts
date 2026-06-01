import { ChangeDetectionStrategy, Component, inject, input, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { MetaService } from '../../core/services/meta.service';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductCarouselComponent } from '../../components/product-carousel/product-carousel.component';
import { ProductImage } from '../../shared/models/models';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, PricePipe, RouterLink, MatIconModule, ProductCarouselComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  id = input.required<string>();
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly metaService = inject(MetaService);
  readonly content = inject(StorefrontContentService);
  private readonly wishlistService = inject(WishlistService);
  private readonly selectedImageUrl = signal<string | null>(null);
  private readonly selectedSize = signal<string | null>(null);

  product = computed(() => this.productService.getProductById(Number(this.id())));
  isLoading = this.productService.isLoading;
  error = this.productService.error;
  galleryImages = computed(() => this.product()?.images || []);
  mainImage = computed(() => {
    const selectedImageUrl = this.selectedImageUrl();
    const galleryImages = this.galleryImages();
    return galleryImages.find(image => image.url === selectedImageUrl) || galleryImages[0] || null;
  });
  activeImageUrl = computed(() => this.mainImage()?.url || null);
  relatedProducts = computed(() => {
    const current = this.product();
    const candidates = this.productService.getProducts()().filter(p => p.id !== Number(this.id()));
    if (!current) return candidates.slice(0, 6);
    const sameCategory = candidates.filter(p => p.categorySlug === current.categorySlug);
    return [...sameCategory, ...candidates.filter(p => p.categorySlug !== current.categorySlug)].slice(0, 6);
  });
  sizeOptions = computed(() => this.product()?.sizes || []);
  activeSize = this.selectedSize.asReadonly();
  inWishlist = computed(() => {
    const product = this.product();
    if (!product) return false;
    return this.wishlistService.isInWishlist(product.id);
  });

  constructor() {
    effect(() => {
      const primaryImageUrl = this.galleryImages()[0]?.url || null;
      const selectedImageUrl = this.selectedImageUrl();
      if (!primaryImageUrl) {
        if (selectedImageUrl !== null) {
          this.selectedImageUrl.set(null);
        }
        return;
      }
      if (selectedImageUrl !== primaryImageUrl && !this.galleryImages().some(image => image.url === selectedImageUrl)) {
        this.selectedImageUrl.set(primaryImageUrl);
      }
    });

    effect(() => {
      const sizes = this.sizeOptions();
      const current = this.selectedSize();
      if (!sizes.length) {
        if (current !== null) this.selectedSize.set(null);
        return;
      }
      if (!current || !sizes.includes(current)) {
        this.selectedSize.set(sizes[0]);
      }
    });

    effect(() => {
      const p = this.product();
      const galleryImages = this.galleryImages();
      if (p) {
        this.metaService.setSeo({
          title: `${p.brand} ${p.name}`,
          description: p.description || `${p.name} by ${p.brand}. Shop premium Pakistani fashion with COD and nationwide delivery.`,
          image: galleryImages[0]?.url || p.imageUrl,
          path: `/product/${p.id}`,
          keywords: `${p.brand}, ${p.category || 'fashion'}, Pakistani fashion, ${p.collection || 'ready to wear'}`,
          type: 'product'
        });

        const priceValue = parseFloat(p.price.replace(/[^\d.]/g, '')) || 0;
        const productSchema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          image: galleryImages.map(image => image.url),
          description: p.description || p.name,
          brand: { '@type': 'Brand', name: p.brand },
          sku: String(p.id),
          category: p.category,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'PKR',
            price: priceValue,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            url: `https://www.ur-fashion.pk/product/${p.id}`
          },
          aggregateRating: p.rating
            ? {
                '@type': 'AggregateRating',
                ratingValue: p.rating,
                reviewCount: p.reviewCount || 1
              }
            : undefined
        };
        this.metaService.setJsonLd('seo-product-schema', productSchema);

        const breadcrumb = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ur-fashion.pk/' },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://www.ur-fashion.pk/shop' },
            { '@type': 'ListItem', position: 3, name: p.category || 'Collection', item: `https://www.ur-fashion.pk/category/${p.categorySlug}` },
            { '@type': 'ListItem', position: 4, name: p.name, item: `https://www.ur-fashion.pk/product/${p.id}` }
          ]
        };
        this.metaService.setJsonLd('seo-breadcrumb-schema', breadcrumb);
      }
    });
  }

  selectImage(image: ProductImage) {
    this.selectedImageUrl.set(image.url);
  }

  addToCart() {
    const p = this.product();
    if (p) {
      this.cartService.addToCart(p, { size: this.selectedSize() || undefined });
    }
  }

  async toggleWishlist() {
    const product = this.product();
    if (!product) return;
    await this.wishlistService.toggle(product);
  }

  chooseSize(size: string) {
    this.selectedSize.set(size);
  }
}

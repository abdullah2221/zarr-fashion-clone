import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { parsePriceValue } from '../../shared/utils/price.utils';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductGridComponent } from '../../components/product-grid/product-grid.component';
import { ProductService, ProductSortBy } from '../../services/product.service';
import { MetaService } from '../../core/services/meta.service';
import { CampaignChipsComponent } from '../../components/campaign-chips/campaign-chips.component';
import { TrustBadgeStripComponent, TrustBadgeItem } from '../../components/trust-badge-strip/trust-badge-strip.component';
import { LoadingSkeletonCardComponent } from '../../components/loading-skeleton-card/loading-skeleton-card.component';
import { StorefrontContentService } from '../../services/storefront-content.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductGridComponent, CampaignChipsComponent, TrustBadgeStripComponent, LoadingSkeletonCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopComponent {
  private productService = inject(ProductService);
  private metaService = inject(MetaService);
  readonly content = inject(StorefrontContentService);

  slug = input<string>();
  searchQuery = signal('');
  sortBy = signal<ProductSortBy>('featured');
  isLoading = this.productService.isLoading;
  error = this.productService.error;
  selectedCategory = computed(() => this.slug() || 'all');

  // Interactive Filter States
  selectedCollections = signal<string[]>([]);
  selectedSizes = signal<string[]>([]);
  maxPrice = signal<number>(15000);

  categoryChips = computed(() => [
    { label: 'All', slug: 'all' },
    ...this.productService.getCategories()().map(category => ({ label: category.name, slug: category.slug || 'all' }))
  ]);

  campaignChips = this.content.campaignChips;
  trustItems = computed<TrustBadgeItem[]>(() =>
    this.content.trustBadges().map(item => ({ icon: item.icon, label: item.label }))
  );

  products = computed(() => {
    let list = this.productService.queryProducts({
      categorySlug: this.selectedCategory() === 'all' ? undefined : this.selectedCategory(),
      search: this.searchQuery(),
      sortBy: this.sortBy()
    });

    const collections = this.selectedCollections();
    if (collections.length > 0) {
      list = list.filter(p => p.collection && collections.some(col => p.collection?.toLowerCase().includes(col.toLowerCase())));
    }

    const sizes = this.selectedSizes();
    if (sizes.length > 0) {
      list = list.filter(p => p.sizes && p.sizes.some(s => sizes.includes(s)));
    }

    const priceLimit = this.maxPrice();
    list = list.filter(p => {
      const price = p.priceValue || parsePriceValue(p.price);
      return price <= priceLimit;
    });

    return list;
  });

  // Filter Helper Methods
  isCollectionSelected(name: string): boolean {
    return this.selectedCollections().includes(name);
  }

  toggleCollection(name: string): void {
    const current = this.selectedCollections();
    if (current.includes(name)) {
      this.selectedCollections.set(current.filter(item => item !== name));
    } else {
      this.selectedCollections.set([...current, name]);
    }
  }

  isSizeSelected(size: string): boolean {
    return this.selectedSizes().includes(size);
  }

  toggleSize(size: string): void {
    const current = this.selectedSizes();
    if (current.includes(size)) {
      this.selectedSizes.set(current.filter(item => item !== size));
    } else {
      this.selectedSizes.set([...current, size]);
    }
  }

  onPriceSliderChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.maxPrice.set(parseFloat(value) || 15000);
  }

  clearFilters(): void {
    this.selectedCollections.set([]);
    this.selectedSizes.set([]);
    this.maxPrice.set(15000);
  }

  pageLabel = computed(() => this.formatSlug(this.slug()) || 'Zeenat Collections');
  pageTitle = computed(() => this.slug() ? `${this.formatSlug(this.slug())} Collection` : 'Shop premium fashion for every Pakistani season');
  pageIntro = computed(() => this.slug()
    ? `Explore ${this.formatSlug(this.slug()).toLowerCase()} picks from Zeenat with premium styling, COD support and nationwide delivery.`
    : 'Discover lawn, unstitched suits, ready-to-wear, wedding edits and sale picks with COD and nationwide delivery.'
  );

  constructor() {
    effect(() => {
      const slug = this.slug();
      const categoryLabel = slug ? this.formatSlug(slug) : '';
      const title = slug ? `${categoryLabel} Collection` : 'Shop All';
      const description = slug
        ? `Shop ${categoryLabel} styles at Zeenat with COD, seasonal campaign picks, and delivery across Pakistan.`
        : this.content.settings().defaultSeoDescription;
      const path = slug ? `/category/${slug}` : '/shop';

      this.metaService.setSeo({
        title,
        description,
        path,
        keywords: `Pakistani fashion, ${slug ? categoryLabel.toLowerCase() : 'shop all'}, Eid collection, lawn collection, ready to wear`,
        type: 'website'
      });

      const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ur-fashion.pk/' },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://www.ur-fashion.pk/shop' },
          ...(slug ? [{ '@type': 'ListItem', position: 3, name: categoryLabel, item: `https://www.ur-fashion.pk/category/${slug}` }] : [])
        ]
      };
      this.metaService.setJsonLd('seo-breadcrumb-schema', breadcrumb);
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value || '';
    this.searchQuery.set(value);
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as ProductSortBy;
    this.sortBy.set(value);
  }

  private formatSlug(value?: string) {
    if (!value) return '';
    return value
      .split('-')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

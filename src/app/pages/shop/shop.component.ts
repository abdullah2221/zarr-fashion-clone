import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductGridComponent } from '../../components/product-grid/product-grid.component';
import { ProductService, ProductSortBy } from '../../services/product.service';
import { MetaService } from '../../core/services/meta.service';
import { CampaignChipsComponent } from '../../components/campaign-chips/campaign-chips.component';
import { TrustBadgeStripComponent, TrustBadgeItem } from '../../components/trust-badge-strip/trust-badge-strip.component';
import { LoadingSkeletonCardComponent } from '../../components/loading-skeleton-card/loading-skeleton-card.component';

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

  slug = input<string>();
  searchQuery = signal('');
  sortBy = signal<ProductSortBy>('featured');
  isLoading = signal(false);
  selectedCategory = computed(() => this.slug() || 'all');

  categoryChips = [
    { label: 'All', slug: 'all' },
    { label: 'Unstitched', slug: 'unstitched' },
    { label: 'Lawn', slug: 'lawn' },
    { label: 'Ready to Wear', slug: 'ready-to-wear' },
    { label: 'Wedding', slug: 'wedding' },
    { label: 'Sale', slug: 'sale' }
  ];

  campaignChips = ['Trending in Pakistan', 'Eid Collection', 'Ramadan Sale', 'Summer Lawn', 'Wedding/Formal', 'Ready to Wear', 'Unstitched', 'Stitched'];

  trustItems: TrustBadgeItem[] = [
    { icon: 'payments', label: 'Cash on Delivery' },
    { icon: 'chat', label: 'WhatsApp support' },
    { icon: 'autorenew', label: 'Easy exchange' },
    { icon: 'local_shipping', label: 'Delivery across Pakistan' }
  ];

  products = computed(() => this.productService.queryProducts({
    categorySlug: this.selectedCategory() === 'all' ? undefined : this.selectedCategory(),
    search: this.searchQuery(),
    sortBy: this.sortBy()
  }));

  pageLabel = computed(() => this.formatSlug(this.slug()) || 'UR-Fashion Collections');
  pageTitle = computed(() => this.slug() ? `${this.formatSlug(this.slug())} Collection` : 'Shop premium fashion for every Pakistani season');
  pageIntro = computed(() => this.slug()
    ? `Explore ${this.formatSlug(this.slug()).toLowerCase()} picks from UR-Fashion with premium styling, COD support and nationwide delivery.`
    : 'Discover lawn, unstitched suits, ready-to-wear, wedding edits and sale picks with COD and nationwide delivery.'
  );

  constructor() {
    effect(() => {
      const slug = this.slug();
      const categoryLabel = slug ? this.formatSlug(slug) : '';
      const title = slug ? `${categoryLabel} Collection` : 'Shop All';
      const description = slug
        ? `Shop ${categoryLabel} styles at UR-Fashion with COD, seasonal campaign picks, and delivery across Pakistan.`
        : 'Explore all UR-Fashion collections including Eid, lawn, ready-to-wear, wedding edits, and sale picks.';
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

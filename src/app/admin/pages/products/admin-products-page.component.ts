import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminProductsService } from '../../services/admin-products.service';
import { AdminFeaturedFilter, AdminProductSort, AdminProductStatusFilter, AdminStockFilter } from '../../models/admin-catalog.models';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge.component';
import { AdminActionButtonComponent } from '../../components/admin-action-button.component';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, AdminStatusBadgeComponent, AdminActionButtonComponent],
  templateUrl: './admin-products-page.component.html',
  styleUrl: './admin-products-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsPageComponent {
  readonly service = inject(AdminProductsService);

  readonly search = signal('');
  readonly categoryId = signal('');
  readonly status = signal<AdminProductStatusFilter>('all');
  readonly featured = signal<AdminFeaturedFilter>('all');
  readonly stock = signal<AdminStockFilter>('all');
  readonly sort = signal<AdminProductSort>('newest');
  readonly busyId = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);

  readonly isLoading = this.service.isLoading;
  readonly categories = this.service.categories;
  readonly filteredProducts = computed(() =>
    this.service.filterProducts(this.service.productList(), {
      search: this.search(),
      categoryId: this.categoryId(),
      status: this.status(),
      featured: this.featured(),
      stock: this.stock(),
      sort: this.sort(),
    })
  );
  readonly productStats = computed(() => {
    const items = this.service.productList();
    return [
      { label: 'Total', value: items.length },
      { label: 'Published', value: items.filter(item => item.record.is_active).length },
      { label: 'Featured', value: items.filter(item => item.record.is_featured).length },
      { label: 'Low stock', value: items.filter(item => item.record.stock_quantity > 0 && item.record.stock_quantity <= 5).length },
    ];
  });
  readonly hasActiveFilters = computed(() => Boolean(
    this.search().trim() ||
    this.categoryId() ||
    this.status() !== 'all' ||
    this.featured() !== 'all' ||
    this.stock() !== 'all' ||
    this.sort() !== 'newest'
  ));

  constructor() {
    void this.load();
  }

  clearFilters() {
    this.search.set('');
    this.categoryId.set('');
    this.status.set('all');
    this.featured.set('all');
    this.stock.set('all');
    this.sort.set('newest');
  }

  async toggleActive(productId: string, nextState: boolean) {
    const product = this.service.products().find(item => item.id === productId);
    if (!product) return;
    await this.runBusy(
      productId,
      () => this.service.toggleProductActive(product, nextState),
      nextState ? `"${product.name}" is now published.` : `"${product.name}" is now saved as a draft.`
    );
  }

  async toggleFeatured(productId: string, nextState: boolean) {
    const product = this.service.products().find(item => item.id === productId);
    if (!product) return;
    await this.runBusy(
      productId,
      () => this.service.toggleProductFeatured(product, nextState),
      nextState ? `"${product.name}" is now featured.` : `"${product.name}" was removed from featured products.`
    );
  }

  async deleteProduct(productId: string, productName: string) {
    const confirmed = typeof window === 'undefined'
      ? false
      : window.confirm(`Delete "${productName}" permanently?\n\nThis removes the product from the admin catalog and cannot be undone.`);
    if (!confirmed) return;
    await this.runBusy(productId, () => this.service.deleteProduct(productId), `"${productName}" was deleted.`);
  }

  private async load() {
    this.actionError.set(null);
    try {
      await this.service.load();
    } catch (error) {
      this.actionError.set(error instanceof Error ? error.message : 'Unable to load products.');
    }
  }

  private async runBusy(id: string, action: () => Promise<void>, successMessage?: string) {
    this.busyId.set(id);
    this.actionError.set(null);
    this.actionSuccess.set(null);
    try {
      await action();
      if (successMessage) {
        this.actionSuccess.set(successMessage);
      }
    } catch (error) {
      this.actionError.set(error instanceof Error ? error.message : 'Product action failed.');
    } finally {
      this.busyId.set(null);
    }
  }
}

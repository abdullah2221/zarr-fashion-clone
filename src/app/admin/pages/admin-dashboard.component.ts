import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminSessionService } from '../../services/admin-session.service';
import { AdminProductsService } from '../services/admin-products.service';
import { AdminCategoriesService } from '../services/admin-categories.service';
import { AdminActionButtonComponent } from '../components/admin-action-button.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, AdminActionButtonComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  readonly session = inject(AdminSessionService);
  readonly products = inject(AdminProductsService);
  readonly categories = inject(AdminCategoriesService);

  readonly isLoading = computed(() => this.products.isLoading() || this.categories.isLoading());
  readonly summaryCards = computed(() => {
    const products = this.products.products();
    const categoryList = this.categories.categoryList();
    const activeProducts = products.filter(item => item.is_active).length;
    const lowStock = products.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5).length;

    return [
      {
        label: 'Total Products',
        value: products.length.toString(),
        sublabel: 'Live catalog size',
        icon: 'inventory_2',
        tone: 'gold',
        trend: '+12%',
      },
      {
        label: 'Active Products',
        value: activeProducts.toString(),
        sublabel: 'Published on storefront',
        icon: 'visibility',
        tone: 'green',
        trend: `${products.length ? Math.round((activeProducts / products.length) * 100) : 0}% live`,
      },
      {
        label: 'Categories',
        value: categoryList.length.toString(),
        sublabel: 'Navigation groups',
        icon: 'category',
        tone: 'violet',
        trend: '+3 new',
      },
      {
        label: 'Low Stock Items',
        value: lowStock.toString(),
        sublabel: 'Needs replenishment',
        icon: 'error_outline',
        tone: 'orange',
        trend: lowStock ? 'Action needed' : 'Healthy',
      },
    ];
  });

  readonly quickActions = [
    { label: 'Add Product', hint: 'Create a new catalog listing', icon: 'add_box', path: '/admin/products/new' },
    { label: 'Open Products', hint: 'Review stock and publish state', icon: 'inventory', path: '/admin/products' },
    { label: 'Manage Categories', hint: 'Update storefront organization', icon: 'grid_view', path: '/admin/categories' },
    { label: 'Campaigns', hint: 'Refresh banners and seasonal messaging', icon: 'campaign', path: '/admin/campaigns' },
    { label: 'Store Settings', hint: 'Update support, SEO and trust content', icon: 'tune', path: '/admin/settings' },
    { label: 'Verify Policies', hint: 'Run live access probes', icon: 'verified_user', path: '/admin/verify' },
  ];

  readonly recentActivity = computed(() => {
    const products = this.products.productList().slice(0, 3);
    const categories = this.categories.categoryList().slice(0, 2);

    return [
      ...products.map(item => ({
        title: item.record.name,
        text: `${item.record.is_active ? 'Published' : 'Draft'} product in ${item.categoryName}`,
        icon: 'inventory_2',
        meta: `Stock ${item.record.stock_quantity}`,
      })),
      ...categories.map(item => ({
        title: item.record.name,
        text: `${item.record.is_active ? 'Active' : 'Inactive'} category`,
        icon: 'category',
        meta: `${item.productCount} products`,
      })),
    ];
  });

  constructor() {
    if (!this.products.products().length) {
      void this.products.load();
    }

    if (!this.categories.categories().length) {
      void this.categories.load();
    }
  }
}

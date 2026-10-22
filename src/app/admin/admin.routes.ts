import { Routes } from '@angular/router';
import { adminGuard } from '../core/guards/admin.guard';
import { authGuard } from '../core/guards/auth.guard';
import { superAdminGuard } from '../core/guards/super-admin.guard';
import { AdminShellComponent } from './components/admin-shell.component';
import { AdminCampaignsPageComponent } from './pages/campaigns/admin-campaigns-page.component';
import { AdminCategoriesPageComponent } from './pages/categories/admin-categories-page.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';
import { AdminVerifyComponent } from './pages/admin-verify.component';
import { AdminProductEditorPageComponent } from './pages/products/admin-product-editor-page.component';
import { AdminProductsPageComponent } from './pages/products/admin-products-page.component';
import { AdminOrderDetailPageComponent } from './pages/orders/admin-order-detail-page.component';
import { AdminOrdersPageComponent } from './pages/orders/admin-orders-page.component';
import { AdminSettingsPageComponent } from './pages/settings/admin-settings-page.component';
import { AdminPagesPageComponent } from './pages/pages/admin-pages-page.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardComponent, title: 'Admin Dashboard | Zeenat' },
      { path: 'verify', component: AdminVerifyComponent, title: 'Admin Verification | Zeenat' },
      { path: 'products', component: AdminProductsPageComponent, title: 'Products | Zeenat Admin' },
      { path: 'products/new', component: AdminProductEditorPageComponent, title: 'New Product | Zeenat Admin' },
      { path: 'products/:id', component: AdminProductEditorPageComponent, title: 'Edit Product | Zeenat Admin' },
      { path: 'categories', component: AdminCategoriesPageComponent, title: 'Categories | Zeenat Admin' },
      { path: 'campaigns', component: AdminCampaignsPageComponent, title: 'Campaigns | Zeenat Admin' },
      { path: 'pages', component: AdminPagesPageComponent, title: 'Pages | Zeenat Admin' },
      { path: 'orders', component: AdminOrdersPageComponent, title: 'Orders | Zeenat Admin' },
      { path: 'orders/:id', component: AdminOrderDetailPageComponent, title: 'Order Detail | Zeenat Admin' },
      { path: 'settings', component: AdminSettingsPageComponent, title: 'Settings | Zeenat Admin', canActivate: [superAdminGuard] },
    ],
  },
];

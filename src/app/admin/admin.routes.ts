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

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardComponent, title: 'Admin Dashboard | UR-Fashion' },
      { path: 'verify', component: AdminVerifyComponent, title: 'Admin Verification | UR-Fashion' },
      { path: 'products', component: AdminProductsPageComponent, title: 'Products | UR-Fashion Admin' },
      { path: 'products/new', component: AdminProductEditorPageComponent, title: 'New Product | UR-Fashion Admin' },
      { path: 'products/:id', component: AdminProductEditorPageComponent, title: 'Edit Product | UR-Fashion Admin' },
      { path: 'categories', component: AdminCategoriesPageComponent, title: 'Categories | UR-Fashion Admin' },
      { path: 'campaigns', component: AdminCampaignsPageComponent, title: 'Campaigns | UR-Fashion Admin' },
      { path: 'orders', component: AdminOrdersPageComponent, title: 'Orders | UR-Fashion Admin' },
      { path: 'orders/:id', component: AdminOrderDetailPageComponent, title: 'Order Detail | UR-Fashion Admin' },
      { path: 'settings', component: AdminSettingsPageComponent, title: 'Settings | UR-Fashion Admin', canActivate: [superAdminGuard] },
    ],
  },
];

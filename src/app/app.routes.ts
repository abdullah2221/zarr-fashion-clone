import { Routes } from '@angular/router';
import { customerGuard } from './core/guards/customer.guard';
import { guestOnlyGuard } from './core/guards/guest-only.guard';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(module => module.ADMIN_ROUTES),
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(module => module.HomeComponent),
    title: 'UR-Fashion | Premium Pakistani Fashion',
    data: { description: 'Premium Pakistani fashion storefront for Eid, lawn, wedding and ready-to-wear collections.' }
  },
  {
    path: 'shop',
    loadComponent: () => import('./pages/shop/shop.component').then(module => module.ShopComponent),
    title: 'Shop | UR-Fashion',
    data: { description: 'Shop all UR-Fashion collections with Cash on Delivery and delivery across Pakistan.' }
  },
  {
    path: 'category/:slug',
    loadComponent: () => import('./pages/shop/shop.component').then(module => module.ShopComponent),
    title: 'Category | UR-Fashion',
    data: { description: 'Browse category collections on UR-Fashion with seasonal Pakistani fashion edits.' }
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(module => module.ProductDetailComponent),
    title: 'Product Details | UR-Fashion',
    data: { description: 'View product details, prices, and collection metadata on UR-Fashion.' }
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(module => module.CartComponent),
    title: 'Your Cart | UR-Fashion',
    data: { description: 'Review your selected products in the UR-Fashion shopping cart.' }
  },
  { path: 'wishlist', loadComponent: () => import('./pages/wishlist/wishlist.component').then(module => module.WishlistComponent), title: 'Wishlist | UR-Fashion', data: { description: 'Saved favorites on UR-Fashion.' } },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(module => module.CheckoutComponent), title: 'Checkout | UR-Fashion', data: { description: 'Complete your UR-Fashion COD checkout.' } },
  { path: 'order-confirmation/:id', loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then(module => module.OrderConfirmationComponent), title: 'Order Confirmation | UR-Fashion' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(module => module.LoginComponent), canActivate: [guestOnlyGuard], title: 'Login | UR-Fashion' },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(module => module.SignupComponent), canActivate: [guestOnlyGuard], title: 'Signup | UR-Fashion' },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(module => module.ForgotPasswordComponent), canActivate: [guestOnlyGuard], title: 'Forgot Password | UR-Fashion' },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password.component').then(module => module.ResetPasswordComponent), canActivate: [guestOnlyGuard], title: 'Reset Password | UR-Fashion' },
  { path: 'account', loadComponent: () => import('./pages/account/account.component').then(module => module.AccountComponent), canActivate: [customerGuard], title: 'Account | UR-Fashion' },
  { path: 'orders', loadComponent: () => import('./pages/customer-orders/customer-orders.component').then(module => module.CustomerOrdersComponent), canActivate: [customerGuard], title: 'My Orders | UR-Fashion' },
  { path: 'orders/:id', loadComponent: () => import('./pages/customer-order-detail/customer-order-detail.component').then(module => module.CustomerOrderDetailComponent), canActivate: [customerGuard], title: 'Order Detail | UR-Fashion' },
  { path: 'track-order', loadComponent: () => import('./pages/order-tracking/order-tracking.component').then(module => module.OrderTrackingComponent), title: 'Track Order | UR-Fashion' },
  { path: 'contact', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Contact | UR-Fashion', data: { page: 'contact' } },
  { path: 'about', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'About | UR-Fashion', data: { page: 'about' } },
  { path: 'faq', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'FAQ | UR-Fashion', data: { page: 'faq' } },
  { path: 'privacy-policy', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Privacy Policy | UR-Fashion', data: { page: 'privacy-policy' } },
  { path: 'terms', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Terms | UR-Fashion', data: { page: 'terms-conditions' } },
  { path: 'terms-conditions', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Terms & Conditions | UR-Fashion', data: { page: 'terms-conditions' } },
  { path: 'return-exchange', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Return & Exchange | UR-Fashion', data: { page: 'return-exchange-policy' } },
  { path: 'return-exchange-policy', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Return / Exchange Policy | UR-Fashion', data: { page: 'return-exchange-policy' } },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(module => module.NotFoundComponent),
    title: '404 | UR-Fashion'
  }
];

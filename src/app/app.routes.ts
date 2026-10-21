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
    title: 'Zeenat | Premium Pakistani Fashion',
    data: { description: 'Premium Pakistani fashion storefront for Eid, lawn, wedding and ready-to-wear collections.' }
  },
  {
    path: 'shop',
    loadComponent: () => import('./pages/shop/shop.component').then(module => module.ShopComponent),
    title: 'Shop | Zeenat',
    data: { description: 'Shop all Zeenat collections with Cash on Delivery and delivery across Pakistan.' }
  },
  {
    path: 'category/:slug',
    loadComponent: () => import('./pages/shop/shop.component').then(module => module.ShopComponent),
    title: 'Category | Zeenat',
    data: { description: 'Browse category collections on Zeenat with seasonal Pakistani fashion edits.' }
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(module => module.ProductDetailComponent),
    title: 'Product Details | Zeenat',
    data: { description: 'View product details, prices, and collection metadata on Zeenat.' }
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(module => module.CartComponent),
    title: 'Your Cart | Zeenat',
    data: { description: 'Review your selected products in the Zeenat shopping cart.' }
  },
  { path: 'wishlist', loadComponent: () => import('./pages/wishlist/wishlist.component').then(module => module.WishlistComponent), title: 'Wishlist | Zeenat', data: { description: 'Saved favorites on Zeenat.' } },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(module => module.CheckoutComponent), title: 'Checkout | Zeenat', data: { description: 'Complete your Zeenat COD checkout.' } },
  { path: 'order-confirmation/:id', loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then(module => module.OrderConfirmationComponent), title: 'Order Confirmation | Zeenat' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(module => module.LoginComponent), canActivate: [guestOnlyGuard], title: 'Login | Zeenat' },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(module => module.SignupComponent), canActivate: [guestOnlyGuard], title: 'Signup | Zeenat' },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(module => module.ForgotPasswordComponent), canActivate: [guestOnlyGuard], title: 'Forgot Password | Zeenat' },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password.component').then(module => module.ResetPasswordComponent), canActivate: [guestOnlyGuard], title: 'Reset Password | Zeenat' },
  { path: 'account', loadComponent: () => import('./pages/account/account.component').then(module => module.AccountComponent), canActivate: [customerGuard], title: 'Account | Zeenat' },
  { path: 'orders', loadComponent: () => import('./pages/customer-orders/customer-orders.component').then(module => module.CustomerOrdersComponent), canActivate: [customerGuard], title: 'My Orders | Zeenat' },
  { path: 'orders/:id', loadComponent: () => import('./pages/customer-order-detail/customer-order-detail.component').then(module => module.CustomerOrderDetailComponent), canActivate: [customerGuard], title: 'Order Detail | Zeenat' },
  { path: 'track-order', loadComponent: () => import('./pages/order-tracking/order-tracking.component').then(module => module.OrderTrackingComponent), title: 'Track Order | Zeenat' },
  { path: 'contact', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Contact | Zeenat', data: { page: 'contact' } },
  { path: 'about', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'About | Zeenat', data: { page: 'about' } },
  { path: 'faq', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'FAQ | Zeenat', data: { page: 'faq' } },
  { path: 'privacy-policy', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Privacy Policy | Zeenat', data: { page: 'privacy-policy' } },
  { path: 'terms', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Terms | Zeenat', data: { page: 'terms-conditions' } },
  { path: 'terms-conditions', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Terms & Conditions | Zeenat', data: { page: 'terms-conditions' } },
  { path: 'return-exchange', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Return & Exchange | Zeenat', data: { page: 'return-exchange-policy' } },
  { path: 'return-exchange-policy', loadComponent: () => import('./pages/static-page/static-page.component').then(module => module.StaticPageComponent), title: 'Return / Exchange Policy | Zeenat', data: { page: 'return-exchange-policy' } },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(module => module.NotFoundComponent),
    title: '404 | Zeenat'
  }
];

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { StaticPageComponent } from './pages/static-page/static-page.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(module => module.ADMIN_ROUTES),
  },
  {
    path: '',
    component: HomeComponent,
    title: 'UR-Fashion | Premium Pakistani Fashion',
    data: { description: 'Premium Pakistani fashion storefront for Eid, lawn, wedding and ready-to-wear collections.' }
  },
  {
    path: 'shop',
    component: ShopComponent,
    title: 'Shop | UR-Fashion',
    data: { description: 'Shop all UR-Fashion collections with Cash on Delivery and delivery across Pakistan.' }
  },
  {
    path: 'category/:slug',
    component: ShopComponent,
    title: 'Category | UR-Fashion',
    data: { description: 'Browse category collections on UR-Fashion with seasonal Pakistani fashion edits.' }
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    title: 'Product Details | UR-Fashion',
    data: { description: 'View product details, prices, and collection metadata on UR-Fashion.' }
  },
  {
    path: 'cart',
    component: CartComponent,
    title: 'Your Cart | UR-Fashion',
    data: { description: 'Review your selected products in the UR-Fashion shopping cart.' }
  },
  { path: 'wishlist', component: WishlistComponent, title: 'Wishlist | UR-Fashion', data: { description: 'Saved favorites on UR-Fashion.' } },
  { path: 'checkout', component: StaticPageComponent, title: 'Checkout | UR-Fashion', data: { page: 'checkout' } },
  { path: 'login', component: StaticPageComponent, title: 'Login / Register | UR-Fashion', data: { page: 'login' } },
  { path: 'account', component: StaticPageComponent, title: 'Account | UR-Fashion', data: { page: 'account' } },
  { path: 'track-order', component: StaticPageComponent, title: 'Track Order | UR-Fashion', data: { page: 'track-order' } },
  { path: 'contact', component: StaticPageComponent, title: 'Contact | UR-Fashion', data: { page: 'contact' } },
  { path: 'about', component: StaticPageComponent, title: 'About | UR-Fashion', data: { page: 'about' } },
  { path: 'faq', component: StaticPageComponent, title: 'FAQ | UR-Fashion', data: { page: 'faq' } },
  { path: 'privacy-policy', component: StaticPageComponent, title: 'Privacy Policy | UR-Fashion', data: { page: 'privacy-policy' } },
  { path: 'terms', component: StaticPageComponent, title: 'Terms | UR-Fashion', data: { page: 'terms-conditions' } },
  { path: 'terms-conditions', component: StaticPageComponent, title: 'Terms & Conditions | UR-Fashion', data: { page: 'terms-conditions' } },
  { path: 'return-exchange', component: StaticPageComponent, title: 'Return & Exchange | UR-Fashion', data: { page: 'return-exchange-policy' } },
  { path: 'return-exchange-policy', component: StaticPageComponent, title: 'Return / Exchange Policy | UR-Fashion', data: { page: 'return-exchange-policy' } },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 | UR-Fashion'
  }
];

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Zarr Fashion | Premium Style'
  },
  {
    path: 'shop',
    component: ShopComponent,
    title: 'Shop | Zarr Fashion'
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    title: 'Product Details | Zarr Fashion'
  },
  {
    path: 'cart',
    component: CartComponent,
    title: 'Your Cart | Zarr Fashion'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

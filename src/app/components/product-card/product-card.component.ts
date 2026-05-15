import { Component, HostListener, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../shared/models/models';
import { CartService } from '../../services/cart.service';
import { BadgeComponent } from '../badge/badge.component';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { WishlistService } from '../../services/wishlist.service';
import { ProductBadgeRowComponent } from '../product-badge-row/product-badge-row.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, PricePipe, MatIconModule, ProductBadgeRowComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  product = input.required<Product>();
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  quickViewOpen = signal(false);

  addToCart(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(this.product());
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistService.toggle(this.product());
  }

  inWishlist() {
    return this.wishlistService.isInWishlist(this.product().id);
  }

  openQuickView(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.quickViewOpen.set(true);
  }

  closeQuickView(event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();
    this.quickViewOpen.set(false);
  }

  onQuickPanelClick(event: Event) {
    event.stopPropagation();
    this.quickViewOpen.set(false);
  }

  stopQuickDialogClick(event: Event) {
    event.stopPropagation();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.quickViewOpen()) {
      this.quickViewOpen.set(false);
    }
  }
}

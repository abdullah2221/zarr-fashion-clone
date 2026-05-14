import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../shared/models/models';

export interface CartItem extends Product {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  items = this.cartItems.asReadonly();

  count = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + item.quantity, 0);
  });

  total = computed(() => {
    return this.cartItems().reduce((acc, item) => {
      const price = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
      return acc + (price * item.quantity);
    }, 0);
  });

  addToCart(product: Product) {
    this.cartItems.update(items => {
      const existingItem = items.find(i => i.id === product.id);
      if (existingItem) {
        return items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      // Ensure 'image' property exists for templates
      const newItem = { ...product, quantity: 1, image: product.imageUrl };
      return [...items, newItem];
    });
  }

  removeFromCart(productId: number | string) {
    const id = typeof productId === 'string' ? Number(productId) : productId;
    this.cartItems.update(items => items.filter(i => i.id !== id));
  }

  updateQuantity(productId: number | string, quantity: number) {
    const id = typeof productId === 'string' ? Number(productId) : productId;
    if (quantity <= 0) {
      this.removeFromCart(id);
      return;
    }
    this.cartItems.update(items => 
      items.map(i => i.id === id ? { ...i, quantity } : i)
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }
}

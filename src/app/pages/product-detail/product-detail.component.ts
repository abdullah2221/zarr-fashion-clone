import { ChangeDetectionStrategy, Component, inject, input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { MetaService } from '../../core/services/meta.service';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, PricePipe, RouterLink, MatIconModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  id = input.required<string>();
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private metaService = inject(MetaService);

  product = computed(() => this.productService.getProductById(Number(this.id())));

  constructor() {
    effect(() => {
      const p = this.product();
      if (p) {
        this.metaService.updateMeta(
          p.name,
          p.description || '',
          p.imageUrl
        );
      }
    });
  }

  addToCart() {
    const p = this.product();
    if (p) {
      this.cartService.addToCart(p);
    }
  }
}


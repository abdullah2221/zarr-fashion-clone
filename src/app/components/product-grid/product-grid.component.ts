import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../shared/models/models';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="product-grid">
      @for (product of products(); track product.id) {
        <app-product-card [product]="product"></app-product-card>
      } @empty {
        <div class="product-grid__empty">
          <strong>No pieces match this edit yet</strong>
          <span>Try another collection while new arrivals are being prepared.</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-grid {
      display: grid;
      gap: 1.25rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
    }
    .product-grid app-product-card {
      height: 100%;
    }
    .product-grid__empty {
      grid-column: 1 / -1;
      min-height: 240px;
      display: grid;
      place-items: center;
      align-content: center;
      gap: .5rem;
      background: #fbf8f1;
      color: #6b7280;
      font-size: .875rem;
      text-align: center;
      padding: 2rem;
    }
    .product-grid__empty strong {
      color: #111111;
      font-size: 1rem;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .product-grid__empty span {
      max-width: 28rem;
    }
    @media (min-width: 768px) {
      .product-grid { gap: 1.75rem; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (min-width: 1180px) {
      .product-grid { gap: 1.65rem; grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    @media (min-width: 1536px) {
      .product-grid { gap: 2rem; grid-template-columns: repeat(5, minmax(0, 1fr)); }
    }
    @media (max-width: 360px) {
      .product-grid { gap: .875rem; }
    }
  `]
})
export class ProductGridComponent {
  products = input.required<Product[]>();
}

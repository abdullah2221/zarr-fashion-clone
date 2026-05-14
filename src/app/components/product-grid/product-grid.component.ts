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
      }
    </div>
  `,
  styles: [`
    .product-grid {
      display: grid;
      gap: 2rem;
      grid-template-columns: repeat(2, 1fr);

      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `]
})
export class ProductGridComponent {
  products = input.required<Product[]>();
}

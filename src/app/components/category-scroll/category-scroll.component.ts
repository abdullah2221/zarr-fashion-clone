import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-category-scroll',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-scroll.component.html',
  styleUrl: './category-scroll.component.scss'
})
export class CategoryScrollComponent {
  private readonly productService = inject(ProductService);

  /** Optional per-section item limit from the section payload (Phase 7). */
  readonly limit = input<number | null>(null);

  private readonly allCategories = this.productService.getCategories();
  readonly categories = computed(() => {
    const all = this.allCategories();
    const limit = this.limit();
    return limit ? all.slice(0, limit) : all;
  });
  isLoading = this.productService.isLoading;
  error = this.productService.error;
}

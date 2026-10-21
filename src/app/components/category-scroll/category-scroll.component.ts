import { Component, inject } from '@angular/core';
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

  categories = this.productService.getCategories();
  isLoading = this.productService.isLoading;
  error = this.productService.error;
}

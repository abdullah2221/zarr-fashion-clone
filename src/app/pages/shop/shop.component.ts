import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGridComponent } from '../../components/product-grid/product-grid.component';
import { ProductService } from '../../services/product.service';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ProductGridComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopComponent implements OnInit {
  private productService = inject(ProductService);
  private metaService = inject(MetaService);
  
  products = this.productService.getProducts();

  ngOnInit() {
    this.metaService.updateMeta(
      'Shop All',
      'Explore our full collection of premium fashion. Find your perfect style at Zarr Fashion.'
    );
  }
}

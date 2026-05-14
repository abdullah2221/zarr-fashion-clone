import { Component, input, ElementRef, ViewChild } from '@angular/core';
import { Product } from '../../shared/models/models';
import { ProductCardComponent } from '../product-card/product-card.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [ProductCardComponent, MatIconModule],
  templateUrl: './product-carousel.component.html',
  styleUrl: './product-carousel.component.scss'
})
export class ProductCarouselComponent {
  title = input.required<string>();
  products = input.required<Product[]>();
  sideBannerTitle = input<string>();
  sideBannerText = input<string>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  scrollLeft() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }
}

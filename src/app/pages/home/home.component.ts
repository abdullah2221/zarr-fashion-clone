import { ChangeDetectionStrategy, Component, AfterViewInit, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { CategoryScrollComponent } from '../../components/category-scroll/category-scroll.component';
import { FeaturedCollectionsComponent } from '../../components/featured-collections/featured-collections.component';
import { ProductCarouselComponent } from '../../components/product-carousel/product-carousel.component';
import { BrandsGalleryComponent } from '../../components/brands-gallery/brands-gallery.component';
import { OffersComponent } from '../../components/offers/offers.component';
import { ProductService } from '../../services/product.service';
import { MetaService } from '../../core/services/meta.service';
import { animate, inView } from 'motion';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    CategoryScrollComponent,
    FeaturedCollectionsComponent,
    ProductCarouselComponent,
    BrandsGalleryComponent,
    OffersComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private productService = inject(ProductService);
  private metaService = inject(MetaService);

  popularProducts = this.productService.getPopularProducts();
  saleProducts = this.productService.getSaleProducts();

  ngOnInit() {
    this.metaService.updateMeta(
      'Home',
      'Premium fashion collections for women, men, and kids. Shop the latest trends at Zarr Fashion.'
    );
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const sections = document.querySelectorAll('.reveal-section');
      
      sections.forEach((section) => {
        inView(section, () => {
          animate(
            section, 
            { opacity: [0, 1], y: [50, 0] },
            { duration: 0.8, ease: [0.17, 0.55, 0.55, 1] }
          );
        }, { margin: "-100px" });
      });
    }
  }
}

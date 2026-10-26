import { ChangeDetectionStrategy, Component, AfterViewInit, computed, inject, PLATFORM_ID, OnInit, signal } from '@angular/core';
import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeroComponent } from '../../components/hero/hero.component';
import { CategoryScrollComponent } from '../../components/category-scroll/category-scroll.component';
import { FeaturedCollectionsComponent } from '../../components/featured-collections/featured-collections.component';
import { ProductCarouselComponent } from '../../components/product-carousel/product-carousel.component';
import { BrandsGalleryComponent } from '../../components/brands-gallery/brands-gallery.component';
import { OffersComponent } from '../../components/offers/offers.component';
import { FaqListComponent } from '../../components/faq-list/faq-list.component';
import { CustomContentComponent } from '../../components/custom-content/custom-content.component';
import { ProductService } from '../../services/product.service';
import { MetaService } from '../../core/services/meta.service';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { SitePagesService } from '../../services/site-pages.service';
import { TestimonialsService } from '../../services/testimonials.service';
import { EngagementService, SubscribeResult } from '../../services/engagement.service';
import { SitePageSection } from '../../shared/models/page-content.models';
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
    OffersComponent,
    FaqListComponent,
    CustomContentComponent,
    RouterLink,
    DecimalPipe,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private productService = inject(ProductService);
  private metaService = inject(MetaService);
  private readonly engagement = inject(EngagementService);
  readonly content = inject(StorefrontContentService);
  readonly pages = inject(SitePagesService);
  readonly testimonials = inject(TestimonialsService);

  /** Ordered homepage sections from Admin > Pages (page slug 'home'). */
  readonly sections = computed(() => this.pages.homeSections());

  popularProducts = this.productService.getPopularProducts();
  saleProducts = this.productService.getSaleProducts();

  newsletterEmail = '';
  readonly newsletterSubmitting = signal(false);
  readonly newsletterStatus = signal<SubscribeResult | null>(null);

  /** Applies a section's optional payload limit (Phase 7) to a list-backed section. */
  limited<T>(items: T[], section: SitePageSection): T[] {
    const limit = this.pages.sectionLimit(section);
    return limit ? items.slice(0, limit) : items;
  }

  async subscribeNewsletter(form: NgForm) {
    if (this.newsletterSubmitting()) return;
    if (form.invalid || !this.newsletterEmail.trim()) {
      this.newsletterStatus.set('error');
      return;
    }
    this.newsletterSubmitting.set(true);
    this.newsletterStatus.set(null);
    try {
      const result = await this.engagement.subscribe(this.newsletterEmail);
      this.newsletterStatus.set(result);
      if (result === 'success') {
        this.newsletterEmail = '';
        form.resetForm();
      }
    } finally {
      this.newsletterSubmitting.set(false);
    }
  }

  ngOnInit() {
    void this.pages.ensureLoaded('home');
    void this.testimonials.ensureLoaded();
    this.metaService.clearJsonLd(['seo-product-schema', 'seo-breadcrumb-schema']);
    this.metaService.setSeo({
      title: 'Home',
      description: this.content.settings().defaultSeoDescription,
      path: '/',
      keywords: 'Pakistani fashion, Eid collection, lawn collection, wedding wear, ready to wear, unstitched suits',
      type: 'website'
    });
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

import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { CampaignChipsComponent } from '../../components/campaign-chips/campaign-chips.component';
import { TrustBadgeStripComponent, TrustBadgeItem } from '../../components/trust-badge-strip/trust-badge-strip.component';
import { MetaService } from '../../core/services/meta.service';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { estimateDeliveryFee } from '../../shared/utils/delivery.utils';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, PricePipe, RouterLink, MatIconModule, EmptyStateComponent, CampaignChipsComponent, TrustBadgeStripComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  private metaService = inject(MetaService);
  items = this.cartService.items;
  total = this.cartService.total;

  private readonly content = inject(StorefrontContentService);
  readonly deliveryFee = computed(() =>
    estimateDeliveryFee(this.total(), this.content.settings().freeDeliveryThreshold, this.content.settings().deliveryFee),
  );
  readonly estimatedTotal = computed(() => this.total() + this.deliveryFee());
  promoNotice = signal<string | null>(null);

  campaignChips = ['Eid Collection', 'Ramadan Sale', 'Selling Fast', 'Limited Stock'];
  trustItems: TrustBadgeItem[] = [
    { icon: 'payments', label: 'Cash on Delivery' },
    { icon: 'autorenew', label: 'Easy exchange' },
    { icon: 'local_shipping', label: 'Delivery across Pakistan' },
    { icon: 'chat', label: 'WhatsApp support' }
  ];

  ngOnInit() {
    this.metaService.setSeo({
      title: 'Your Cart',
      description: 'Review your Zeenat cart before checkout with COD and delivery details.',
      path: '/cart',
      noindex: true
    });
    this.metaService.clearJsonLd(['seo-product-schema', 'seo-breadcrumb-schema']);
  }

  applyPromo() {
    this.promoNotice.set('Promo codes are not active yet. COD checkout will use the displayed total.');
  }
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MetaService } from '../../core/services/meta.service';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, DatePipe],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly metaService = inject(MetaService);
  private readonly checkout = inject(CheckoutService);

  readonly orderId = this.route.snapshot.paramMap.get('id') || '';
  readonly confirmation = computed(() => this.checkout.getConfirmationByOrderId(this.orderId));

  constructor() {
    this.metaService.setSeo({
      title: 'Order Confirmation',
      description: 'Your Zeenat order has been placed successfully.',
      path: `/order-confirmation/${this.orderId}`,
      noindex: true,
    });
  }
}

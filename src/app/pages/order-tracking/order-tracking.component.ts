import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaService } from '../../core/services/meta.service';
import { SupabaseOrderRepository } from '../../data-access/supabase/supabase.repositories';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTrackingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly meta = inject(MetaService);
  private readonly ordersRepo = inject(SupabaseOrderRepository);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<Awaited<ReturnType<SupabaseOrderRepository['findByOrderNumberAndPhone']> | null>>(null);
  readonly statusMessage = computed(() => {
    const order = this.result();
    if (!order) return '';
    switch (order.status) {
      case 'pending':
        return 'Your order is pending confirmation. Our team will contact you shortly for COD verification.';
      case 'confirmed':
      case 'packed':
        return 'Your order is confirmed and being prepared for dispatch.';
      case 'shipped':
        return 'Your order has been shipped. Keep your phone available for delivery updates.';
      case 'delivered':
        return 'Your order has been delivered. Thank you for shopping with UR-Fashion.';
      case 'cancelled':
        return 'This order was cancelled. Contact support if you need help placing a new order.';
      case 'returned':
        return 'This order was returned. Reach out to support for exchange assistance.';
      default:
        return 'Your order is being processed.';
    }
  });

  readonly form = this.fb.nonNullable.group({
    orderNumber: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    this.meta.setSeo({
      title: 'Track Order',
      description: 'Track your UR-Fashion order using order number and phone.',
      path: '/track-order',
      noindex: true,
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    this.error.set(null);
    this.result.set(null);
    if (this.form.invalid) {
      this.error.set('Please provide a valid order number and phone number.');
      return;
    }

    this.isLoading.set(true);
    try {
      const { orderNumber, phone } = this.form.getRawValue();
      const normalizedPhone = phone.replace(/\D/g, '');
      const tracked = await this.ordersRepo.findByOrderNumberAndPhone(orderNumber.trim(), normalizedPhone);
      if (!tracked) {
        this.error.set('No order found for these details. Please check and try again.');
        return;
      }
      this.result.set(tracked);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to track order right now.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

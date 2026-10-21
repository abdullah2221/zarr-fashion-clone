import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupabaseOrderRepository } from '../../data-access/supabase/supabase.repositories';
import { Tables } from '../../data-access/models/database.types';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-customer-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './customer-order-detail.component.html',
  styleUrl: './customer-order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerOrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersRepo = inject(SupabaseOrderRepository);
  private readonly content = inject(StorefrontContentService);
  private readonly meta = inject(MetaService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly order = signal<Tables<'orders'> | null>(null);
  readonly items = signal<Tables<'order_items'>[]>([]);
  readonly shippingInfo = computed(() => {
    const order = this.order();
    const payload = order?.shipping_address;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
    return payload as Record<string, string>;
  });
  readonly statusTimeline = computed(() => {
    const order = this.order();
    const current = order?.status || 'pending';
    const all = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
    return all.map(status => ({ status, done: all.indexOf(current) >= all.indexOf(status) }));
  });
  readonly whatsappSupportLink = computed(() => {
    const raw = this.content.settings().whatsappNumber || '';
    const digits = raw.replace(/\D/g, '');
    if (!digits) return null;
    return `https://wa.me/${digits}`;
  });

  constructor() {
    this.meta.setSeo({
      title: 'Order Detail',
      description: 'View your Zeenat order detail, delivery progress, and COD updates.',
      path: '/orders',
      noindex: true,
    });
    void this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) throw new Error('Order id is missing.');
      const order = await this.ordersRepo.getById(id);
      if (!order) throw new Error('Order not found.');
      this.order.set(order);
      this.items.set(await this.ordersRepo.listItems(id));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to load order.');
    } finally {
      this.loading.set(false);
    }
  }
}

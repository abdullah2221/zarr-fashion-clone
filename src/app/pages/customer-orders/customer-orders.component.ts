import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseOrderRepository } from '../../data-access/supabase/supabase.repositories';
import { Tables } from '../../data-access/models/database.types';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './customer-orders.component.html',
  styleUrl: './customer-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerOrdersComponent {
  private readonly ordersRepo = inject(SupabaseOrderRepository);
  private readonly meta = inject(MetaService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly orders = signal<Tables<'orders'>[]>([]);

  constructor() {
    this.meta.setSeo({
      title: 'My Orders',
      description: 'Track your UR-Fashion order history and status.',
      path: '/orders',
      noindex: true,
    });
    void this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.orders.set(await this.ordersRepo.listMine());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to load orders.');
    } finally {
      this.loading.set(false);
    }
  }

  statusLabel(status: Tables<'orders'>['status']) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

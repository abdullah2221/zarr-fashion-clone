import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminActionButtonComponent } from '../../components/admin-action-button.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge.component';
import { AdminOrdersService } from '../../services/admin-orders.service';
import { AdminOrderStatusFilter } from '../../models/admin-orders.models';

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, DatePipe, AdminActionButtonComponent, AdminStatusBadgeComponent],
  templateUrl: './admin-orders-page.component.html',
  styleUrl: './admin-orders-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersPageComponent {
  readonly service = inject(AdminOrdersService);

  readonly search = signal('');
  readonly status = signal<AdminOrderStatusFilter>('all');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly actionError = signal<string | null>(null);

  readonly isLoading = this.service.isLoading;
  readonly stats = this.service.stats;
  readonly statusOptions = this.service.statusOptions;
  readonly hasFilters = computed(() => Boolean(
    this.search().trim() ||
    this.status() !== 'all' ||
    this.dateFrom() ||
    this.dateTo()
  ));
  readonly result = computed(() => this.service.queryOrders({
    search: this.search(),
    status: this.status(),
    dateFrom: this.dateFrom(),
    dateTo: this.dateTo(),
  }, this.page(), this.pageSize()));
  readonly pageSummary = computed(() => {
    const result = this.result();
    if (!result.total) return 'No orders';
    const start = (result.page - 1) * result.pageSize + 1;
    const end = Math.min(result.total, result.page * result.pageSize);
    return `${start}-${end} of ${result.total} orders`;
  });

  constructor() {
    void this.load();
  }

  async load() {
    this.actionError.set(null);
    try {
      await this.service.load();
      this.page.set(1);
    } catch (error) {
      this.actionError.set(error instanceof Error ? error.message : 'Unable to load orders.');
    }
  }

  onFilterChanged() {
    this.page.set(1);
  }

  clearFilters() {
    this.search.set('');
    this.status.set('all');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.page.set(1);
  }

  prevPage() {
    this.page.update(value => Math.max(1, value - 1));
  }

  nextPage() {
    const totalPages = this.result().totalPages;
    this.page.update(value => Math.min(totalPages, value + 1));
  }
}

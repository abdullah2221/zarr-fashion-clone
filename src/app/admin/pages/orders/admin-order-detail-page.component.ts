import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrderStatus } from '../../../data-access/models/database.types';
import { AdminActionButtonComponent } from '../../components/admin-action-button.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge.component';
import { AdminOrdersService } from '../../services/admin-orders.service';

@Component({
  selector: 'app-admin-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, DatePipe, AdminActionButtonComponent, AdminStatusBadgeComponent],
  templateUrl: './admin-order-detail-page.component.html',
  styleUrl: './admin-order-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly service = inject(AdminOrdersService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly detail = signal<Awaited<ReturnType<AdminOrdersService['getOrderDetail']>>>(null);

  readonly selectedStatus = signal<OrderStatus>('pending');
  readonly statusNote = signal('');

  readonly verificationStatus = signal('');
  readonly courierName = signal('');
  readonly trackingNumber = signal('');
  readonly dispatchDate = signal('');
  readonly deliveredDate = signal('');

  readonly statusOptions = this.service.statusOptions;
  readonly orderAddress = computed(() => {
    const detail = this.detail();
    const raw = detail?.order.shipping_address;
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  });

  constructor() {
    void this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      const orderId = this.route.snapshot.paramMap.get('id');
      if (!orderId) {
        this.error.set('Order id is missing.');
        return;
      }
      const detail = await this.service.getOrderDetail(orderId);
      if (!detail) {
        this.error.set('Order not found.');
        return;
      }
      this.detail.set(detail);
      this.selectedStatus.set(detail.order.status);
      this.verificationStatus.set(this.stringField('verificationStatus'));
      this.courierName.set(this.stringField('courierName'));
      this.trackingNumber.set(this.stringField('trackingNumber'));
      this.dispatchDate.set(this.stringField('dispatchDate'));
      this.deliveredDate.set(this.stringField('deliveredDate'));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to load order detail.');
    } finally {
      this.loading.set(false);
    }
  }

  async updateStatus() {
    const detail = this.detail();
    if (!detail) return;
    this.error.set(null);
    this.success.set(null);
    try {
      await this.service.updateStatus(detail.order, this.selectedStatus(), this.statusNote());
      await this.load();
      this.statusNote.set('');
      this.success.set('Order status updated.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Status update failed.');
    }
  }

  async saveCodOps() {
    const detail = this.detail();
    if (!detail) return;
    this.error.set(null);
    this.success.set(null);
    try {
      await this.service.updateCodOperations(detail.order, {
        verificationStatus: this.verificationStatus(),
        courierName: this.courierName(),
        trackingNumber: this.trackingNumber(),
        dispatchDate: this.dispatchDate(),
        deliveredDate: this.deliveredDate(),
      });
      await this.load();
      this.success.set('COD operations data saved.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save COD details.');
    }
  }

  private stringField(field: string) {
    const value = this.orderAddress()[field];
    return typeof value === 'string' ? value : '';
  }
}

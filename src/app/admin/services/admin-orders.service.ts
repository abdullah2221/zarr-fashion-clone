import { Injectable, computed, inject, signal } from '@angular/core';
import { Json, OrderStatus, Tables } from '../../data-access/models/database.types';
import { SupabaseOrderRepository, SupabaseOrderStatusHistoryRepository, SupabaseProductRepository, SupabaseStorageRepository } from '../../data-access/supabase/supabase.repositories';
import {
  AdminOrderDetail,
  AdminOrderHistoryEntry,
  AdminOrderItemDetail,
  AdminOrderListFilters,
  AdminOrderListItem,
  AdminOrderListResult,
} from '../models/admin-orders.models';

type ShippingAddressRecord = Record<string, unknown>;

import { AdminActivityService } from './admin-activity.service';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private readonly activity = inject(AdminActivityService);
  private readonly orderRepository = inject(SupabaseOrderRepository);
  private readonly productRepository = inject(SupabaseProductRepository);
  private readonly storageRepository = inject(SupabaseStorageRepository);
  private readonly historyRepository = inject(SupabaseOrderStatusHistoryRepository);

  private readonly ordersSignal = signal<Tables<'orders'>[]>([]);
  private readonly loadingSignal = signal(false);
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly orders = this.ordersSignal.asReadonly();

  readonly statusOptions: OrderStatus[] = [
    'pending',
    'confirmed',
    'packed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ];

  readonly orderList = computed<AdminOrderListItem[]>(() => this.ordersSignal().map(order => this.mapOrder(order)));
  readonly stats = computed(() => {
    const list = this.orderList();
    return {
      total: list.length,
      pending: list.filter(item => item.record.status === 'pending').length,
      shipped: list.filter(item => item.record.status === 'shipped').length,
      delivered: list.filter(item => item.record.status === 'delivered').length,
    };
  });

  async load() {
    this.loadingSignal.set(true);
    try {
      const orders = await this.orderRepository.listAll();
      this.ordersSignal.set(orders);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  queryOrders(filters: AdminOrderListFilters, page: number, pageSize: number): AdminOrderListResult {
    const query = filters.search.trim().toLowerCase();
    const fromTime = filters.dateFrom ? Date.parse(`${filters.dateFrom}T00:00:00`) : null;
    const toTime = filters.dateTo ? Date.parse(`${filters.dateTo}T23:59:59`) : null;

    let list = this.orderList();

    if (query) {
      list = list.filter(item => {
        const haystack = [
          item.orderNumber,
          item.customerName,
          item.customerPhone,
          item.customerEmail,
          item.city,
          item.province,
        ].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    if (filters.status !== 'all') {
      list = list.filter(item => item.record.status === filters.status);
    }

    if (fromTime || toTime) {
      list = list.filter(item => {
        const createdTime = Date.parse(item.record.created_at);
        if (Number.isNaN(createdTime)) return false;
        if (fromTime && createdTime < fromTime) return false;
        if (toTime && createdTime > toTime) return false;
        return true;
      });
    }

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const normalizedPage = Math.min(Math.max(1, page), totalPages);
    const start = (normalizedPage - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return {
      items,
      total,
      page: normalizedPage,
      pageSize,
      totalPages,
    };
  }

  async getOrderDetail(orderId: string): Promise<AdminOrderDetail | null> {
    const order = await this.orderRepository.getById(orderId);
    if (!order) return null;

    const [items, products] = await Promise.all([
      this.orderRepository.listItems(order.id),
      this.productRepository.listAll(),
    ]);

    const productIds = [...new Set(items.map(item => item.product_id).filter(Boolean) as string[])];
    const imagesEntries = await Promise.all(productIds.map(async id => [id, await this.productRepository.getImages(id)] as const));
    const imagesByProductId = new Map(imagesEntries);
    const productsById = new Map(products.map(product => [product.id, product]));

    const detailItems = items.map(item => this.mapOrderItem(item, productsById, imagesByProductId));
    return {
      order,
      listItem: this.mapOrder(order),
      items: detailItems,
      history: await this.loadHistory(order),
    };
  }

  /**
   * Phase 7: status history comes from the order_status_history
   * table (written by the phase-8 trigger). Orders changed before
   * the trigger existed — or a database where the migration has not
   * run yet — fall back to the legacy JSON log the admin has always
   * appended inside shipping_address, so the timeline never breaks.
   */
  private async loadHistory(order: Tables<'orders'>): Promise<AdminOrderHistoryEntry[]> {
    try {
      const rows = await this.historyRepository.listByOrder(order.id);
      if (rows.length) {
        return rows.map(row => ({
          fromStatus: row.from_status,
          toStatus: row.to_status,
          note: row.note,
          changedAt: row.changed_at,
        }));
      }
    } catch {
      // Table missing (migration not run yet) — use the JSON log.
    }
    const metadata = this.asRecord(order.shipping_address);
    const legacy = Array.isArray(metadata['orderStatusHistory']) ? metadata['orderStatusHistory'] : [];
    return legacy
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const entry = item as Record<string, unknown>;
        return {
          fromStatus: typeof entry['from'] === 'string' ? entry['from'] : null,
          toStatus: typeof entry['to'] === 'string' ? entry['to'] : '',
          note: typeof entry['note'] === 'string' ? entry['note'] : null,
          changedAt: typeof entry['at'] === 'string' ? entry['at'] : '',
        };
      })
      .filter(entry => entry.toStatus);
  }

  async updateStatus(order: Tables<'orders'>, status: OrderStatus, note?: string) {
    const metadata = this.asRecord(order.shipping_address);
    metadata['orderStatusHistory'] = this.appendStatusHistory(metadata['orderStatusHistory'], order.status, status, note);
    await this.orderRepository.update(order.id, {
      status,
      shipping_address: metadata as Json,
      updated_at: new Date().toISOString(),
    });
    await this.load();
    await this.activity.log('order.status_changed', 'order', order.id, order.order_number ?? order.id, note ?? null);
  }

  async updateCodOperations(order: Tables<'orders'>, changes: {
    verificationStatus: string;
    courierName: string;
    trackingNumber: string;
    dispatchDate: string;
    deliveredDate: string;
  }) {
    const metadata = this.asRecord(order.shipping_address);
    metadata['verificationStatus'] = changes.verificationStatus || null;
    metadata['courierName'] = changes.courierName || null;
    metadata['trackingNumber'] = changes.trackingNumber || null;
    metadata['dispatchDate'] = changes.dispatchDate || null;
    metadata['deliveredDate'] = changes.deliveredDate || null;
    await this.orderRepository.update(order.id, {
      shipping_address: metadata as Json,
      updated_at: new Date().toISOString(),
    });
    await this.load();
    await this.activity.log('order.cod_updated', 'order', order.id, order.order_number ?? order.id);
  }

  statusTone(status: OrderStatus): 'success' | 'warning' | 'muted' | 'neutral' {
    if (status === 'delivered') return 'success';
    if (status === 'cancelled' || status === 'returned') return 'muted';
    if (status === 'packed' || status === 'shipped' || status === 'processing') return 'warning';
    return 'neutral';
  }

  formatStatus(status: string) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  private mapOrder(order: Tables<'orders'>): AdminOrderListItem {
    const address = this.asRecord(order.shipping_address);
    const orderNumber = this.stringValue(address['orderNumber']) || order.id.slice(0, 8).toUpperCase();
    const customerName = this.stringValue(address['customerName']) || 'Customer';
    const customerPhone = this.stringValue(address['customerPhone']) || 'N/A';
    const customerEmail = this.stringValue(address['customerEmail']) || 'N/A';
    const city = this.stringValue(address['city']) || 'N/A';
    const province = this.stringValue(address['province']) || 'N/A';
    const paymentMethod = this.stringValue(address['paymentMethod']) || 'COD';
    const verificationStatus = this.stringValue(address['verificationStatus']) || 'unverified';

    return {
      record: order,
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      city,
      province,
      paymentMethod,
      verificationStatus,
    };
  }

  private mapOrderItem(
    item: Tables<'order_items'>,
    productsById: Map<string, Tables<'products'>>,
    imagesByProductId: Map<string, Tables<'product_images'>[]>
  ): AdminOrderItemDetail {
    const metadataProduct = item.product_id ? productsById.get(item.product_id) : undefined;
    const metadata = metadataProduct ? this.asRecord(metadataProduct.metadata) : {};
    const productImages = item.product_id ? imagesByProductId.get(item.product_id) || [] : [];
    const primaryImage = [...productImages].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0];
    return {
      record: item,
      productImageUrl: primaryImage
        ? this.storageRepository.getProductImageUrl(primaryImage.storage_path)
        : '/images/product-placeholder.svg',
      size: this.stringValue(metadata['size']) || this.firstString(metadata['sizes']) || '-',
      color: this.stringValue(metadata['color']) || this.firstString(metadata['colors']) || '-',
    };
  }

  private appendStatusHistory(
    existing: unknown,
    fromStatus: string,
    toStatus: string,
    note?: string
  ): Array<{ at: string; from: string; to: string; note?: string }> {
    const current = Array.isArray(existing) ? existing.filter(item => item && typeof item === 'object') as Array<Record<string, unknown>> : [];
    return [
      ...current.map(entry => ({
        at: this.stringValue(entry['at']) || '',
        from: this.stringValue(entry['from']) || '',
        to: this.stringValue(entry['to']) || '',
        note: this.stringValue(entry['note']) || undefined,
      })).filter(entry => entry.at && entry.from && entry.to),
      {
        at: new Date().toISOString(),
        from: fromStatus,
        to: toStatus,
        note: note?.trim() || undefined,
      },
    ];
  }

  private asRecord(value: unknown): ShippingAddressRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as ShippingAddressRecord : {};
  }

  private stringValue(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  private firstString(value: unknown): string | undefined {
    return Array.isArray(value) && value.length && typeof value[0] === 'string' ? value[0] : undefined;
  }
}

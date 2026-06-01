import { OrderStatus, Tables } from '../../data-access/models/database.types';

export type AdminOrderStatusFilter = 'all' | OrderStatus;

export interface AdminOrderListItem {
  record: Tables<'orders'>;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  province: string;
  paymentMethod: string;
  verificationStatus: string;
}

export interface AdminOrderListFilters {
  search: string;
  status: AdminOrderStatusFilter;
  dateFrom: string;
  dateTo: string;
}

export interface AdminOrderListResult {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminOrderItemDetail {
  record: Tables<'order_items'>;
  productImageUrl: string;
  size: string;
  color: string;
}

export interface AdminOrderDetail {
  order: Tables<'orders'>;
  listItem: AdminOrderListItem;
  items: AdminOrderItemDetail[];
}

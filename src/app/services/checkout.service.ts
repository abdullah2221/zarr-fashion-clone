import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, CartService } from './cart.service';
import { ProductService } from './product.service';
import { SupabaseAuthRepository, SupabaseOrderRepository } from '../data-access/supabase/supabase.repositories';
import { PricePipe } from '../shared/pipes/price.pipe';

export interface CheckoutFormValue {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  notes: string;
}

interface NormalizedCheckoutItem {
  cartItem: CartItem;
  quantity: number;
  productName: string;
  sku: string | null;
  productId: string | null;
  unitPrice: number;
  lineTotal: number;
  size: string | null;
  color: string | null;
}

export interface CheckoutSuccessPayload {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  province: string;
  total: number;
  itemsCount: number;
  createdAtIso: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private static readonly CONFIRMATION_STORAGE_KEY = 'ur_fashion_last_order_v1';

  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly authRepository = inject(SupabaseAuthRepository);
  private readonly orderRepository = inject(SupabaseOrderRepository);
  private readonly pricePipe = new PricePipe();
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly confirmationSignal = signal<CheckoutSuccessPayload | null>(this.loadConfirmation());

  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly confirmation = this.confirmationSignal.asReadonly();
  readonly cartItems = this.cartService.items;
  readonly subtotal = this.cartService.total;
  readonly itemCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));

  async placeOrder(form: CheckoutFormValue): Promise<CheckoutSuccessPayload> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const normalizedItems = await this.validateAndNormalizeItems(this.cartItems());
      const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const shippingAmount = 0;
      const totalAmount = subtotal + shippingAmount;
      const now = new Date();
      const orderNumber = this.generateOrderNumber(now);
      const status = 'pending';
      const paymentMethod = 'cod';

      const addressPayload = {
        orderNumber,
        customerName: form.customerName.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email.trim() || null,
        address: form.address.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        paymentMethod,
        verificationStatus: 'pending',
      };

      const itemsPayload = normalizedItems.map(item => ({
        product_id: item.productId,
        product_name: item.productName,
        sku: item.sku,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        line_total: item.lineTotal,
        ...(item.size ? { size: item.size } : {}),
        ...(item.color ? { color: item.color } : {}),
      }));

      const user = await this.authRepository.getCurrentUser().catch(() => null);

      let orderId = '';
      let persistedOrderNumber = orderNumber;

      if (user) {
        const order = await this.orderRepository.create({
          user_id: user.id,
          status: 'pending',
          subtotal,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          currency: 'PKR',
          shipping_address: addressPayload,
          notes: form.notes.trim() || null,
        }, itemsPayload);
        orderId = order.id;
      } else {
        const result = await this.orderRepository.createGuestCheckout({
          customer_name: form.customerName.trim(),
          customer_phone: form.phone.trim(),
          customer_email: form.email.trim() || null,
          shipping_address: form.address.trim(),
          city: form.city.trim(),
          province: form.province.trim(),
          notes: form.notes.trim() || null,
          total_amount: totalAmount,
          subtotal,
          shipping_amount: shippingAmount,
          currency: 'PKR',
          payment_method: 'cod',
          status,
          items: itemsPayload,
        });
        orderId = result.order_id;
        persistedOrderNumber = result.order_number || orderNumber;
      }

      const confirmation: CheckoutSuccessPayload = {
        orderId,
        orderNumber: persistedOrderNumber,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        total: totalAmount,
        itemsCount: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
        createdAtIso: now.toISOString(),
      };

      this.cartService.clearCart();
      this.setConfirmation(confirmation);
      return confirmation;
    } catch (error) {
      const message = this.normalizeCheckoutError(error);
      this.errorSignal.set(message);
      throw new Error(message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  clearError() {
    this.errorSignal.set(null);
  }

  setError(message: string) {
    this.errorSignal.set(message);
  }

  getConfirmationByOrderId(orderId: string) {
    const confirmation = this.confirmationSignal();
    if (confirmation?.orderId === orderId) return confirmation;
    return null;
  }

  private async validateAndNormalizeItems(items: CartItem[]): Promise<NormalizedCheckoutItem[]> {
    if (!items.length) {
      throw new Error('Your cart is empty. Add items before checkout.');
    }

    let catalog = this.productService.getProducts()();
    if (!catalog.length || this.productService.isLoading()) {
      await this.productService.refreshCatalog();
      catalog = this.productService.getProducts()();
    }
    const catalogByLegacyId = new Map(catalog.map(product => [product.id, product]));

    return items.map(item => {
      const product = catalogByLegacyId.get(item.id);
      if (!product) {
        throw new Error(`Product "${item.name}" is no longer available.`);
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 20) {
        throw new Error(`Invalid quantity for "${item.name}".`);
      }

      const unitPrice = this.extractPrice(product.priceValue ?? product.price);
      if (unitPrice <= 0) {
        throw new Error(`Invalid price for "${item.name}".`);
      }

      const availableSizes = product.sizes || [];
      const selectedSize = item.selectedSize || null;
      if (availableSizes.length && (!selectedSize || !availableSizes.includes(selectedSize))) {
        throw new Error(`Please select a valid size for "${item.name}".`);
      }

      return {
        cartItem: item,
        quantity: item.quantity,
        productName: product.name,
        sku: product.catalogId ? `${product.brand}-${product.id}` : null,
        productId: product.catalogId || null,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        size: selectedSize,
        color: item.selectedColor || null,
      };
    });
  }

  private extractPrice(value: string | number) {
    return this.pricePipe.transform(value);
  }

  private normalizeCheckoutError(error: unknown) {
    const fallback = 'Unable to place the order right now. Please try again.';
    const raw = this.extractErrorMessage(error);
    if (!raw) return fallback;

    const message = raw.toLowerCase();
    if (message.includes('create_guest_order')) {
      return 'Checkout service is not fully available yet. Please contact support or try again shortly.';
    }
    if (message.includes('tracking_number') && message.includes('null')) {
      return 'Order system setup is incomplete for COD fields. Please apply the latest checkout SQL patch and retry.';
    }
    if (message.includes('row-level security') || message.includes('permission denied')) {
      return 'Order creation is blocked by security policy. Please contact support.';
    }
    return raw;
  }

  private extractErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) return error.message;
    if (error && typeof error === 'object') {
      const maybeMessage = (error as { message?: unknown }).message;
      if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
    }
    return '';
  }

  private generateOrderNumber(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const code = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `URF-${y}${m}${d}-${code}`;
  }

  private setConfirmation(value: CheckoutSuccessPayload) {
    this.confirmationSignal.set(value);
    if (this.isBrowser) {
      localStorage.setItem(CheckoutService.CONFIRMATION_STORAGE_KEY, JSON.stringify(value));
    }
  }

  private loadConfirmation(): CheckoutSuccessPayload | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(CheckoutService.CONFIRMATION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed as CheckoutSuccessPayload;
    } catch {
      return null;
    }
  }
}

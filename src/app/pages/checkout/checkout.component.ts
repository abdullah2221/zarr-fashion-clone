import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MetaService } from '../../core/services/meta.service';
import { CheckoutService } from '../../services/checkout.service';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, PricePipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly metaService = inject(MetaService);
  readonly checkout = inject(CheckoutService);

  readonly items = this.checkout.cartItems;
  readonly subtotal = this.checkout.subtotal;
  readonly itemCount = this.checkout.itemCount;
  readonly error = this.checkout.error;
  readonly loading = this.checkout.isLoading;
  readonly hasItems = computed(() => this.items().length > 0);
  readonly formError = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, this.phoneValidator]],
    email: ['', [Validators.email]],
    address: ['', [Validators.required, Validators.minLength(8)]],
    city: ['', [Validators.required]],
    province: ['', [Validators.required]],
    notes: [''],
  });

  constructor() {
    this.metaService.setSeo({
      title: 'Checkout',
      description: 'Complete your Cash on Delivery checkout for Zeenat.',
      path: '/checkout',
      noindex: true,
    });
  }

  async placeOrder() {
    this.checkout.clearError();
    this.formError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const message = this.firstValidationError();
      this.formError.set(message);
      this.checkout.setError(message);
      return;
    }
    try {
      const result = await this.checkout.placeOrder(this.form.getRawValue());
      await this.router.navigate(['/order-confirmation', result.orderId]);
    } catch {
      // handled by checkout service error signal
    }
  }

  private firstValidationError() {
    const { customerName, phone, email, address, city, province } = this.form.controls;
    if (customerName.hasError('required')) return 'Customer name is required.';
    if (customerName.hasError('minlength')) return 'Customer name must be at least 2 characters.';
    if (phone.hasError('required')) return 'Phone number is required.';
    if (phone.hasError('invalidPhone')) return 'Enter a valid phone number (at least 10 digits).';
    if (email.hasError('email')) return 'Please enter a valid email address.';
    if (address.hasError('required')) return 'Shipping address is required.';
    if (address.hasError('minlength')) return 'Shipping address must be at least 8 characters.';
    if (city.hasError('required')) return 'City is required.';
    if (province.hasError('required')) return 'Province is required.';
    return 'Please complete all required checkout fields.';
  }

  private phoneValidator(control: AbstractControl) {
    const value = String(control.value || '');
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 ? null : { invalidPhone: true };
  }
}

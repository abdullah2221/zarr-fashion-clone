import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminSessionService } from '../../services/admin-session.service';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly session = inject(AdminSessionService);
  private readonly router = inject(Router);
  private readonly meta = inject(MetaService);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, this.phoneValidator]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    newsletter: [true],
    termsAccepted: [false, [Validators.requiredTrue]],
  });

  constructor() {
    this.meta.setSeo({
      title: 'Signup',
      description: 'Create your Zeenat customer account for order tracking and faster checkout.',
      path: '/signup',
      noindex: true,
    });
  }

  async submit() {
    this.error.set(null);
    this.success.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set(this.firstValidationError());
      return;
    }
    const value = this.form.getRawValue();
    if (value.password !== value.confirmPassword) {
      this.error.set('Password and confirm password must match.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const result = await this.session.signUpCustomer({
        fullName: value.fullName,
        email: value.email,
        phone: value.phone,
        password: value.password,
      });
      if (result.requiresEmailVerification) {
        this.success.set('Account created. Please verify your email, then login.');
        await this.router.navigate(['/login'], { queryParams: { signup: 'success' } });
      } else {
        await this.router.navigateByUrl('/account');
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to create account.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private firstValidationError() {
    const fullName = this.form.controls.fullName;
    const email = this.form.controls.email;
    const phone = this.form.controls.phone;
    const password = this.form.controls.password;
    const confirmPassword = this.form.controls.confirmPassword;
    const termsAccepted = this.form.controls.termsAccepted;

    if (fullName.hasError('required')) return 'Full name is required.';
    if (fullName.hasError('minlength')) return 'Full name must be at least 2 characters.';

    if (email.hasError('required')) return 'Email is required.';
    if (email.hasError('email')) return 'Please enter a valid email address.';

    if (phone.hasError('required')) return 'Phone number is required.';
    if (phone.hasError('invalidPhone')) return 'Enter a valid phone number (at least 10 digits).';

    if (password.hasError('required')) return 'Password is required.';
    if (password.hasError('minlength')) return 'Password must be at least 6 characters.';

    if (confirmPassword.hasError('required')) return 'Confirm password is required.';
    if (confirmPassword.hasError('minlength')) return 'Confirm password must be at least 6 characters.';

    if (termsAccepted.hasError('required')) return 'Please accept terms and privacy policy.';
    if (termsAccepted.hasError('requiredTrue')) return 'Please accept terms and privacy policy.';

    return 'Please review the form fields and try again.';
  }

  private phoneValidator(control: AbstractControl) {
    const value = String(control.value || '');
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 ? null : { invalidPhone: true };
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminSessionService } from '../../services/admin-session.service';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
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
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    this.meta.setSeo({
      title: 'Reset Password',
      description: 'Create a new password for your UR-Fashion account.',
      path: '/reset-password',
      noindex: true,
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.error.set('Password and confirm password must match.');
      return;
    }
    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.session.updatePassword(password);
      this.success.set('Password updated successfully. Redirecting to login...');
      setTimeout(() => void this.router.navigateByUrl('/login'), 1000);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to reset password.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

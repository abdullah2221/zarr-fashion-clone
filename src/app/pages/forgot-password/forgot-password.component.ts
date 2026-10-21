import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminSessionService } from '../../services/admin-session.service';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly session = inject(AdminSessionService);
  private readonly meta = inject(MetaService);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.meta.setSeo({
      title: 'Forgot Password',
      description: 'Reset your Zeenat account password.',
      path: '/forgot-password',
      noindex: true,
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.session.resetPassword(this.form.getRawValue().email);
      this.success.set('Reset link sent. Check your email inbox.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to send reset email.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

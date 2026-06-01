import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminSessionService } from '../../services/admin-session.service';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly session = inject(AdminSessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly meta = inject(MetaService);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true],
  });

  constructor() {
    this.meta.setSeo({
      title: 'Login',
      description: 'Sign in to UR-Fashion for account, COD tracking, and faster checkout.',
      path: '/login',
      noindex: true,
    });
    if (this.route.snapshot.queryParamMap.get('signup') === 'success') {
      this.notice.set('Account created successfully. Please login.');
    }
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.session.signIn(email, password);
      const redirect = this.route.snapshot.queryParamMap.get('redirect');
      await this.router.navigateByUrl(redirect || this.session.defaultRedirectForRole());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

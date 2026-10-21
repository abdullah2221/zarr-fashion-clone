import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminSessionService } from '../../services/admin-session.service';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  private readonly session = inject(AdminSessionService);
  private readonly fb = inject(FormBuilder);
  private readonly meta = inject(MetaService);

  readonly saving = signal(false);
  readonly success = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly profile = this.session.profile;
  readonly user = this.session.user;
  readonly joinedDate = computed(() => this.user()?.created_at || null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, this.phoneValidator]],
  });

  constructor() {
    this.meta.setSeo({
      title: 'Account',
      description: 'Manage your Zeenat customer profile and orders.',
      path: '/account',
      noindex: true,
    });

    void this.session.ensureInitialized().then(() => {
      this.form.reset({
        fullName: this.profile()?.fullName || '',
        phone: this.profile()?.phone || '',
      });
    });
  }

  async saveProfile() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.success.set(null);
    this.error.set(null);
    try {
      const value = this.form.getRawValue();
      await this.session.updateCurrentProfile({
        full_name: value.fullName.trim(),
        phone: value.phone.trim(),
      });
      this.success.set('Profile updated successfully.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      this.saving.set(false);
    }
  }

  async signOut() {
    await this.session.signOut('/login');
  }

  private phoneValidator(control: AbstractControl) {
    const value = String(control.value || '');
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 ? null : { invalidPhone: true };
  }
}

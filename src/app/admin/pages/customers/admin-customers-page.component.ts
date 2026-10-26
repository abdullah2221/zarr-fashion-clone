import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCustomersService } from '../../services/admin-customers.service';
import { AdminSessionService } from '../../../services/admin-session.service';
import { Tables, UserRole } from '../../../data-access/models/database.types';

@Component({
  selector: 'app-admin-customers-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-customers-page.component.html',
  styleUrl: './admin-customers-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCustomersPageComponent implements OnInit {
  readonly service = inject(AdminCustomersService);
  readonly session = inject(AdminSessionService);

  readonly search = signal('');
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly savingId = signal<string | null>(null);

  ngOnInit() {
    void this.service.load().catch(err => this.error.set(this.message(err)));
  }

  filtered(): Tables<'profiles'>[] {
    return this.service.filterCustomers(this.search());
  }

  isOwnRow(profile: Tables<'profiles'>): boolean {
    return this.session.profile()?.id === profile.id;
  }

  async changeRole(profile: Tables<'profiles'>, role: UserRole) {
    if (role === profile.role) return;
    this.savingId.set(profile.id);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.service.setRole(profile, role);
      this.success.set(`Role updated for ${profile.email || profile.full_name || 'customer'}.`);
    } catch (err) {
      this.error.set(this.message(err));
    } finally {
      this.savingId.set(null);
    }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong.';
  }
}

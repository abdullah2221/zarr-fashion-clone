import { Injectable, inject, signal } from '@angular/core';
import { SupabaseCustomerRepository } from '../../data-access/supabase/supabase.repositories';
import { Tables, UserRole } from '../../data-access/models/database.types';

@Injectable({ providedIn: 'root' })
export class AdminCustomersService {
  private readonly customerRepository = inject(SupabaseCustomerRepository);

  readonly customers = signal<Tables<'profiles'>[]>([]);
  readonly isLoading = signal(false);

  readonly roleOptions: UserRole[] = ['customer', 'admin', 'super_admin'];

  async load() {
    this.isLoading.set(true);
    try {
      this.customers.set(await this.customerRepository.listProfiles());
    } finally {
      this.isLoading.set(false);
    }
  }

  filterCustomers(search: string): Tables<'profiles'>[] {
    const query = search.trim().toLowerCase();
    if (!query) return this.customers();
    return this.customers().filter(profile =>
      [profile.full_name || '', profile.email || '', profile.role].join(' ').toLowerCase().includes(query)
    );
  }

  /**
   * Role changes go through the set_user_role RPC: the database
   * itself refuses the call unless the signed-in user is a
   * super_admin, so this stays safe even though the page is
   * reachable by plain admins (they simply get the RPC's error).
   */
  async setRole(profile: Tables<'profiles'>, role: UserRole) {
    await this.customerRepository.setRole(profile.id, role);
    await this.load();
  }
}

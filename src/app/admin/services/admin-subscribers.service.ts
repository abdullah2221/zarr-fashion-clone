import { Injectable, inject, signal } from '@angular/core';
import { SupabaseSubscriberRepository } from '../../data-access/supabase/supabase.repositories';
import { Tables } from '../../data-access/models/database.types';

@Injectable({ providedIn: 'root' })
export class AdminSubscribersService {
  private readonly subscriberRepository = inject(SupabaseSubscriberRepository);

  readonly subscribers = signal<Tables<'subscribers'>[]>([]);
  readonly isLoading = signal(false);

  async load() {
    this.isLoading.set(true);
    try {
      this.subscribers.set(await this.subscriberRepository.listAll());
    } finally {
      this.isLoading.set(false);
    }
  }

  filterSubscribers(search: string): Tables<'subscribers'>[] {
    const query = search.trim().toLowerCase();
    if (!query) return this.subscribers();
    return this.subscribers().filter(item => item.email.toLowerCase().includes(query));
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { SupabaseContactMessageRepository } from '../../data-access/supabase/supabase.repositories';
import { Tables } from '../../data-access/models/database.types';

@Injectable({ providedIn: 'root' })
export class AdminMessagesService {
  private readonly messageRepository = inject(SupabaseContactMessageRepository);

  readonly messages = signal<Tables<'contact_messages'>[]>([]);
  readonly isLoading = signal(false);

  async load() {
    this.isLoading.set(true);
    try {
      this.messages.set(await this.messageRepository.listAll());
    } finally {
      this.isLoading.set(false);
    }
  }

  async setHandled(row: Tables<'contact_messages'>, handled: boolean) {
    await this.messageRepository.setHandled(row.id, handled);
    await this.load();
  }
}

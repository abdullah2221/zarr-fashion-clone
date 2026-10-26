import { Injectable, inject } from '@angular/core';
import {
  SupabaseContactMessageRepository,
  SupabaseSubscriberRepository,
} from '../data-access/supabase/supabase.repositories';
import { SupabaseClientService } from '../core/supabase/supabase-client.service';

export type SubscribeResult = 'success' | 'duplicate' | 'error';

/**
 * Public write forms (Phase 7): newsletter subscribe (footer +
 * homepage band) and the Contact page enquiry form. Both tables
 * are INSERT-only for the public role (phase-8 migration), so this
 * service never reads them back — outcomes are reported as small
 * result tokens the forms turn into status messages.
 */
@Injectable({ providedIn: 'root' })
export class EngagementService {
  private readonly clientService = inject(SupabaseClientService);
  private readonly subscriberRepository = inject(SupabaseSubscriberRepository);
  private readonly contactMessageRepository = inject(SupabaseContactMessageRepository);

  async subscribe(email: string): Promise<SubscribeResult> {
    if (!this.clientService.isConfigured()) return 'error';
    try {
      const result = await this.subscriberRepository.subscribe(email.trim().toLowerCase());
      return result === 'duplicate' ? 'duplicate' : 'success';
    } catch (error) {
      console.error('Newsletter subscribe failed.', error);
      return 'error';
    }
  }

  async sendContactMessage(input: { name: string; contact: string; message: string }): Promise<boolean> {
    if (!this.clientService.isConfigured()) return false;
    try {
      await this.contactMessageRepository.send({
        name: input.name.trim(),
        contact: input.contact.trim(),
        message: input.message.trim(),
      });
      return true;
    } catch (error) {
      console.error('Contact message failed.', error);
      return false;
    }
  }
}

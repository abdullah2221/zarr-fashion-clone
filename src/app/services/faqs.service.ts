import { Injectable, inject, signal } from '@angular/core';
import { SupabaseFaqRepository } from '../data-access/supabase/supabase.repositories';
import { SupabaseClientService } from '../core/supabase/supabase-client.service';
import { StorefrontFaqItem } from '../shared/models/page-content.models';

/**
 * Storefront FAQ records (Phase 7). The FAQ page and the builder's
 * 'faq-list' section render from the faqs table (Admin > FAQs).
 *
 * Load-state contract the templates rely on:
 *   'pending' — not loaded yet: callers keep their Phase 6 fallback
 *               (the seeded static-content cards).
 *   'ready'   — the table answered: records are authoritative,
 *               even when the list is empty (the owner may have
 *               deactivated every question on purpose).
 *   'error'   — table missing/unreachable (e.g. the phase-8
 *               migration has not run yet): callers fall back.
 */
@Injectable({ providedIn: 'root' })
export class FaqsService {
  private readonly clientService = inject(SupabaseClientService);
  private readonly faqRepository = inject(SupabaseFaqRepository);

  private readonly stateSignal = signal<'pending' | 'ready' | 'error'>('pending');
  private readonly itemsSignal = signal<StorefrontFaqItem[]>([]);
  private requested = false;

  readonly state = this.stateSignal.asReadonly();
  readonly items = this.itemsSignal.asReadonly();

  async ensureLoaded(): Promise<void> {
    if (this.requested) return;
    this.requested = true;

    if (!this.clientService.isConfigured()) {
      this.stateSignal.set('error');
      return;
    }

    try {
      const rows = await this.faqRepository.listActive();
      this.itemsSignal.set(rows.map(row => ({ id: row.id, question: row.question, answer: row.answer })));
      this.stateSignal.set('ready');
    } catch (error) {
      console.error('Failed to load FAQs; using page content fallback.', error);
      this.stateSignal.set('error');
    }
  }
}

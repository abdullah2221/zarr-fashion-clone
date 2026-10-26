import { Injectable, inject, signal } from '@angular/core';
import { SupabaseTestimonialRepository } from '../data-access/supabase/supabase.repositories';
import { SupabaseClientService } from '../core/supabase/supabase-client.service';
import { StorefrontTestimonialRecord } from '../shared/models/page-content.models';

/**
 * Storefront testimonial records (Phase 7). The homepage
 * testimonials section renders from the testimonials table
 * (Admin > Testimonials) once the table has answered; the load
 * state contract matches FaqsService:
 *   'pending' / 'error' — keep the Phase 6 payload copy (which is
 *     the same text, seeded verbatim), so nothing changes before
 *     the phase-8 migration runs or if the CMS is unreachable.
 *   'ready' — records are authoritative; zero active records
 *     means the section renders nothing.
 */
@Injectable({ providedIn: 'root' })
export class TestimonialsService {
  private readonly clientService = inject(SupabaseClientService);
  private readonly testimonialRepository = inject(SupabaseTestimonialRepository);

  private readonly stateSignal = signal<'pending' | 'ready' | 'error'>('pending');
  private readonly itemsSignal = signal<StorefrontTestimonialRecord[]>([]);
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
      const rows = await this.testimonialRepository.listActive();
      this.itemsSignal.set(rows.map(row => ({
        id: row.id,
        name: row.name,
        designation: row.designation,
        body: row.body,
        rating: row.rating,
      })));
      this.stateSignal.set('ready');
    } catch (error) {
      console.error('Failed to load testimonials; using section content fallback.', error);
      this.stateSignal.set('error');
    }
  }

  /** The author line the cards render: "Name, Designation" (designation optional). */
  authorLine(item: StorefrontTestimonialRecord): string {
    return item.designation ? `${item.name}, ${item.designation}` : item.name;
  }

  /** Star row for a record: only rendered when the record carries a rating. */
  stars(item: StorefrontTestimonialRecord): string {
    if (!item.rating || item.rating < 1) return '';
    return '★'.repeat(Math.min(5, Math.round(item.rating)));
  }
}

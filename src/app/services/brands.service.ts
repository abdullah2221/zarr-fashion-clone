import { Injectable, inject, signal } from '@angular/core';
import { SupabaseBrandsRepository } from '../data-access/supabase/supabase.repositories';
import { SupabaseClientService } from '../core/supabase/supabase-client.service';
import { StorefrontBrandMark } from '../shared/models/page-content.models';

/**
 * Storefront brand records (Phase 8). The homepage brands strip renders
 * from the brands table (Admin > Brands) once the table has answered;
 * the load state contract matches TestimonialsService:
 *   'pending' / 'error' — keep the page-section payload brands (which
 *     are the same wordmarks, seeded verbatim), so nothing changes
 *     before the phase-9 migration runs or if the CMS is unreachable.
 *   'ready' — records are authoritative; the strip hides its brand
 *     list when zero brands are active (the stats band still renders).
 */
@Injectable({ providedIn: 'root' })
export class BrandsService {
  private readonly clientService = inject(SupabaseClientService);
  private readonly brandsRepository = inject(SupabaseBrandsRepository);

  private readonly stateSignal = signal<'pending' | 'ready' | 'error'>('pending');
  private readonly itemsSignal = signal<StorefrontBrandMark[]>([]);
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
      const rows = await this.brandsRepository.listActive();
      this.itemsSignal.set(rows.map(row => ({
        name: row.name,
        styleKey: row.style_key,
        linkUrl: row.link_url || undefined,
      })));
      this.stateSignal.set('ready');
    } catch (error) {
      console.error('Failed to load brands; using section content fallback.', error);
      this.stateSignal.set('error');
    }
  }
}

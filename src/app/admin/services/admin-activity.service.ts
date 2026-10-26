import { Injectable, inject, signal } from '@angular/core';
import { SupabaseAdminActivityRepository } from '../../data-access/supabase/supabase.repositories';
import { AdminSessionService } from '../../services/admin-session.service';
import { Tables } from '../../data-access/models/database.types';

/**
 * Admin activity log (Phase 8). One best-effort `log()` call from each
 * admin write path records who did what; a failed insert is swallowed
 * (console only) so logging can never break the admin action itself.
 * Until the phase-9 migration runs, inserts fail silently and the
 * Activity page shows an empty list — admin actions are unaffected.
 */
@Injectable({ providedIn: 'root' })
export class AdminActivityService {
  private readonly activityRepository = inject(SupabaseAdminActivityRepository);
  private readonly session = inject(AdminSessionService);

  readonly entries = signal<Tables<'admin_activity'>[]>([]);
  readonly isLoading = signal(false);

  async load(limit = 200) {
    this.isLoading.set(true);
    try {
      this.entries.set(await this.activityRepository.listRecent(limit));
    } catch (error) {
      console.error('Failed to load activity log.', error);
      this.entries.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async log(
    action: string,
    entityType: string,
    entityId?: string | null,
    entityLabel?: string | null,
    detail?: string | null,
  ): Promise<void> {
    try {
      await this.activityRepository.log({
        actor_email: this.session.user()?.email ?? null,
        action,
        entity_type: entityType,
        entity_id: entityId ?? null,
        entity_label: entityLabel ?? null,
        detail: detail ?? null,
      });
    } catch (error) {
      console.error('Activity log insert failed (non-fatal).', error);
    }
  }
}

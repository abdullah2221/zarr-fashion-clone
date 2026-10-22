import { Component, computed, inject, input } from '@angular/core';
import { SupabaseStorageRepository } from '../../data-access/supabase/supabase.repositories';
import {
  DEFAULT_BRANDS_STATS,
  StorefrontBrandsStatsContent,
} from '../../shared/models/page-content.models';

@Component({
  selector: 'app-brands-gallery',
  standalone: true,
  templateUrl: './brands-gallery.component.html',
  styleUrl: './brands-gallery.component.scss'
})
export class BrandsGalleryComponent {
  private readonly storageRepository = inject(SupabaseStorageRepository);

  /**
   * Brands + stats content, driven by the homepage 'brands-stats'
   * page section (Admin > Pages). Defaults are the values the
   * template previously hardcoded, so rendering is unchanged until
   * the owner edits the section.
   */
  readonly content = input<StorefrontBrandsStatsContent>(DEFAULT_BRANDS_STATS);

  readonly statsBackgroundUrl = computed(() => {
    const path = this.content().statsBackgroundPath;
    if (path.startsWith('http')) return path;
    try {
      return this.storageRepository.getPublicImageUrl(path);
    } catch {
      // Supabase not configured (local fallback state): keep the raw
      // path rather than breaking the whole section render.
      return path;
    }
  });
}

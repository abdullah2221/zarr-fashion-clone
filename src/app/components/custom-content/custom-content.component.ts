import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseStorageRepository } from '../../data-access/supabase/supabase.repositories';
import { StorefrontCustomContent } from '../../shared/models/page-content.models';

/**
 * Builder section 'custom-content' (Phase 7): the generic content
 * block — heading, body text (line breaks preserved), an optional
 * image and an optional call-to-action. Edited per section in
 * Admin > Pages; placeable on any page the builder renders.
 */
@Component({
  selector: 'app-custom-content',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './custom-content.component.html',
  styleUrl: './custom-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomContentComponent {
  private readonly storageRepository = inject(SupabaseStorageRepository);

  readonly content = input<StorefrontCustomContent>({ heading: '', body: '' });

  readonly imageUrl = computed(() => {
    const path = this.content().imagePath;
    return path ? this.storageRepository.getPublicImageUrl(path) : '';
  });
}

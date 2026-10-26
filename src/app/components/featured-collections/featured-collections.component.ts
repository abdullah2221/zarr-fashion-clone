import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorefrontContentService } from '../../services/storefront-content.service';

@Component({
  selector: 'app-featured-collections',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './featured-collections.component.html',
  styleUrl: './featured-collections.component.scss'
})
export class FeaturedCollectionsComponent {
  private readonly content = inject(StorefrontContentService);

  /** Optional per-section item limit from the section payload (Phase 7). */
  readonly limit = input<number | null>(null);

  /** Tiles come from Admin > Campaigns records with placement 'featured-collections'. */
  readonly collections = computed(() => {
    const all = this.content.featuredCollections();
    const limit = this.limit();
    return limit ? all.slice(0, limit) : all;
  });
}

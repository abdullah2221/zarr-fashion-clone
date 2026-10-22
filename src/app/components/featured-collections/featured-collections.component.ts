import { Component, inject } from '@angular/core';
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

  /** Tiles come from Admin > Campaigns records with placement 'featured-collections'. */
  readonly collections = this.content.featuredCollections;
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FEATURED_COLLECTIONS } from '../../data/data';

@Component({
  selector: 'app-featured-collections',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './featured-collections.component.html',
  styleUrl: './featured-collections.component.scss'
})
export class FeaturedCollectionsComponent {
  collections = FEATURED_COLLECTIONS;
}

import { Component } from '@angular/core';
import { FEATURED_COLLECTIONS } from '../../data/data';

@Component({
  selector: 'app-featured-collections',
  standalone: true,
  templateUrl: './featured-collections.component.html',
  styleUrl: './featured-collections.component.scss'
})
export class FeaturedCollectionsComponent {
  collections = FEATURED_COLLECTIONS;
}

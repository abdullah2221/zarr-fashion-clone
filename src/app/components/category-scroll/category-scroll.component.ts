import { Component } from '@angular/core';
import { CATEGORIES } from '../../data/data';

@Component({
  selector: 'app-category-scroll',
  standalone: true,
  templateUrl: './category-scroll.component.html',
  styleUrl: './category-scroll.component.scss'
})
export class CategoryScrollComponent {
  categories = CATEGORIES;
}

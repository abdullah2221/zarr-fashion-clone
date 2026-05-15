import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../data/data';

@Component({
  selector: 'app-category-scroll',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-scroll.component.html',
  styleUrl: './category-scroll.component.scss'
})
export class CategoryScrollComponent {
  categories = CATEGORIES;
}

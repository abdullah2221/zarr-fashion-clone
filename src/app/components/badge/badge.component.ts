import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="'badge--' + variant()">
      {{ text() }}
    </span>
  `,
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  text = input<string>('');
  variant = input<'primary' | 'dark' | 'outline' | 'accent'>('primary');
}

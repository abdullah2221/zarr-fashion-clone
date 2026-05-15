import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon() }}</mat-icon>
      <h2>{{ title() }}</h2>
      <p>{{ text() }}</p>
      <div class="empty-state__actions">
        <a [routerLink]="primaryLink()" class="empty-state__btn">{{ primaryLabel() }}</a>
        @if (secondaryLabel() && secondaryLink()) {
          <a [routerLink]="secondaryLink()!" class="empty-state__btn empty-state__btn--secondary">{{ secondaryLabel() }}</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: grid;
      justify-items: center;
      gap: .75rem;
      text-align: center;
      padding: 2.5rem 1rem;
      background: #fff;
      border: 1px solid rgba(17,17,17,.06);
      box-shadow: 0 1px 2px rgba(0,0,0,.04);
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #9ca3af;
    }
    .empty-state h2 {
      margin: 0;
      font-size: clamp(1.5rem, 4vw, 2.25rem);
      font-weight: 500;
      font-family: "Playfair Display", ui-serif, Georgia, serif;
    }
    .empty-state p {
      max-width: 34rem;
      margin: 0;
      color: #6b7280;
      line-height: 1.7;
    }
    .empty-state__actions {
      margin-top: .5rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: .75rem;
    }
    .empty-state__btn {
      min-height: 48px;
      padding: 0 1.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #111111;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .14em;
      text-transform: uppercase;
    }
    .empty-state__btn--secondary {
      background: transparent;
      border: 1px solid #111111;
      color: #111111;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  icon = input('inbox');
  title = input('Nothing here yet');
  text = input('Please try again in a moment.');
  primaryLabel = input('Go Back');
  primaryLink = input('/shop');
  secondaryLabel = input<string | null>(null);
  secondaryLink = input<string | null>(null);
}


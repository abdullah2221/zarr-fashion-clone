import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-grid">
      @for (_ of cards(); track $index) {
        <article class="skeleton-card">
          <div class="skeleton skeleton-card__image"></div>
          <div class="skeleton skeleton-card__line skeleton-card__line--sm"></div>
          <div class="skeleton skeleton-card__line"></div>
          <div class="skeleton skeleton-card__line skeleton-card__line--md"></div>
          <div class="skeleton skeleton-card__btn"></div>
        </article>
      }
    </div>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .skeleton-card {
      display: grid;
      gap: .5rem;
    }
    .skeleton-card__image {
      aspect-ratio: 3 / 4;
    }
    .skeleton-card__line {
      height: 12px;
    }
    .skeleton-card__line--sm {
      width: 48%;
    }
    .skeleton-card__line--md {
      width: 62%;
    }
    .skeleton-card__btn {
      height: 40px;
    }
    @media (min-width: 768px) {
      .skeleton-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    @media (min-width: 1180px) {
      .skeleton-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSkeletonCardComponent {
  count = input(4);

  cards() {
    return Array.from({ length: this.count() });
  }
}


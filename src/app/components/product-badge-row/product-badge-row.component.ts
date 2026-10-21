import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../shared/models/models';

@Component({
  selector: 'app-product-badge-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="badge-row">
      @for (badge of badges(); track badge.text) {
        <span [class.badge-row__badge--accent]="badge.tone === 'accent'" [class.badge-row__badge--ghost]="badge.tone === 'ghost'" class="badge-row__badge">
          {{ badge.text }}
        </span>
      }
    </div>
  `,
  styles: [`
    .badge-row {
      min-height: 22px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: .4rem;
    }
    .badge-row__badge {
      min-height: 20px;
      display: inline-flex;
      align-items: center;
      padding: 0 .5rem;
      background: #111111;
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .badge-row__badge--accent { background: #b91c1c; }
    .badge-row__badge--ghost {
      background: rgba(17,17,17,.08);
      color: #374151;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductBadgeRowComponent {
  product = input.required<Product>();

  badges = computed(() => {
    const p = this.product();
    const stock = (p.stockLabel || '').toLowerCase();

    if (stock.includes('low') || stock.includes('only')) {
      return [{ text: 'Limited Stock', tone: 'accent' as const }];
    }
    if (p.discount) {
      return [{ text: 'Selling Fast', tone: 'default' as const }];
    }
    if (p.badge) {
      return [{ text: 'Trending in Pakistan', tone: 'default' as const }];
    }
    return [{ text: 'Ready to Wear', tone: 'ghost' as const }];
  });
}


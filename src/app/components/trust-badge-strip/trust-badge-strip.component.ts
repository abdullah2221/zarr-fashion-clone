import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface TrustBadgeItem {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-trust-badge-strip',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="trust-strip" [class.trust-strip--dark]="tone() === 'dark'">
      @for (item of items(); track item.label) {
        <span>
          <mat-icon>{{ item.icon }}</mat-icon>
          {{ item.label }}
        </span>
      }
    </div>
  `,
  styles: [`
    .trust-strip {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: rgba(17,17,17,.1);
    }
    .trust-strip span {
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: .5rem;
      padding: 0 .75rem;
      background: #fff;
      color: #374151;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      min-width: 0;
    }
    .trust-strip mat-icon {
      color: #a87f22;
      font-size: 17px;
      width: 17px;
      height: 17px;
    }
    .trust-strip--dark {
      background: rgba(255,255,255,.14);
    }
    .trust-strip--dark span {
      background: #161616;
      color: #f3f4f6;
    }
    @media (min-width: 1024px) {
      .trust-strip {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrustBadgeStripComponent {
  items = input<TrustBadgeItem[]>([]);
  tone = input<'light' | 'dark'>('light');
}


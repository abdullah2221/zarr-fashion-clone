import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campaign-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="campaign-chips" [class.campaign-chips--dark]="tone() === 'dark'">
      @for (chip of chips(); track chip) {
        <span>{{ chip }}</span>
      }
    </div>
  `,
  styles: [`
    .campaign-chips {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
    }
    .campaign-chips span {
      min-height: 30px;
      display: inline-flex;
      align-items: center;
      padding: 0 .75rem;
      border: 1px solid #e5e7eb;
      background: #fff;
      color: #374151;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .campaign-chips--dark span {
      border-color: rgba(255,255,255,.22);
      background: rgba(255,255,255,.06);
      color: #f3f4f6;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignChipsComponent {
  chips = input<string[]>([]);
  tone = input<'light' | 'dark'>('light');
}


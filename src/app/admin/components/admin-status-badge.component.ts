import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="admin-status-badge" [class.admin-status-badge--tone-success]="tone() === 'success'" [class.admin-status-badge--tone-warning]="tone() === 'warning'" [class.admin-status-badge--tone-muted]="tone() === 'muted'">{{ text() }}</span>`,
  styles: [`
    .admin-status-badge {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 .75rem;
      border: 1px solid rgba(17,17,17,.08);
      background: rgba(17,17,17,.04);
      color: #111;
      font-size: .7rem;
      font-weight: 800;
      letter-spacing: .12em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .admin-status-badge--tone-success {
      color: #0f8f63;
      background: rgba(15,143,99,.1);
      border-color: rgba(15,143,99,.22);
    }
    .admin-status-badge--tone-warning {
      color: #b45309;
      background: rgba(245,158,11,.12);
      border-color: rgba(245,158,11,.24);
    }
    .admin-status-badge--tone-muted {
      color: #6b7280;
      background: rgba(107,114,128,.09);
      border-color: rgba(107,114,128,.22);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStatusBadgeComponent {
  text = input.required<string>();
  tone = input<'success' | 'warning' | 'muted' | 'neutral'>('neutral');
}

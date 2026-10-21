import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

type AdminActionTone = 'neutral' | 'success' | 'danger' | 'warning';
type AdminActionAppearance = 'icon' | 'soft' | 'solid';
type AdminActionSize = 'compact' | 'touch';

@Component({
  selector: 'app-admin-action-button',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './admin-action-button.component.html',
  styleUrl: './admin-action-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminActionButtonComponent {
  icon = input.required<string>();
  label = input.required<string>();
  ariaLabel = input<string | null>(null);
  title = input<string | null>(null);
  tone = input<AdminActionTone>('neutral');
  appearance = input<AdminActionAppearance>('icon');
  size = input<AdminActionSize>('compact');
  showLabel = input(false);
  disabled = input(false);
  type = input<'button' | 'submit'>('button');
  routerLink = input<string | readonly string[] | null>(null);

  @Output() pressed = new EventEmitter<void>();
}

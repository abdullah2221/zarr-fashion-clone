import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Admin Guide (Phase 8.1): plain-language tutorials for a non-developer
 * shop owner. Static content only — no data loading, no writes.
 */
@Component({
  selector: 'app-admin-guide-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin-guide-page.component.html',
  styleUrl: './admin-guide-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGuidePageComponent {}

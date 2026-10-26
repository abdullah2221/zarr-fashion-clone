import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminActivityService } from '../../services/admin-activity.service';
import { Tables } from '../../../data-access/models/database.types';

@Component({
  selector: 'app-admin-activity-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-activity-page.component.html',
  styleUrl: './admin-activity-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminActivityPageComponent implements OnInit {
  readonly service = inject(AdminActivityService);

  readonly search = signal('');

  ngOnInit() {
    void this.service.load();
  }

  filtered(): Tables<'admin_activity'>[] {
    const query = this.search().trim().toLowerCase();
    const items = this.service.entries();
    if (!query) return items;
    return items.filter(item =>
      `${item.actor_email || ''} ${item.action} ${item.entity_type} ${item.entity_label || ''} ${item.detail || ''}`.toLowerCase().includes(query));
  }

  when(value: string): string {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }
}

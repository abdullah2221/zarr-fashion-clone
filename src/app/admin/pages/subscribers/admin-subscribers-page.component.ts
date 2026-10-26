import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSubscribersService } from '../../services/admin-subscribers.service';
import { Tables } from '../../../data-access/models/database.types';

@Component({
  selector: 'app-admin-subscribers-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-subscribers-page.component.html',
  styleUrl: './admin-subscribers-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSubscribersPageComponent implements OnInit {
  readonly service = inject(AdminSubscribersService);

  readonly search = signal('');
  readonly error = signal<string | null>(null);

  ngOnInit() {
    void this.service.load().catch(err => this.error.set(err instanceof Error ? err.message : 'Something went wrong.'));
  }

  filtered(): Tables<'subscribers'>[] {
    return this.service.filterSubscribers(this.search());
  }
}

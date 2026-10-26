import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminMessagesService } from '../../services/admin-messages.service';
import { Tables } from '../../../data-access/models/database.types';

@Component({
  selector: 'app-admin-messages-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-messages-page.component.html',
  styleUrl: './admin-messages-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMessagesPageComponent implements OnInit {
  readonly service = inject(AdminMessagesService);

  readonly showHandled = signal(true);
  readonly error = signal<string | null>(null);
  readonly savingId = signal<string | null>(null);

  ngOnInit() {
    void this.service.load().catch(err => this.error.set(err instanceof Error ? err.message : 'Something went wrong.'));
  }

  visible(): Tables<'contact_messages'>[] {
    const items = this.service.messages();
    return this.showHandled() ? items : items.filter(item => !item.is_handled);
  }

  pendingCount(): number {
    return this.service.messages().filter(item => !item.is_handled).length;
  }

  async setHandled(row: Tables<'contact_messages'>, handled: boolean) {
    this.savingId.set(row.id);
    this.error.set(null);
    try {
      await this.service.setHandled(row, handled);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      this.savingId.set(null);
    }
  }
}

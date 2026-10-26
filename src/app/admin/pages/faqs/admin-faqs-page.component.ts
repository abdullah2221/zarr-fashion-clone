import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminFaqsService } from '../../services/admin-faqs.service';
import { Tables } from '../../../data-access/models/database.types';
import { AdminFaqEditorValue } from '../../models/admin-records.models';

@Component({
  selector: 'app-admin-faqs-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-faqs-page.component.html',
  styleUrl: './admin-faqs-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFaqsPageComponent implements OnInit {
  readonly service = inject(AdminFaqsService);

  readonly selectedId = signal<string | null>(null);
  readonly editor = signal<AdminFaqEditorValue>(this.service.emptyEditor());
  readonly search = signal('');
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  ngOnInit() {
    void this.service.load().catch(err => this.error.set(this.message(err)));
  }

  filtered(): Tables<'faqs'>[] {
    const query = this.search().trim().toLowerCase();
    const items = this.service.faqs();
    if (!query) return items;
    return items.filter(item => `${item.question} ${item.answer}`.toLowerCase().includes(query));
  }

  startCreate() {
    this.selectedId.set(null);
    this.editor.set(this.service.emptyEditor());
    this.error.set(null);
    this.success.set(null);
  }

  select(row: Tables<'faqs'>) {
    this.selectedId.set(row.id);
    this.editor.set(this.service.toEditor(row));
    this.error.set(null);
    this.success.set(null);
  }

  updateEditor(patch: Partial<AdminFaqEditorValue>) {
    this.editor.update(current => ({ ...current, ...patch }));
  }

  async save() {
    const value = this.editor();
    if (!value.question.trim() || !value.answer.trim()) {
      this.error.set('Question and answer are both required.');
      return;
    }
    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.service.save(this.selectedId(), value);
      this.success.set('FAQ saved.');
      const saved = this.service.faqs().find(item => item.question === value.question.trim());
      if (saved) this.select(saved);
    } catch (err) {
      this.error.set(this.message(err));
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggle(row: Tables<'faqs'>) {
    try { await this.service.toggle(row); } catch (err) { this.error.set(this.message(err)); }
  }

  async delete(row: Tables<'faqs'>) {
    try {
      await this.service.delete(row);
      if (this.selectedId() === row.id) this.startCreate();
    } catch (err) { this.error.set(this.message(err)); }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong.';
  }
}

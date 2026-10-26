import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminTestimonialsService } from '../../services/admin-testimonials.service';
import { Tables } from '../../../data-access/models/database.types';
import { AdminTestimonialEditorValue } from '../../models/admin-records.models';

@Component({
  selector: 'app-admin-testimonials-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-testimonials-page.component.html',
  styleUrl: './admin-testimonials-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTestimonialsPageComponent implements OnInit {
  readonly service = inject(AdminTestimonialsService);

  readonly selectedId = signal<string | null>(null);
  readonly editor = signal<AdminTestimonialEditorValue>(this.service.emptyEditor());
  readonly search = signal('');
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  ngOnInit() {
    void this.service.load().catch(err => this.error.set(this.message(err)));
  }

  filtered(): Tables<'testimonials'>[] {
    const query = this.search().trim().toLowerCase();
    const items = this.service.testimonials();
    if (!query) return items;
    return items.filter(item => `${item.name} ${item.designation || ''} ${item.body}`.toLowerCase().includes(query));
  }

  startCreate() {
    this.selectedId.set(null);
    this.editor.set(this.service.emptyEditor());
    this.error.set(null);
    this.success.set(null);
  }

  select(row: Tables<'testimonials'>) {
    this.selectedId.set(row.id);
    this.editor.set(this.service.toEditor(row));
    this.error.set(null);
    this.success.set(null);
  }

  updateEditor(patch: Partial<AdminTestimonialEditorValue>) {
    this.editor.update(current => ({ ...current, ...patch }));
  }

  async save() {
    const value = this.editor();
    if (!value.name.trim() || !value.body.trim()) {
      this.error.set('Name and quote text are both required.');
      return;
    }
    if (value.rating !== null && (value.rating < 1 || value.rating > 5)) {
      this.error.set('Rating must be between 1 and 5, or left empty.');
      return;
    }
    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.service.save(this.selectedId(), value);
      this.success.set('Testimonial saved.');
      const saved = this.service.testimonials().find(item => item.name === value.name.trim() && item.body === value.body.trim());
      if (saved) this.select(saved);
    } catch (err) {
      this.error.set(this.message(err));
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggle(row: Tables<'testimonials'>) {
    try { await this.service.toggle(row); } catch (err) { this.error.set(this.message(err)); }
  }

  async delete(row: Tables<'testimonials'>) {
    try {
      await this.service.delete(row);
      if (this.selectedId() === row.id) this.startCreate();
    } catch (err) { this.error.set(this.message(err)); }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong.';
  }
}

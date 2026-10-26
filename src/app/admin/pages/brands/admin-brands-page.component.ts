import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminBrandsService } from '../../services/admin-brands.service';
import { Tables } from '../../../data-access/models/database.types';
import { AdminBrandEditorValue } from '../../models/admin-records.models';

@Component({
  selector: 'app-admin-brands-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-brands-page.component.html',
  styleUrl: './admin-brands-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBrandsPageComponent implements OnInit {
  readonly service = inject(AdminBrandsService);

  readonly selectedId = signal<string | null>(null);
  readonly editor = signal<AdminBrandEditorValue>(this.service.emptyEditor());
  readonly search = signal('');
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  ngOnInit() {
    void this.service.load().catch(err => this.error.set(this.message(err)));
  }

  filtered(): Tables<'brands'>[] {
    const query = this.search().trim().toLowerCase();
    const items = this.service.brands();
    if (!query) return items;
    return items.filter(item => `${item.name} ${item.style_key} ${item.link_url || ''}`.toLowerCase().includes(query));
  }

  startCreate() {
    this.selectedId.set(null);
    this.editor.set(this.service.emptyEditor());
    this.error.set(null);
    this.success.set(null);
  }

  select(row: Tables<'brands'>) {
    this.selectedId.set(row.id);
    this.editor.set(this.service.toEditor(row));
    this.error.set(null);
    this.success.set(null);
  }

  updateEditor(patch: Partial<AdminBrandEditorValue>) {
    this.editor.update(current => ({ ...current, ...patch }));
  }

  async save() {
    const value = this.editor();
    if (!value.name.trim()) {
      this.error.set('Name is required.');
      return;
    }
    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.service.save(this.selectedId(), value);
      this.success.set('Brand saved.');
      const saved = this.service.brands().find(item => item.name === value.name.trim());
      if (saved) this.select(saved);
    } catch (err) {
      this.error.set(this.message(err));
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggle(row: Tables<'brands'>) {
    try { await this.service.toggle(row); } catch (err) { this.error.set(this.message(err)); }
  }

  async delete(row: Tables<'brands'>) {
    try {
      await this.service.delete(row);
      if (this.selectedId() === row.id) this.startCreate();
    } catch (err) { this.error.set(this.message(err)); }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong.';
  }
}

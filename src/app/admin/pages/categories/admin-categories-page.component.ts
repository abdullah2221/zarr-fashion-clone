import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge.component';
import { AdminActionButtonComponent } from '../../components/admin-action-button.component';
import { AdminCategorySort } from '../../models/admin-catalog.models';
import { AdminCategoriesService } from '../../services/admin-categories.service';
import { Tables } from '../../../data-access/models/database.types';

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, AdminStatusBadgeComponent, AdminActionButtonComponent],
  templateUrl: './admin-categories-page.component.html',
  styleUrl: './admin-categories-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly service = inject(AdminCategoriesService);

  readonly selectedCategory = signal<Tables<'categories'> | null>(null);
  readonly imageFile = signal<File | null>(null);
  readonly imagePreview = signal<string>('');
  readonly search = signal('');
  readonly sort = signal<AdminCategorySort>('sort-order');
  readonly saving = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly note = signal<string | null>('Category SEO title, SEO description, and campaign label are shown for planning, but the current live categories schema does not yet include storage columns for them.');
  readonly isLoading = this.service.isLoading;

  readonly categories = computed(() => this.service.filterCategories(this.service.categoryList(), this.search(), this.sort()));
  readonly hasFilters = computed(() => Boolean(this.search().trim() || this.sort() !== 'sort-order'));
  readonly categoryStats = computed(() => {
    const categories = this.service.categoryList();
    const active = categories.filter(item => item.record.is_active).length;
    const withImages = categories.filter(item => Boolean(item.record.image_path)).length;
    const totalProducts = categories.reduce((sum, item) => sum + item.productCount, 0);

    return [
      { label: 'Total', value: categories.length },
      { label: 'Active', value: active },
      { label: 'With image', value: withImages },
      { label: 'Linked products', value: totalProducts },
    ];
  });

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    description: [''],
    sortOrder: [0 as number | null, [Validators.required]],
    isActive: [true],
    seoTitle: [{ value: '', disabled: true }],
    seoDescription: [{ value: '', disabled: true }],
    campaignLabel: [{ value: '', disabled: true }],
  });

  private slugTouched = false;

  constructor() {
    this.form.controls.slug.valueChanges.subscribe(() => {
      this.slugTouched = true;
    });

    this.form.controls.name.valueChanges.subscribe(name => {
      if (!this.slugTouched && !this.selectedCategory()) {
        this.form.controls.slug.setValue(this.slugify(name), { emitEvent: false });
      }
    });

    void this.load();
    this.resetForm();
  }

  selectCategory(category: Tables<'categories'> | null) {
    this.selectedCategory.set(category);
    this.imageFile.set(null);
    this.imagePreview.set(category?.image_path ? this.service.categoryList().find(item => item.record.id === category.id)?.imageUrl || '' : '');
    this.form.reset(this.service.createFormValueFromRecord(category));
    this.slugTouched = Boolean(category);
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] || null;
    this.imageFile.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : '');
    if (input) input.value = '';
  }

  async save() {
    this.form.markAllAsTouched();
    this.error.set(null);
    this.success.set(null);

    if (this.form.invalid) {
      this.error.set('Please complete the required category fields.');
      return;
    }

    const value = this.form.getRawValue();
    if (this.service.slugExists(value.slug, this.selectedCategory()?.id)) {
      this.error.set('This category slug is already in use. Please choose a unique slug.');
      return;
    }

    this.saving.set(true);
    try {
      const editing = Boolean(this.selectedCategory());
      await this.service.saveCategory(this.selectedCategory(), value, this.imageFile());
      this.success.set(editing ? 'Category updated successfully.' : 'Category created successfully.');
      this.selectCategory(null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save category.');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleActive(category: Tables<'categories'>, isActive: boolean) {
    this.busy.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.service.toggleCategoryActive(category, isActive);
      this.success.set(isActive ? `"${category.name}" is now active.` : `"${category.name}" is now inactive.`);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to update category status.');
    } finally {
      this.busy.set(false);
    }
  }

  async deleteCategory(category: Tables<'categories'>) {
    const confirmed = typeof window === 'undefined'
      ? false
      : window.confirm(`Delete "${category.name}" permanently?\n\nThis removes the category from the admin catalog and cannot be undone.`);
    if (!confirmed) return;
    this.busy.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.service.deleteCategory(category);
      this.selectCategory(null);
      this.success.set(`"${category.name}" was deleted.`);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to delete category.');
    } finally {
      this.busy.set(false);
    }
  }

  resetForm() {
    this.error.set(null);
    this.selectCategory(null);
  }

  clearFilters() {
    this.search.set('');
    this.sort.set('sort-order');
  }

  private async load() {
    this.error.set(null);
    try {
      await this.service.load();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to load categories.');
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

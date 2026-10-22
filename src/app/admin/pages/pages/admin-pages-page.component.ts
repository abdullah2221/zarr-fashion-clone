import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminActionButtonComponent } from '../../components/admin-action-button.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge.component';
import { AdminPagesService } from '../../services/admin-pages.service';
import {
  ADMIN_SECTION_TYPES,
  AdminSectionEditorValue,
  sectionTypeInfo,
} from '../../models/admin-pages.models';
import { Tables } from '../../../data-access/models/database.types';

@Component({
  selector: 'app-admin-pages-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, AdminActionButtonComponent, AdminStatusBadgeComponent],
  templateUrl: './admin-pages-page.component.html',
  styleUrl: './admin-pages-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPagesPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly service = inject(AdminPagesService);
  readonly sectionTypes = ADMIN_SECTION_TYPES;

  readonly pageMode = signal<'edit' | 'new'>('edit');
  readonly selectedSection = signal<Tables<'page_sections'> | null>(null);
  readonly sectionType = signal('static-content');
  readonly savingPage = signal(false);
  readonly savingSection = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly pageForm = this.formBuilder.nonNullable.group({
    slug: ['', [Validators.required]],
    title: ['', [Validators.required]],
    isActive: [true],
  });

  readonly sectionForm = this.formBuilder.nonNullable.group({
    sectionType: ['static-content', [Validators.required]],
    sortOrder: [10 as number | null, [Validators.required]],
    isActive: [true],
    eyebrow: [''],
    title: [''],
    sideBannerTitle: [''],
    sideBannerText: [''],
    itemsText: [''],
    brandsText: [''],
    statsEyebrow: [''],
    statsItemsText: [''],
    statsBackgroundPath: [''],
    statsBackgroundAlt: [''],
    heading: [''],
    emailPlaceholder: [''],
    buttonText: [''],
    note: [''],
    intro: [''],
    icon: [''],
    ctaText: [''],
    ctaLink: [''],
    formType: [''],
    sectionsText: [''],
    secondaryText: [''],
  });

  constructor() {
    void this.service.load().then(() => {
      const page = this.service.selectedPage();
      if (page) this.fillPageForm(page);
    });
  }

  typeInfo(type: string) {
    return sectionTypeInfo(type);
  }

  selectPage(page: Tables<'site_pages'>) {
    this.clearMessages();
    this.pageMode.set('edit');
    this.selectedSection.set(null);
    this.fillPageForm(page);
    void this.service.selectPage(page);
  }

  newPage() {
    this.clearMessages();
    this.pageMode.set('new');
    this.pageForm.reset({ slug: '', title: '', isActive: true });
    this.pageForm.controls.slug.enable();
  }

  async savePage() {
    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }
    this.savingPage.set(true);
    this.clearMessages();
    try {
      const value = this.pageForm.getRawValue();
      const editing = this.pageMode() === 'edit' ? this.service.selectedPage() : null;
      await this.service.savePage(editing?.id ?? null, {
        slug: value.slug.trim(),
        title: value.title.trim(),
        isActive: value.isActive,
      });
      this.success.set('Page saved.');
      const saved = this.service.pages().find(page => page.slug === value.slug.trim());
      if (saved) this.selectPage(saved);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save the page.');
    } finally {
      this.savingPage.set(false);
    }
  }

  async deletePage(page: Tables<'site_pages'>) {
    this.clearMessages();
    try {
      await this.service.deletePage(page);
      this.success.set(`Page "${page.title}" deleted.`);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to delete the page.');
    }
  }

  selectSection(row: Tables<'page_sections'> | null) {
    this.clearMessages();
    this.selectedSection.set(row);
    const editor = row ? this.service.sectionToEditor(row) : this.service.emptySectionEditor();
    this.sectionType.set(editor.sectionType);
    this.sectionForm.reset({ ...editor, sortOrder: editor.sortOrder ?? 10 });
  }

  onSectionTypeChange() {
    this.sectionType.set(this.sectionForm.controls.sectionType.value);
  }

  async saveSection() {
    if (this.sectionForm.invalid) {
      this.sectionForm.markAllAsTouched();
      return;
    }
    this.savingSection.set(true);
    this.clearMessages();
    try {
      const value = this.sectionForm.getRawValue() as AdminSectionEditorValue;
      const selected = this.selectedSection();
      await this.service.saveSection(selected?.id ?? null, value, selected?.content);
      this.success.set('Section saved.');
      this.selectedSection.set(null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save the section.');
    } finally {
      this.savingSection.set(false);
    }
  }

  async toggleSection(row: Tables<'page_sections'>) {
    this.clearMessages();
    try {
      await this.service.toggleSection(row);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to update the section.');
    }
  }

  async deleteSection(row: Tables<'page_sections'>) {
    this.clearMessages();
    try {
      await this.service.deleteSection(row);
      if (this.selectedSection()?.id === row.id) {
        this.selectedSection.set(null);
      }
      this.success.set('Section deleted.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to delete the section.');
    }
  }

  private fillPageForm(page: Tables<'site_pages'>) {
    this.pageForm.reset({ slug: page.slug, title: page.title, isActive: page.is_active });
    this.pageForm.controls.slug.disable();
  }

  private clearMessages() {
    this.error.set(null);
    this.success.set(null);
  }
}

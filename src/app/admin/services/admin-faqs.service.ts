import { Injectable, inject, signal } from '@angular/core';
import { SupabaseFaqRepository } from '../../data-access/supabase/supabase.repositories';
import { Tables } from '../../data-access/models/database.types';
import { AdminFaqEditorValue } from '../models/admin-records.models';

import { AdminActivityService } from './admin-activity.service';

@Injectable({ providedIn: 'root' })
export class AdminFaqsService {
  private readonly activity = inject(AdminActivityService);
  private readonly faqRepository = inject(SupabaseFaqRepository);

  readonly faqs = signal<Tables<'faqs'>[]>([]);
  readonly isLoading = signal(false);

  async load() {
    this.isLoading.set(true);
    try {
      this.faqs.set(await this.faqRepository.listAll());
    } finally {
      this.isLoading.set(false);
    }
  }

  emptyEditor(): AdminFaqEditorValue {
    return { question: '', answer: '', sortOrder: this.faqs().length, isActive: true };
  }

  toEditor(row: Tables<'faqs'>): AdminFaqEditorValue {
    return {
      question: row.question,
      answer: row.answer,
      sortOrder: row.sort_order,
      isActive: row.is_active,
    };
  }

  async save(id: string | null, value: AdminFaqEditorValue) {
    const payload = {
      question: value.question.trim(),
      answer: value.answer.trim(),
      sort_order: value.sortOrder ?? 0,
      is_active: value.isActive,
    };
    if (id) {
      await this.faqRepository.update(id, payload);
    } else {
      await this.faqRepository.create(payload);
    }
    await this.load();
    await this.activity.log(id ? 'faq.updated' : 'faq.created', 'faq', id, value.question.trim());
  }

  async toggle(row: Tables<'faqs'>) {
    await this.faqRepository.update(row.id, { is_active: !row.is_active });
    await this.load();
    await this.activity.log(row.is_active ? 'faq.deactivated' : 'faq.activated', 'faq', row.id, row.question);
  }

  async delete(row: Tables<'faqs'>) {
    await this.faqRepository.delete(row.id);
    await this.load();
    await this.activity.log('faq.deleted', 'faq', row.id, row.question);
  }
}

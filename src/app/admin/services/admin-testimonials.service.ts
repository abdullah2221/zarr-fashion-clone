import { Injectable, inject, signal } from '@angular/core';
import { SupabaseTestimonialRepository } from '../../data-access/supabase/supabase.repositories';
import { Tables } from '../../data-access/models/database.types';
import { AdminTestimonialEditorValue } from '../models/admin-records.models';

import { AdminActivityService } from './admin-activity.service';

@Injectable({ providedIn: 'root' })
export class AdminTestimonialsService {
  private readonly activity = inject(AdminActivityService);
  private readonly testimonialRepository = inject(SupabaseTestimonialRepository);

  readonly testimonials = signal<Tables<'testimonials'>[]>([]);
  readonly isLoading = signal(false);

  async load() {
    this.isLoading.set(true);
    try {
      this.testimonials.set(await this.testimonialRepository.listAll());
    } finally {
      this.isLoading.set(false);
    }
  }

  emptyEditor(): AdminTestimonialEditorValue {
    return { name: '', designation: '', body: '', rating: null, sortOrder: this.testimonials().length, isActive: true };
  }

  toEditor(row: Tables<'testimonials'>): AdminTestimonialEditorValue {
    return {
      name: row.name,
      designation: row.designation || '',
      body: row.body,
      rating: row.rating,
      sortOrder: row.sort_order,
      isActive: row.is_active,
    };
  }

  async save(id: string | null, value: AdminTestimonialEditorValue) {
    const payload = {
      name: value.name.trim(),
      designation: value.designation.trim() || null,
      body: value.body.trim(),
      rating: value.rating ?? null,
      sort_order: value.sortOrder ?? 0,
      is_active: value.isActive,
    };
    if (id) {
      await this.testimonialRepository.update(id, payload);
    } else {
      await this.testimonialRepository.create(payload);
    }
    await this.load();
    await this.activity.log(id ? 'testimonial.updated' : 'testimonial.created', 'testimonial', id, value.name.trim());
  }

  async toggle(row: Tables<'testimonials'>) {
    await this.testimonialRepository.update(row.id, { is_active: !row.is_active });
    await this.load();
    await this.activity.log(row.is_active ? 'testimonial.deactivated' : 'testimonial.activated', 'testimonial', row.id, row.name);
  }

  async delete(row: Tables<'testimonials'>) {
    await this.testimonialRepository.delete(row.id);
    await this.load();
    await this.activity.log('testimonial.deleted', 'testimonial', row.id, row.name);
  }
}

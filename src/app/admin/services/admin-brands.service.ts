import { Injectable, inject, signal } from '@angular/core';
import { SupabaseBrandsRepository } from '../../data-access/supabase/supabase.repositories';
import { Tables } from '../../data-access/models/database.types';
import { AdminBrandEditorValue } from '../models/admin-records.models';

import { AdminActivityService } from './admin-activity.service';

@Injectable({ providedIn: 'root' })
export class AdminBrandsService {
  private readonly activity = inject(AdminActivityService);
  private readonly brandsRepository = inject(SupabaseBrandsRepository);

  readonly brands = signal<Tables<'brands'>[]>([]);
  readonly isLoading = signal(false);

  async load() {
    this.isLoading.set(true);
    try {
      this.brands.set(await this.brandsRepository.listAll());
    } finally {
      this.isLoading.set(false);
    }
  }

  emptyEditor(): AdminBrandEditorValue {
    return { name: '', styleKey: '', linkUrl: '', sortOrder: this.brands().length, isActive: true };
  }

  toEditor(row: Tables<'brands'>): AdminBrandEditorValue {
    return {
      name: row.name,
      styleKey: row.style_key,
      linkUrl: row.link_url || '',
      sortOrder: row.sort_order,
      isActive: row.is_active,
    };
  }

  async save(id: string | null, value: AdminBrandEditorValue) {
    const payload = {
      name: value.name.trim(),
      style_key: value.styleKey.trim(),
      link_url: value.linkUrl.trim() || null,
      sort_order: value.sortOrder ?? 0,
      is_active: value.isActive,
    };
    if (id) {
      await this.brandsRepository.update(id, payload);
    } else {
      await this.brandsRepository.create(payload);
    }
    await this.load();
    await this.activity.log(id ? 'brand.updated' : 'brand.created', 'brand', id, value.name.trim());
  }

  async toggle(row: Tables<'brands'>) {
    await this.brandsRepository.update(row.id, { is_active: !row.is_active });
    await this.load();
    await this.activity.log(row.is_active ? 'brand.deactivated' : 'brand.activated', 'brand', row.id, row.name);
  }

  async delete(row: Tables<'brands'>) {
    await this.brandsRepository.delete(row.id);
    await this.load();
    await this.activity.log('brand.deleted', 'brand', row.id, row.name);
  }
}

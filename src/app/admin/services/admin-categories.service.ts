import { Injectable, computed, inject, signal } from '@angular/core';
import { Tables } from '../../data-access/models/database.types';
import { SupabaseCategoryRepository, SupabaseProductRepository, SupabaseStorageRepository } from '../../data-access/supabase/supabase.repositories';
import { ProductService } from '../../services/product.service';
import { AdminCategoryFormValue, AdminCategoryListItem, AdminCategorySort } from '../models/admin-catalog.models';

import { AdminActivityService } from './admin-activity.service';

@Injectable({ providedIn: 'root' })
export class AdminCategoriesService {
  private readonly activity = inject(AdminActivityService);
  private readonly categoryRepository = inject(SupabaseCategoryRepository);
  private readonly productRepository = inject(SupabaseProductRepository);
  private readonly storageRepository = inject(SupabaseStorageRepository);
  private readonly productService = inject(ProductService);

  private readonly categoriesSignal = signal<Tables<'categories'>[]>([]);
  private readonly productsSignal = signal<Tables<'products'>[]>([]);
  private readonly loadingSignal = signal(false);

  readonly isLoading = this.loadingSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly categoryList = computed<AdminCategoryListItem[]>(() => {
    const counts = new Map<string, number>();
    for (const product of this.productsSignal()) {
      const categoryId = product.category_id;
      if (!categoryId) continue;
      counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
    }

    return this.categoriesSignal().map(category => ({
      record: category,
      imageUrl: category.image_path ? this.storageRepository.getProductImageUrl(category.image_path) : '/images/product-placeholder.svg',
      productCount: counts.get(category.id) || 0,
    }));
  });

  async load() {
    this.loadingSignal.set(true);
    try {
      const [categories, products] = await Promise.all([
        this.categoryRepository.listAll(),
        this.productRepository.listAll(),
      ]);
      this.categoriesSignal.set(categories);
      this.productsSignal.set(products);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  createDefaultFormValue(): AdminCategoryFormValue {
    return {
      name: '',
      slug: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    };
  }

  createFormValueFromRecord(category: Tables<'categories'> | null): AdminCategoryFormValue {
    if (!category) return this.createDefaultFormValue();
    return {
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sortOrder: category.sort_order,
      isActive: category.is_active,
    };
  }

  async saveCategory(category: Tables<'categories'> | null, formValue: AdminCategoryFormValue, imageFile?: File | null, pickedImagePath?: string | null) {
    const payload = {
      name: formValue.name.trim(),
      slug: formValue.slug.trim().toLowerCase(),
      description: formValue.description.trim() || null,
      sort_order: formValue.sortOrder ?? 0,
      is_active: formValue.isActive,
    };

    const savedCategory = category
      ? await this.categoryRepository.update(category.id, payload)
      : await this.categoryRepository.create(payload);

    if (pickedImagePath) {
      // Phase 8 library pick: adopt the existing file by reference, no upload.
      await this.categoryRepository.update(savedCategory.id, { image_path: pickedImagePath });
    } else if (imageFile) {
      const extension = this.fileExtension(imageFile.name);
      const path = `categories/${savedCategory.slug}.${extension}`;
      await this.storageRepository.uploadProductImage(path, imageFile, { upsert: true });
      await this.categoryRepository.update(savedCategory.id, { image_path: path });
    }

    await this.load();
    await this.productService.refreshCatalog();
    await this.activity.log(category ? 'category.updated' : 'category.created', 'category', savedCategory.id, savedCategory.name);
  }

  async deleteCategory(category: Tables<'categories'>) {
    await this.categoryRepository.delete(category.id);
    if (category.image_path) {
      // Row deleted first, so the guarded removal no longer counts this record.
      await this.storageRepository.removeImageIfUnreferenced(category.image_path);
    }
    await this.load();
    await this.productService.refreshCatalog();
    await this.activity.log('category.deleted', 'category', category.id, category.name);
  }

  async toggleCategoryActive(category: Tables<'categories'>, isActive: boolean) {
    await this.categoryRepository.update(category.id, { is_active: isActive });
    await this.load();
    await this.productService.refreshCatalog();
    await this.activity.log(isActive ? 'category.activated' : 'category.deactivated', 'category', category.id, category.name);
  }

  slugExists(slug: string, excludingId?: string) {
    const normalized = slug.trim().toLowerCase();
    return this.categoriesSignal().some(category => category.slug.toLowerCase() === normalized && category.id !== excludingId);
  }

  filterCategories(items: AdminCategoryListItem[], search: string, sort: AdminCategorySort) {
    const query = search.toLowerCase().trim();
    let next = [...items];

    if (query) {
      next = next.filter(item => {
        const haystack = [item.record.name, item.record.slug, item.record.description || ''].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    switch (sort) {
      case 'name':
        next.sort((a, b) => a.record.name.localeCompare(b.record.name));
        break;
      case 'active-first':
        next.sort((a, b) => Number(b.record.is_active) - Number(a.record.is_active) || a.record.sort_order - b.record.sort_order);
        break;
      default:
        next.sort((a, b) => a.record.sort_order - b.record.sort_order || a.record.name.localeCompare(b.record.name));
        break;
    }

    return next;
  }

  private fileExtension(filename: string) {
    return filename.split('.').pop()?.toLowerCase() || 'jpg';
  }
}

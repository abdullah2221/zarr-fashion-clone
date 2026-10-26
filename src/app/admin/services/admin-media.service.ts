import { Injectable, inject, signal } from '@angular/core';
import { SupabaseMediaRepository } from '../../data-access/supabase/supabase.repositories';

export interface AdminMediaItem {
  /** Full storage path inside the product-images bucket. */
  path: string;
  name: string;
  folder: string;
  size: number | null;
  isImage: boolean;
  publicUrl: string;
  updatedAt: string | null;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];
const MAX_DEPTH = 4;
const MAX_ITEMS = 2000;

/**
 * Read-only media library (Phase 7): walks the product-images
 * bucket folder by folder and flattens it into a searchable list.
 * There is deliberately no delete/rename here.
 */
@Injectable({ providedIn: 'root' })
export class AdminMediaService {
  private readonly mediaRepository = inject(SupabaseMediaRepository);

  readonly items = signal<AdminMediaItem[]>([]);
  readonly isLoading = signal(false);

  async load() {
    this.isLoading.set(true);
    try {
      const collected: AdminMediaItem[] = [];
      await this.walk('', 0, collected);
      this.items.set(collected.sort((a, b) => a.path.localeCompare(b.path)));
    } finally {
      this.isLoading.set(false);
    }
  }

  filterItems(search: string): AdminMediaItem[] {
    const query = search.trim().toLowerCase();
    if (!query) return this.items();
    return this.items().filter(item => item.path.toLowerCase().includes(query));
  }

  formatSize(size: number | null): string {
    if (size === null || size === undefined) return '—';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  private async walk(folder: string, depth: number, collected: AdminMediaItem[]) {
    if (depth > MAX_DEPTH || collected.length >= MAX_ITEMS) return;
    const entries = await this.mediaRepository.listFolder(folder);
    for (const entry of entries) {
      const path = folder ? `${folder}/${entry.name}` : entry.name;
      if (entry.id === null) {
        // Storage list marks folders with a null id.
        await this.walk(path, depth + 1, collected);
      } else {
        const rawSize = entry.metadata?.['size'];
        collected.push({
          path,
          name: entry.name,
          folder,
          size: typeof rawSize === 'number' ? rawSize : null,
          isImage: IMAGE_EXTENSIONS.some(ext => entry.name.toLowerCase().endsWith(ext)),
          publicUrl: this.mediaRepository.getPublicUrl(path),
          updatedAt: entry.updated_at,
        });
      }
      if (collected.length >= MAX_ITEMS) return;
    }
  }
}

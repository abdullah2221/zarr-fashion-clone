import { ChangeDetectionStrategy, Component, EventEmitter, Output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminImageDraft } from '../models/admin-catalog.models';
import { AdminActionButtonComponent } from './admin-action-button.component';

@Component({
  selector: 'app-admin-image-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, AdminActionButtonComponent],
  templateUrl: './admin-image-uploader.component.html',
  styleUrl: './admin-image-uploader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminImageUploaderComponent {
  images = input<AdminImageDraft[]>([]);
  disabled = input(false);

  @Output() imagesChange = new EventEmitter<AdminImageDraft[]>();

  // Image validation constraints
  private readonly maxSizeBytes = 5 * 1024 * 1024; // 5MB
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  private validateFile(file: File): boolean {
    this.error.set(null);
    this.success.set(null);

    if (!this.allowedTypes.includes(file.type)) {
      this.error.set(`"${file.name}" has an unsupported format. Please upload JPEG, PNG, WEBP, GIF, or SVG.`);
      return false;
    }

    if (file.size > this.maxSizeBytes) {
      this.error.set(`"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size allowed is 5MB.`);
      return false;
    }

    return true;
  }

  onMainSelected(event: Event) {
    const file = this.extractFile(event);
    if (!file) return;

    if (!this.validateFile(file)) return;

    const currentImages = [...this.images()];
    const existing = currentImages.filter(image => !image.markedForDeletion);
    const previousPrimary = existing[0];
    const demotedImages = existing.slice(1).map(image => ({ ...image, isPrimary: false }));
    const mainImage: AdminImageDraft = {
      file,
      previewUrl: URL.createObjectURL(file),
      altText: existing[0]?.altText || '',
      isPrimary: true,
      sortOrder: 0,
    };
    const retiredPrimary = previousPrimary?.id || previousPrimary?.storagePath
      ? [{ ...previousPrimary, markedForDeletion: true }]
      : [];

    const next = [mainImage, ...demotedImages, ...retiredPrimary];
    this.emitState(next);
    this.success.set('Main image selected and validated.');
    setTimeout(() => this.success.set(null), 4000);
  }

  onGallerySelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const files = Array.from(input?.files || []);
    if (!files.length) return;

    const validFiles: File[] = [];
    for (const file of files) {
      if (this.validateFile(file)) {
        validFiles.push(file);
      } else {
        if (input) input.value = '';
        return;
      }
    }

    const next = [
      ...this.images().filter(image => !image.markedForDeletion),
      ...validFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        altText: '',
        isPrimary: false,
        sortOrder: 0,
      })),
    ];
    this.emitState(next);
    this.success.set(`Added ${validFiles.length} gallery image(s) successfully.`);
    setTimeout(() => this.success.set(null), 4000);
    if (input) input.value = '';
  }

  setPrimary(targetIndex: number) {
    const next = [...this.images().filter(image => !image.markedForDeletion)];
    const [target] = next.splice(targetIndex, 1);
    next.unshift(target);
    this.emitState([...next, ...this.images().filter(image => image.markedForDeletion)]);
  }

  move(targetIndex: number, direction: -1 | 1) {
    const next = [...this.images().filter(image => !image.markedForDeletion)];
    const swapIndex = targetIndex + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;

    [next[targetIndex], next[swapIndex]] = [next[swapIndex], next[targetIndex]];
    this.emitState([...next, ...this.images().filter(image => image.markedForDeletion)]);
  }

  remove(targetIndex: number) {
    const next = [...this.images()];
    const activeIndexes = next
      .map((image, index) => ({ image, index }))
      .filter(({ image }) => !image.markedForDeletion);
    const target = activeIndexes[targetIndex];
    if (!target) return;

    next[target.index] = { ...next[target.index], markedForDeletion: true };
    this.emitState(next);
  }

  updateAltText(targetIndex: number, value: string) {
    const next = [...this.images()];
    const activeIndexes = next
      .map((image, index) => ({ image, index }))
      .filter(({ image }) => !image.markedForDeletion);
    const target = activeIndexes[targetIndex];
    if (!target) return;
    next[target.index] = { ...next[target.index], altText: value };
    this.emitState(next);
  }

  private emitState(images: AdminImageDraft[]) {
    const active = images.filter(image => !image.markedForDeletion).map((image, index) => ({
      ...image,
      isPrimary: index === 0,
      sortOrder: index,
    }));
    const deleted = images.filter(image => image.markedForDeletion).map(image => ({ ...image, isPrimary: false }));
    this.imagesChange.emit([...active, ...deleted]);
  }

  private extractFile(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (input) input.value = '';
    return file;
  }
}

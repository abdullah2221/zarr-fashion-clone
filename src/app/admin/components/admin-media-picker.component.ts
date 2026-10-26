import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AdminMediaItem, AdminMediaService } from '../services/admin-media.service';

/**
 * Shared media picker dialog (Phase 8). Reuses the Admin > Media
 * library listing (AdminMediaService) so admins pick an already
 * approved image instead of re-uploading it.
 *
 * The pick is by REFERENCE: the caller stores the item's storage path.
 * Nothing is copied or uploaded at pick time. Deleting a record never
 * removes a file another record still references (see
 * SupabaseStorageRepository.removeImageIfUnreferenced), so shared
 * picks cannot break the record they were picked from.
 */
@Component({
  selector: 'app-admin-media-picker',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './admin-media-picker.component.html',
  styleUrl: './admin-media-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMediaPickerComponent implements OnInit {
  readonly media = inject(AdminMediaService);

  @Output() picked = new EventEmitter<AdminMediaItem>();
  @Output() closed = new EventEmitter<void>();

  readonly search = signal('');

  ngOnInit() {
    void this.media.load();
  }

  visibleItems(): AdminMediaItem[] {
    return this.media.filterItems(this.search()).filter(item => item.isImage);
  }

  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

  choose(item: AdminMediaItem) {
    this.picked.emit(item);
  }
}

import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminMediaService, AdminMediaItem } from '../../services/admin-media.service';

@Component({
  selector: 'app-admin-media-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-media-page.component.html',
  styleUrl: './admin-media-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMediaPageComponent implements OnInit {
  readonly service = inject(AdminMediaService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly search = signal('');
  readonly error = signal<string | null>(null);
  readonly copiedPath = signal<string | null>(null);

  ngOnInit() {
    void this.service.load().catch(err => this.error.set(err instanceof Error ? err.message : 'Something went wrong.'));
  }

  filtered(): AdminMediaItem[] {
    return this.service.filterItems(this.search());
  }

  async copyUrl(item: AdminMediaItem) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      await navigator.clipboard.writeText(item.publicUrl);
      this.copiedPath.set(item.path);
    } catch {
      this.error.set('Copy failed — copy the URL from the path shown below the file name.');
    }
  }
}

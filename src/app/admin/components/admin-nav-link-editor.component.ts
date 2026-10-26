import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorefrontNavLink } from '../../shared/models/storefront-content.models';

/**
 * Structured menu row editor (Phase 8). Replaces the "Label | URL"
 * textarea for header and mobile menus in Admin > Settings.
 *
 * Controlled component: the parent owns the array; every edit emits a
 * NEW array (immutable updates), so the parent signal stays the single
 * source of truth and the save path — which serializes the array back
 * to the stored text format — is unchanged. One level of sub-links:
 * "Add sub-link" under a top-level link; sub-links cannot nest further.
 */
@Component({
  selector: 'app-admin-nav-link-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-nav-link-editor.component.html',
  styleUrl: './admin-nav-link-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNavLinkEditorComponent {
  links = input<StorefrontNavLink[]>([]);

  @Output() linksChange = new EventEmitter<StorefrontNavLink[]>();

  private emit(links: StorefrontNavLink[]) {
    this.linksChange.emit(links);
  }

  updateTop(index: number, patch: Partial<StorefrontNavLink>) {
    this.emit(this.links().map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  updateChild(parentIndex: number, childIndex: number, patch: Partial<StorefrontNavLink>) {
    this.emit(this.links().map((link, i) => {
      if (i !== parentIndex) return link;
      return {
        ...link,
        children: (link.children ?? []).map((child, j) => (j === childIndex ? { ...child, ...patch } : child)),
      };
    }));
  }

  moveTop(index: number, direction: -1 | 1) {
    const links = [...this.links()];
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    [links[index], links[target]] = [links[target], links[index]];
    this.emit(links);
  }

  moveChild(parentIndex: number, childIndex: number, direction: -1 | 1) {
    this.emit(this.links().map((link, i) => {
      if (i !== parentIndex) return link;
      const children = [...(link.children ?? [])];
      const target = childIndex + direction;
      if (target < 0 || target >= children.length) return link;
      [children[childIndex], children[target]] = [children[target], children[childIndex]];
      return { ...link, children };
    }));
  }

  removeTop(index: number) {
    this.emit(this.links().filter((_, i) => i !== index));
  }

  removeChild(parentIndex: number, childIndex: number) {
    this.emit(this.links().map((link, i) => {
      if (i !== parentIndex) return link;
      return { ...link, children: (link.children ?? []).filter((_, j) => j !== childIndex) };
    }));
  }

  addTop() {
    this.emit([...this.links(), { label: '', url: '' }]);
  }

  addChild(parentIndex: number) {
    this.emit(this.links().map((link, i) => {
      if (i !== parentIndex) return link;
      return { ...link, children: [...(link.children ?? []), { label: '', url: '' }] };
    }));
  }
}

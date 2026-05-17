import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';
import { AdminSessionService } from '../../services/admin-session.service';

interface AdminNavItem {
  label: string;
  icon: string;
  path?: string;
  soon?: boolean;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {
  private readonly router = inject(Router);
  readonly session = inject(AdminSessionService);

  readonly drawerOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly searchQuery = signal('');
  readonly breadcrumbs = signal<string[]>(['Admin', 'Dashboard']);
  readonly roleLabel = computed(() => this.session.role().replace('_', ' '));
  readonly pageTitle = computed(() => this.breadcrumbs().at(-1) || 'Dashboard');
  readonly userInitials = computed(() => {
    const name = this.session.displayName().trim();
    if (!name) return 'UA';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  });
  readonly navItems: AdminNavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { label: 'Verification', icon: 'verified_user', path: '/admin/verify' },
    { label: 'Products', icon: 'inventory_2', path: '/admin/products' },
    { label: 'Categories', icon: 'category', path: '/admin/categories' },
    { label: 'Campaigns', icon: 'campaign', path: '/admin/campaigns' },
    { label: 'Settings', icon: 'tune', path: '/admin/settings' },
    { label: 'Orders', icon: 'receipt_long', soon: true },
    { label: 'Customers', icon: 'groups', soon: true },
    { label: 'Feedback', icon: 'reviews', soon: true },
  ];

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.breadcrumbs.set(this.buildBreadcrumbs(url));
      this.drawerOpen.set(false);
    });

    this.breadcrumbs.set(this.buildBreadcrumbs(this.router.url));
  }

  toggleDrawer() {
    this.drawerOpen.update(open => !open);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  async signOut() {
    await this.session.signOut('/login');
  }

  private buildBreadcrumbs(url: string) {
    const parts = url.split('?')[0].split('/').filter(Boolean);
    if (!parts.length) return ['Admin'];
    return parts.map(part => part.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()));
  }
}

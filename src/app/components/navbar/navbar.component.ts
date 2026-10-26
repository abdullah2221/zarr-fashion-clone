import { Component, HostListener, signal, inject, PLATFORM_ID, OnInit, computed } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../services/cart.service';
import { LayoutService } from '../../core/services/layout.service';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { filter } from 'rxjs';
import { AdminSessionService } from '../../services/admin-session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cartService = inject(CartService);
  private router = inject(Router);
  layoutService = inject(LayoutService);
  readonly content = inject(StorefrontContentService);
  readonly session = inject(AdminSessionService);
  
  isTop = signal(true);
  isMenuOpen = signal(false);
  isAccountMenuOpen = signal(false);
  /** Phase 8: mobile sub-menus expanded by parent key (label + url). */
  readonly expandedMobileParents = signal<ReadonlySet<string>>(new Set());

  toggleMobileChildren(key: string) {
    this.expandedMobileParents.update(current => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  isHomePage = signal(true);
  isFocusMode = this.layoutService.isFocusMode;
  cartCount = this.cartService.count;
  authResolved = computed(() => this.session.authStatus() !== 'loading');
  isLoggedIn = this.session.isAuthenticated;
  isAdmin = this.session.isAdmin;
  isCustomer = computed(() => this.isLoggedIn() && !this.isAdmin());
  displayName = this.session.displayName;
  roleLabel = computed(() => this.session.role().replace('_', ' '));

  ngOnInit() {
    void this.session.ensureInitialized();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isHomePage.set(url === '/' || url === '/home' || url === '');
      
      // Auto-detect focus mode for specific routes
      const focusRoutes = ['/checkout', '/cart'];
      this.layoutService.setFocusMode(focusRoutes.some(route => url.startsWith(route)));
      
      this.isMenuOpen.set(false); // Close menu on navigation
      this.isAccountMenuOpen.set(false);
      
      // Reset scroll state
      if (isPlatformBrowser(this.platformId)) {
        this.isTop.set(window.scrollY < 50);
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.isTop.set(window.scrollY < 50);
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  toggleAccountMenu() {
    this.isAccountMenuOpen.update(value => !value);
  }

  async signOut() {
    await this.session.signOut('/login');
  }
}

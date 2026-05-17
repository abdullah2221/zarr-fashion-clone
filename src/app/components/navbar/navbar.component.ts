import { Component, HostListener, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../services/cart.service';
import { LayoutService } from '../../core/services/layout.service';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { filter } from 'rxjs';

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
  
  isTop = signal(true);
  isMenuOpen = signal(false);
  isHomePage = signal(true);
  isFocusMode = this.layoutService.isFocusMode;
  cartCount = this.cartService.count;

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isHomePage.set(url === '/' || url === '/home' || url === '');
      
      // Auto-detect focus mode for specific routes
      const focusRoutes = ['/checkout', '/cart'];
      this.layoutService.setFocusMode(focusRoutes.some(route => url.startsWith(route)));
      
      this.isMenuOpen.set(false); // Close menu on navigation
      
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
}

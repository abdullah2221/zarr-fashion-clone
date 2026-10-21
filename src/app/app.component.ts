import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  isHomePage = signal(true);
  isAdminRoute = signal(false);

  ngOnInit() {
    this.updateRouteState(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.updateRouteState(url);
    });
  }

  private updateRouteState(url: string) {
    const cleanUrl = (url || '').split('?')[0];
    this.isHomePage.set(cleanUrl === '/' || cleanUrl === '/home' || cleanUrl === '');
    this.isAdminRoute.set(cleanUrl.startsWith('/admin'));
  }
}

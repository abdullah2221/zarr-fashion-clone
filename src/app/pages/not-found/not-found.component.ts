import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <section class="not-found">
      <div class="not-found__inner">
        <mat-icon>travel_explore</mat-icon>
        <span class="eyebrow">404</span>
        <h1>Page Not Found</h1>
        <p>The page may have moved, expired, or never existed. Explore UR-Fashion collections from the homepage.</p>
        <a routerLink="/" class="not-found__cta">Go To Home</a>
      </div>
    </section>
  `,
  styles: [`
    .not-found {
      min-height: 70vh;
      display: grid;
      place-items: center;
      padding: 7rem 1rem 4rem;
      background: linear-gradient(180deg, #fbf8f1, #fff);
    }
    .not-found__inner {
      max-width: 44rem;
      text-align: center;
      display: grid;
      justify-items: center;
      gap: .75rem;
    }
    .not-found mat-icon {
      font-size: 52px;
      width: 52px;
      height: 52px;
      color: #a87f22;
    }
    .not-found h1 {
      margin: 0;
      font-family: "Playfair Display", ui-serif, Georgia, serif;
      font-size: clamp(2.2rem, 5vw, 4.5rem);
      line-height: 1.02;
      letter-spacing: -.04em;
      font-weight: 500;
    }
    .not-found p {
      margin: 0;
      color: #4b5563;
      line-height: 1.7;
    }
    .not-found__cta {
      margin-top: .75rem;
      min-height: 50px;
      padding: 0 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #111111;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .14em;
      text-transform: uppercase;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent implements OnInit {
  private metaService = inject(MetaService);

  ngOnInit() {
    this.metaService.setSeo({
      title: '404 Not Found',
      description: 'The requested page could not be found on UR-Fashion.',
      path: '/404',
      noindex: true
    });
  }
}


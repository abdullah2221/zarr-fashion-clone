import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGridComponent } from '../../components/product-grid/product-grid.component';
import { WishlistService } from '../../services/wishlist.service';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { CampaignChipsComponent } from '../../components/campaign-chips/campaign-chips.component';
import { MetaService } from '../../core/services/meta.service';
import { AdminSessionService } from '../../services/admin-session.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, ProductGridComponent, EmptyStateComponent, CampaignChipsComponent],
  template: `
    <section class="wishlist-page">
      <div class="wishlist-page__container">
        <header class="wishlist-page__header">
          <span class="eyebrow">Saved styles</span>
          <h1>Wishlist</h1>
          <p>Save Eid, lawn and wedding picks and come back when you are ready to shop.</p>
          <app-campaign-chips [chips]="chips"></app-campaign-chips>
        </header>

        @if (items().length) {
          <div class="wishlist-page__meta">
            <span>{{ isLoggedIn() ? 'Synced with your account' : 'Saved pieces from your device' }}</span>
            <strong>{{ items().length }} items</strong>
          </div>
          @if (error()) {
            <p class="wishlist-page__error">{{ error() }}</p>
          }
          <app-product-grid [products]="items()"></app-product-grid>
        } @else {
          <app-empty-state
            icon="favorite_border"
            title="Your wishlist is empty"
            text="Tap the heart on any product to save your favorite pieces."
            primaryLabel="Start Shopping"
            primaryLink="/shop"
          ></app-empty-state>
        }
      </div>
    </section>
  `,
  styles: [`
    .wishlist-page {
      padding: 3.5rem 0 5rem;
      background: linear-gradient(180deg, #fbf8f1, #ffffff 38%);
    }
    .wishlist-page__container {
      width: 100%;
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .wishlist-page__header {
      text-align: center;
      margin-bottom: 1.5rem;
      display: grid;
      justify-items: center;
      gap: .75rem;
    }
    .wishlist-page__header h1 {
      margin: 0;
      font-family: "Playfair Display", ui-serif, Georgia, serif;
      font-size: clamp(2.25rem, 5vw, 4rem);
      font-weight: 500;
      line-height: 1.03;
      letter-spacing: -.04em;
    }
    .wishlist-page__header p {
      margin: 0;
      max-width: 42rem;
      color: #4b5563;
      line-height: 1.7;
    }
    .wishlist-page__meta {
      margin-bottom: 1.25rem;
      display: flex;
      justify-content: space-between;
      gap: .75rem;
      color: #4b5563;
      font-size: .875rem;
    }
    .wishlist-page__meta strong {
      color: #111111;
      white-space: nowrap;
    }
    .wishlist-page__error {
      margin: 0 0 1rem;
      color: #b91c1c;
      border-left: 3px solid #b91c1c;
      background: rgba(185, 28, 28, .08);
      padding: .6rem .75rem;
      font-size: .9rem;
    }
    @media (min-width: 640px) {
      .wishlist-page__container {
        padding: 0 1.5rem;
      }
    }
    @media (min-width: 1024px) {
      .wishlist-page__container {
        padding: 0 2rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private metaService = inject(MetaService);
  private session = inject(AdminSessionService);
  items = this.wishlistService.items;
  error = this.wishlistService.error;
  isLoggedIn = this.session.isLoggedIn;

  chips = ['Trending in Pakistan', 'Eid Collection', 'Summer Lawn', 'Wedding/Formal', 'Ready to Wear'];
  count = computed(() => this.items().length);

  ngOnInit() {
    this.metaService.setSeo({
      title: 'Wishlist',
      description: 'Your saved UR-Fashion pieces for Eid, lawn, and wedding season.',
      path: '/wishlist',
      noindex: true
    });
    this.metaService.clearJsonLd(['seo-product-schema', 'seo-breadcrumb-schema']);
  }
}

import { Component, OnInit, signal, OnDestroy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HERO_SLIDES } from '../../data/data';
import { MatIconModule } from '@angular/material/icon';
import { StorefrontTrustBadge } from '../../shared/models/storefront-content.models';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  slides = input(HERO_SLIDES);
  trustHighlights = input<StorefrontTrustBadge[]>([
    { icon: 'local_shipping', label: 'Free delivery' },
    { icon: 'payments', label: 'Cash on Delivery' },
    { icon: 'verified_user', label: 'Secure checkout' },
  ]);
  currentSlide = signal(0);
  private autoPlayInterval: ReturnType<typeof setInterval> | undefined;
  private touchStartX: number | null = null;
  private static readonly SWIPE_THRESHOLD_PX = 50;

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide() {
    this.currentSlide.update(i => (i + 1) % this.slides().length);
  }

  prevSlide() {
    this.currentSlide.update(i => (i === 0 ? this.slides().length - 1 : i - 1));
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    // Reset interval when manually changed
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  // Phase 7.2 — mobile-only swipe. Desktop is untouched: arrows, fade and
  // autoplay behave exactly as before, and these handlers ignore any
  // viewport wider than 767px. No preventDefault: vertical page scroll
  // keeps working, only a clear horizontal swipe changes slides.
  onTouchStart(event: TouchEvent) {
    if (!this.isMobileViewport()) return;
    this.touchStartX = event.touches[0]?.clientX ?? null;
    this.stopAutoPlay();
  }

  onTouchEnd(event: TouchEvent) {
    const startX = this.touchStartX;
    this.touchStartX = null;
    if (startX === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX !== undefined) {
      const dx = endX - startX;
      if (dx < -HeroComponent.SWIPE_THRESHOLD_PX) this.nextSlide();
      else if (dx > HeroComponent.SWIPE_THRESHOLD_PX) this.prevSlide();
    }
    // Always resume autoplay after the touch (it was paused on touchstart),
    // matching the reset behaviour of a manual dot/arrow change.
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  }
}

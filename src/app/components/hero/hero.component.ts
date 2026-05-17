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
}

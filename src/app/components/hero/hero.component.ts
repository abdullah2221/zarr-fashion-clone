import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HERO_SLIDES } from '../../data/data';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  slides = HERO_SLIDES;
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
    this.currentSlide.update(i => (i + 1) % this.slides.length);
  }

  prevSlide() {
    this.currentSlide.update(i => (i === 0 ? this.slides.length - 1 : i - 1));
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    // Reset interval when manually changed
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}

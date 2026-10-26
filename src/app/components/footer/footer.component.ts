import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { EngagementService, SubscribeResult } from '../../services/engagement.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  layoutService = inject(LayoutService);
  isFocusMode = this.layoutService.isFocusMode;
  readonly content = inject(StorefrontContentService);
  private readonly engagement = inject(EngagementService);

  newsletterEmail = '';
  readonly newsletterSubmitting = signal(false);
  readonly newsletterStatus = signal<SubscribeResult | null>(null);

  async subscribe(form: NgForm) {
    if (this.newsletterSubmitting()) return;
    if (form.invalid || !this.newsletterEmail.trim()) {
      this.newsletterStatus.set('error');
      return;
    }
    this.newsletterSubmitting.set(true);
    this.newsletterStatus.set(null);
    try {
      const result = await this.engagement.subscribe(this.newsletterEmail);
      this.newsletterStatus.set(result);
      if (result === 'success') {
        this.newsletterEmail = '';
        form.resetForm();
      }
    } finally {
      this.newsletterSubmitting.set(false);
    }
  }
}

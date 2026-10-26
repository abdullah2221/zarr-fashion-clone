import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FaqsService } from '../../services/faqs.service';

/**
 * Builder section 'faq-list' (Phase 7): renders the FAQ records
 * (Admin > FAQs) on any page the section is placed on. The records
 * are authoritative once loaded — before that, or if the faqs
 * table is unreachable, the block renders nothing (the FAQ page
 * itself keeps its Phase 6 fallback cards).
 */
@Component({
  selector: 'app-faq-list',
  standalone: true,
  templateUrl: './faq-list.component.html',
  styleUrl: './faq-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqListComponent {
  private readonly faqsService = inject(FaqsService);

  readonly eyebrow = input('');
  readonly title = input('');
  readonly limit = input<number | null>(null);

  readonly items = computed(() => {
    if (this.faqsService.state() !== 'ready') return [];
    const all = this.faqsService.items();
    const limit = this.limit();
    return limit ? all.slice(0, limit) : all;
  });

  constructor() {
    void this.faqsService.ensureLoaded();
  }
}

import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaService } from '../../core/services/meta.service';
import { CampaignChipsComponent } from '../../components/campaign-chips/campaign-chips.component';
import { TrustBadgeStripComponent, TrustBadgeItem } from '../../components/trust-badge-strip/trust-badge-strip.component';
import { FaqListComponent } from '../../components/faq-list/faq-list.component';
import { CustomContentComponent } from '../../components/custom-content/custom-content.component';
import { AdminSessionService } from '../../services/admin-session.service';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { SitePagesService } from '../../services/site-pages.service';
import { FaqsService } from '../../services/faqs.service';
import { EngagementService } from '../../services/engagement.service';
import { SitePageSection, StorefrontCustomContent } from '../../shared/models/page-content.models';

type PageKey =
  | 'wishlist'
  | 'checkout'
  | 'login'
  | 'account'
  | 'track-order'
  | 'contact'
  | 'about'
  | 'faq'
  | 'privacy-policy'
  | 'terms-conditions'
  | 'return-exchange-policy';

interface StaticPageContent {
  formType?: 'checkout' | 'auth' | 'track' | 'contact' | 'wishlist' | 'account';
  eyebrow: string;
  title: string;
  intro: string;
  icon: string;
  ctaText?: string;
  ctaLink?: string;
  sections: Array<{ title: string; body: string; icon?: string }>;
  secondary?: Array<{ label: string; value: string }>;
}

/**
 * Titles only — the page body copy lives in site_pages /
 * page_sections (Admin > Pages; seeded verbatim by the phase-7
 * migration). This map exists solely so the safety state below can
 * still show the correct page title if the CMS record is missing.
 */
const PAGE_TITLES: Record<PageKey, string> = {
  wishlist: 'Your Wishlist',
  checkout: 'Checkout',
  login: 'Login / Register',
  account: 'Account & Profile',
  'track-order': 'Track Your Order',
  contact: 'Contact Zeenat',
  about: 'About Zeenat',
  faq: 'Frequently Asked Questions',
  'privacy-policy': 'Privacy Policy',
  'terms-conditions': 'Terms & Conditions',
  'return-exchange-policy': 'Return / Exchange Policy',
};

const FORM_TYPES: Array<NonNullable<StaticPageContent['formType']>> = ['checkout', 'auth', 'track', 'contact', 'wishlist', 'account'];

@Component({
  selector: 'app-static-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, ReactiveFormsModule, CampaignChipsComponent, TrustBadgeStripComponent, FaqListComponent, CustomContentComponent],
  templateUrl: './static-page.component.html',
  styleUrl: './static-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private metaService = inject(MetaService);
  private formBuilder = inject(FormBuilder);
  private adminSession = inject(AdminSessionService);
  private pagesService = inject(SitePagesService);
  private faqsService = inject(FaqsService);
  private engagement = inject(EngagementService);
  readonly contentService = inject(StorefrontContentService);

  page = signal<StaticPageContent>({ eyebrow: '', title: 'Zeenat', intro: '', icon: 'article', sections: [] });
  readonly pageKey = signal<PageKey>('about');
  isMissing = signal(false);
  isAuthSubmitting = signal(false);
  authError = signal<string | null>(null);
  authNotice = signal<string | null>(null);
  authForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** Contact enquiry form (Phase 7): submits to contact_messages. */
  contactForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    contact: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(5)]],
  });
  isContactSubmitting = signal(false);
  contactError = signal<string | null>(null);
  contactNotice = signal<string | null>(null);

  /** Builder sections placed on this page besides its static-content block. */
  readonly extraSections = computed(() => {
    const page = this.pagesService.getPage(this.pageKey());
    return (page?.sections || []).filter(
      section => section.sectionType === 'faq-list' || section.sectionType === 'custom-content'
    );
  });

  campaignChips = this.contentService.campaignChips;
  trustItems = signal<TrustBadgeItem[]>([]);

  ngOnInit() {
    this.route.data.subscribe(data => {
      const key = (data['page'] || 'about') as PageKey;
      this.pageKey.set(key);
      this.applyContent(key);
      void this.pagesService.ensureLoaded(key).then(() => this.applyContent(key));
      void this.faqsService.ensureLoaded().then(() => {
        if (this.pageKey() === 'faq') this.applyContent('faq');
      });
    });

    void this.adminSession.ensureInitialized().then(() => {
      if (this.adminSession.isAuthenticated()) {
        this.authNotice.set(`Signed in as ${this.adminSession.user()?.email || this.adminSession.displayName()}.`);
      }
    });

    this.trustItems.set(this.contentService.trustBadges().map(item => ({ icon: item.icon, label: item.label })));
  }

  async signIn() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.authForm.getRawValue();
    this.isAuthSubmitting.set(true);
    this.authError.set(null);
    this.authNotice.set(null);

    try {
      await this.adminSession.signIn(email, password);
      const redirect = this.route.snapshot.queryParamMap.get('redirect');
      const target = redirect || (this.adminSession.isAdmin() ? '/admin/dashboard' : '/account');
      await this.router.navigateByUrl(target);
    } catch (error) {
      this.authError.set(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      this.isAuthSubmitting.set(false);
    }
  }

  async submitContact() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.isContactSubmitting.set(true);
    this.contactError.set(null);
    this.contactNotice.set(null);
    try {
      const sent = await this.engagement.sendContactMessage(this.contactForm.getRawValue());
      if (sent) {
        this.contactNotice.set('Message sent. Our team will get back to you soon.');
        this.contactForm.reset();
      } else {
        this.contactError.set('Unable to send your message right now. Please try WhatsApp or email instead.');
      }
    } finally {
      this.isContactSubmitting.set(false);
    }
  }

  /** Template helpers for the builder sections rendered below the page grid. */
  customContentOf(section: SitePageSection): StorefrontCustomContent {
    return this.pagesService.customContent(section);
  }

  sectionText(section: SitePageSection, key: string): string {
    return this.pagesService.sectionContent(section, key);
  }

  sectionLimitOf(section: SitePageSection): number | null {
    return this.pagesService.sectionLimit(section);
  }

  private applyContent(key: PageKey) {
    const dbPage = this.pagesService.getPage(key);
    const section = dbPage?.sections.find(item => item.sectionType === 'static-content');

    if (dbPage && section) {
      const parsed = this.pagesService.staticContent(section);
      const content: StaticPageContent = {
        eyebrow: parsed.eyebrow,
        title: dbPage.title,
        intro: parsed.intro,
        icon: parsed.icon,
        ctaText: parsed.ctaText,
        ctaLink: parsed.ctaLink,
        formType: this.asFormType(parsed.formType),
        sections: parsed.sections,
        secondary: parsed.secondary,
      };
      // Phase 7: on the FAQ page the Q&A cards come from the faqs
      // table once it has answered (records are authoritative,
      // even if the owner deactivated every question). Before
      // that — or if the table is unreachable — the seeded
      // static-content cards above remain, word for word.
      if (key === 'faq' && this.faqsService.state() === 'ready') {
        content.sections = this.faqsService.items().map(item => ({ title: item.question, body: item.answer }));
      }
      this.page.set(this.withStorefrontOverrides(key, content));
      this.isMissing.set(false);
    } else if (this.pagesService.isLoaded(key)) {
      // The CMS was reached but holds no record for this page:
      // show the title with a neutral placeholder, never invented copy.
      this.page.set({ eyebrow: '', title: dbPage?.title || PAGE_TITLES[key] || 'Zeenat', intro: '', icon: 'article', sections: [] });
      this.isMissing.set(true);
    } else {
      this.page.set({ eyebrow: '', title: PAGE_TITLES[key] || 'Zeenat', intro: '', icon: 'article', sections: [] });
      this.isMissing.set(false);
    }

    const content = this.page();
    const noindexPages: PageKey[] = ['checkout', 'login', 'account', 'track-order'];
    this.metaService.setSeo({
      title: content.title,
      description: content.intro,
      path: this.router.url,
      noindex: noindexPages.includes(key),
      keywords: `Zeenat, ${content.title}, Pakistani fashion`
    });
    this.metaService.clearJsonLd(['seo-product-schema', 'seo-breadcrumb-schema']);
  }

  private asFormType(value: string | undefined): StaticPageContent['formType'] {
    return FORM_TYPES.includes(value as NonNullable<StaticPageContent['formType']>)
      ? (value as StaticPageContent['formType'])
      : undefined;
  }

  private withStorefrontOverrides(key: PageKey, content: StaticPageContent): StaticPageContent {
    const settings = this.contentService.settings();
    const overrides: Partial<Record<PageKey, Partial<StaticPageContent>>> = {
      contact: {
        intro: settings.contactPageIntro || content.intro,
        secondary: [
          { label: 'WhatsApp', value: settings.whatsappNumber || 'Chat support available' },
          { label: 'Email', value: settings.supportEmail || 'support@ur-fashion.pk' },
          { label: 'Phone', value: settings.supportPhone || 'Pakistan-wide online store' },
        ],
      },
      about: {
        intro: settings.aboutPageIntro || content.intro,
      },
      faq: {
        intro: settings.faqIntro || content.intro,
      },
      'privacy-policy': {
        intro: settings.privacySummary || content.intro,
      },
      'terms-conditions': {
        intro: settings.termsSummary || content.intro,
      },
      'return-exchange-policy': {
        intro: settings.returnExchangeSummary || content.intro,
      },
    };

    return {
      ...content,
      ...(overrides[key] || {}),
    };
  }
}

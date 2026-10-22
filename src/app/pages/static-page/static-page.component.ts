import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaService } from '../../core/services/meta.service';
import { CampaignChipsComponent } from '../../components/campaign-chips/campaign-chips.component';
import { TrustBadgeStripComponent, TrustBadgeItem } from '../../components/trust-badge-strip/trust-badge-strip.component';
import { AdminSessionService } from '../../services/admin-session.service';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { SitePagesService } from '../../services/site-pages.service';

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
  imports: [CommonModule, RouterLink, MatIconModule, ReactiveFormsModule, CampaignChipsComponent, TrustBadgeStripComponent],
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
  readonly contentService = inject(StorefrontContentService);

  page = signal<StaticPageContent>({ eyebrow: '', title: 'Zeenat', intro: '', icon: 'article', sections: [] });
  isMissing = signal(false);
  isAuthSubmitting = signal(false);
  authError = signal<string | null>(null);
  authNotice = signal<string | null>(null);
  authForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  campaignChips = this.contentService.campaignChips;
  trustItems = signal<TrustBadgeItem[]>([]);

  ngOnInit() {
    this.route.data.subscribe(data => {
      const key = (data['page'] || 'about') as PageKey;
      this.applyContent(key);
      void this.pagesService.ensureLoaded(key).then(() => this.applyContent(key));
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

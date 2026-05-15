import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MetaService } from '../../core/services/meta.service';
import { CampaignChipsComponent } from '../../components/campaign-chips/campaign-chips.component';
import { TrustBadgeStripComponent, TrustBadgeItem } from '../../components/trust-badge-strip/trust-badge-strip.component';

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

const CONTENT: Record<PageKey, StaticPageContent> = {
  wishlist: {
    eyebrow: 'Saved styles',
    title: 'Your Wishlist',
    intro: 'Save Eid looks, lawn suits and wedding edits here before they sell out. Sign in later to keep your wishlist across devices.',
    icon: 'favorite_border',
    ctaText: 'Explore New Arrivals',
    ctaLink: '/shop',
    formType: 'wishlist',
    sections: [
      { icon: 'favorite', title: 'No saved items yet', body: 'Tap the heart on any product card to shortlist your favourite UR-Fashion pieces.' },
      { icon: 'notifications', title: 'Sale-ready planning', body: 'Use wishlist as a shopping shortlist for Eid drops, lawn launches and limited-time sale campaigns.' }
    ]
  },
  checkout: {
    eyebrow: 'Secure checkout',
    title: 'Checkout',
    intro: 'Review delivery details, payment choice and order totals in one calm checkout flow, with Cash on Delivery clearly visible for Pakistani customers.',
    icon: 'lock',
    ctaText: 'Return to Bag',
    ctaLink: '/cart',
    formType: 'checkout',
    sections: [
      { icon: 'local_shipping', title: 'Delivery details', body: 'Collect customer name, phone number, address, city and province before payment selection.' },
      { icon: 'payments', title: 'Payment options', body: 'Cash on Delivery is highlighted alongside secure payment reassurance for customer confidence.' },
      { icon: 'receipt_long', title: 'Order review', body: 'A clear order summary, delivery fee, discount area, estimated total and policy links are presented before confirmation.' }
    ]
  },
  login: {
    eyebrow: 'Customer access',
    title: 'Login / Register',
    intro: 'A clean account entry point for faster checkout, wishlist saving and order tracking.',
    icon: 'person',
    ctaText: 'Continue Shopping',
    ctaLink: '/shop',
    formType: 'auth',
    sections: [
      { icon: 'login', title: 'Returning customers', body: 'Login with email or phone number to view saved addresses, wishlist and orders.' },
      { icon: 'person_add', title: 'New customers', body: 'Register quickly using email/phone and keep the form short for mobile shoppers.' }
    ]
  },
  account: {
    eyebrow: 'My UR-Fashion',
    title: 'Account & Profile',
    intro: 'Central customer area for profile details, saved addresses, wishlist and recent orders.',
    icon: 'account_circle',
    ctaText: 'Track an Order',
    ctaLink: '/track-order',
    formType: 'account',
    sections: [
      { icon: 'badge', title: 'Profile details', body: 'Keep name, phone, email and preferences easy to update.' },
      { icon: 'home', title: 'Saved addresses', body: 'Support multiple Pakistani delivery addresses for home, office or gifting orders.' },
      { icon: 'shopping_bag', title: 'Order history', body: 'Show order status, payment mode and reorder options.' }
    ]
  },
  'track-order': {
    eyebrow: 'Order support',
    title: 'Track Your Order',
    intro: 'Give shoppers confidence with clear order tracking, delivery expectations and customer support visibility.',
    icon: 'travel_explore',
    ctaText: 'Contact Support',
    ctaLink: '/contact',
    formType: 'track',
    sections: [
      { icon: 'tag', title: 'Order number', body: 'Customers should enter their order number and phone/email used at checkout.' },
      { icon: 'local_shipping', title: 'Delivery updates', body: 'Show packing, dispatch, in transit and delivered states in a clean tracking timeline.' }
    ]
  },
  contact: {
    eyebrow: 'Customer care',
    title: 'Contact UR-Fashion',
    intro: 'Support should be easy to find, especially for COD, exchange and delivery questions.',
    icon: 'support_agent',
    formType: 'contact',
    sections: [
      { icon: 'call', title: 'Phone & WhatsApp', body: 'Message UR-Fashion on WhatsApp for order, delivery and exchange support during business hours.' },
      { icon: 'mail', title: 'Email support', body: 'Use support@ur-fashion.pk for order, return and partnership inquiries.' },
      { icon: 'schedule', title: 'Support hours', body: 'Confirm launch support hours once operations are finalized, then keep them consistent across contact surfaces.' }
    ],
    secondary: [
      { label: 'WhatsApp', value: 'Chat support available' },
      { label: 'Email', value: 'support@ur-fashion.pk' },
      { label: 'Location', value: 'Pakistan-wide online store' }
    ]
  },
  about: {
    eyebrow: 'Our story',
    title: 'About UR-Fashion',
    intro: 'UR-Fashion is positioned as a premium Pakistani fashion storefront for seasonal wardrobes, festive dressing and everyday confidence.',
    icon: 'auto_awesome',
    sections: [
      { icon: 'style', title: 'Premium fashion curation', body: 'A focused edit of lawn, unstitched suits, ready-to-wear, wedding looks and accessories.' },
      { icon: 'verified', title: 'Trust-first shopping', body: 'Clear delivery, COD and exchange messaging helps reduce friction for online fashion buyers.' },
      { icon: 'public', title: 'Made for Pakistan', body: 'Campaigns reflect Eid, Ramadan, summer lawn, winter arrivals, weddings and 14 August moments.' }
    ]
  },
  faq: {
    eyebrow: 'Help center',
    title: 'Frequently Asked Questions',
    intro: 'Answers to common shopping, delivery, COD and exchange questions.',
    icon: 'quiz',
    sections: [
      { title: 'Do you offer Cash on Delivery?', body: 'Yes. Cash on Delivery availability is shown throughout the storefront and at checkout for eligible orders.' },
      { title: 'How long does delivery take?', body: 'Use clear city-based delivery expectations and keep nationwide delivery guidance visible.' },
      { title: 'Can I exchange an item?', body: 'Exchange eligibility depends on policy, product condition and stock availability. Link to the return/exchange policy from cart and footer.' },
      { title: 'Are sale items exchangeable?', body: 'Sale and campaign exclusions should be clearly stated before launch to avoid customer confusion.' }
    ]
  },
  'privacy-policy': {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: 'Explain how UR-Fashion collects, uses and protects customer data for orders, delivery and support.',
    icon: 'policy',
    sections: [
      { title: 'Information collected', body: 'Name, phone, email, address, order details and browsing interactions needed for e-commerce operations.' },
      { title: 'How it is used', body: 'To process orders, provide support, improve shopping experience and send opted-in marketing updates.' },
      { title: 'Customer control', body: 'Customers should be able to request updates, deletion or unsubscribe from marketing communications.' }
    ]
  },
  'terms-conditions': {
    eyebrow: 'Legal',
    title: 'Terms & Conditions',
    intro: 'Set expectations for product availability, pricing, campaigns, checkout, delivery and use of the website.',
    icon: 'gavel',
    sections: [
      { title: 'Pricing and availability', body: 'Prices, stock and promotional offers may change. Campaign terms should be visible on sale banners.' },
      { title: 'Orders', body: 'Orders are subject to confirmation, payment method validation and delivery coverage.' },
      { title: 'Website use', body: 'Content, images and brand assets should not be reused without permission.' }
    ]
  },
  'return-exchange-policy': {
    eyebrow: 'Shopping support',
    title: 'Return / Exchange Policy',
    intro: 'Clear exchange guidance improves confidence for online fashion buyers, especially for size and fabric concerns.',
    icon: 'autorenew',
    sections: [
      { icon: 'inventory_2', title: 'Eligibility', body: 'Items should be unused, unworn, with tags and packaging intact. Final policy windows need business confirmation.' },
      { icon: 'sell', title: 'Sale items', body: 'Campaign and sale exclusions should be shown clearly on product and cart pages before checkout.' },
      { icon: 'support_agent', title: 'How to request', body: 'Customers should contact support with order number, product photos and reason for exchange.' }
    ]
  }
};

@Component({
  selector: 'app-static-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, CampaignChipsComponent, TrustBadgeStripComponent],
  templateUrl: './static-page.component.html',
  styleUrl: './static-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private metaService = inject(MetaService);

  page = signal<StaticPageContent>(CONTENT.about);
  campaignChips = ['Trending in Pakistan', 'Eid Collection', 'Ramadan Sale', 'Summer Lawn', 'Ready to Wear', 'Unstitched / Stitched'];
  trustItems: TrustBadgeItem[] = [
    { icon: 'payments', label: 'Cash on Delivery' },
    { icon: 'chat', label: 'WhatsApp support' },
    { icon: 'autorenew', label: 'Easy exchange' },
    { icon: 'local_shipping', label: 'Delivery across Pakistan' }
  ];

  ngOnInit() {
    this.route.data.subscribe(data => {
      const key = (data['page'] || 'about') as PageKey;
      const content = CONTENT[key] || CONTENT.about;
      this.page.set(content);
      const noindexPages: PageKey[] = ['checkout', 'login', 'account', 'track-order'];
      this.metaService.setSeo({
        title: content.title,
        description: content.intro,
        path: this.router.url,
        noindex: noindexPages.includes(key),
        keywords: `UR-Fashion, ${content.title}, Pakistani fashion`
      });
      this.metaService.clearJsonLd(['seo-product-schema', 'seo-breadcrumb-schema']);
    });
  }
}

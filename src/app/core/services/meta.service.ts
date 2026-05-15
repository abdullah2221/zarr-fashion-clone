import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

interface SeoOptions {
  path?: string;
  image?: string;
  keywords?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  twitterCard?: 'summary' | 'summary_large_image';
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private static readonly SITE_NAME = 'UR-Fashion';
  private static readonly SITE_URL = 'https://www.ur-fashion.pk';

  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  updateMeta(title: string, description: string, image?: string, options?: Omit<SeoOptions, 'image'>) {
    this.setSeo({
      title,
      description,
      image,
      ...options
    });
  }

  setSeo(params: { title: string; description: string } & SeoOptions) {
    const pageTitle = `${params.title} | ${MetaService.SITE_NAME}`;
    const path = params.path || this.router.url || '/';
    const canonicalUrl = this.toAbsoluteUrl(path);
    const ogType = params.type || 'website';
    const twitterCard = params.twitterCard || 'summary_large_image';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: params.description });

    if (params.keywords) {
      this.meta.updateTag({ name: 'keywords', content: params.keywords });
    }

    this.meta.updateTag({ name: 'robots', content: params.noindex ? 'noindex, nofollow' : 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: params.description });
    this.meta.updateTag({ property: 'og:type', content: ogType });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:site_name', content: MetaService.SITE_NAME });
    this.meta.updateTag({ name: 'twitter:card', content: twitterCard });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: params.description });

    if (params.image) {
      this.meta.updateTag({ property: 'og:image', content: params.image });
      this.meta.updateTag({ name: 'twitter:image', content: params.image });
    }

    this.updateCanonical(canonicalUrl);
  }

  setJsonLd(id: string, schema: object) {
    const doc = this.document;
    const existing = doc.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const script = doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(schema);
    doc.head.appendChild(script);
  }

  clearJsonLd(ids: string[]) {
    for (const id of ids) {
      const existing = this.document.getElementById(id);
      if (existing) existing.remove();
    }
  }

  private updateCanonical(url: string) {
    const doc = this.document;
    let link: HTMLLinkElement | null = doc.querySelector('link[rel="canonical"]');
    if (!link) {
      link = doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private toAbsoluteUrl(path: string) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${MetaService.SITE_URL}${normalized}`;
  }
}

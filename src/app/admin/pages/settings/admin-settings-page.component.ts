import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminActionButtonComponent } from '../../components/admin-action-button.component';
import { AdminStoreSettingsService } from '../../services/admin-store-settings.service';
import { AdminNavLinkEditorComponent } from '../../components/admin-nav-link-editor.component';
import { parseNavLinks, serializeNavLinks } from '../../services/nav-link-text';
import { StorefrontNavLink } from '../../../shared/models/storefront-content.models';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminActionButtonComponent, AdminNavLinkEditorComponent],
  templateUrl: './admin-settings-page.component.html',
  styleUrl: './admin-settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly service = inject(AdminStoreSettingsService);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  /** Phase 8 structured menus: the row editors own these arrays; the
   * text form controls below are only the load fallback, and save
   * serializes the arrays back to the stored text format. */
  readonly headerLinks = signal<StorefrontNavLink[]>([]);
  readonly mobileLinks = signal<StorefrontNavLink[]>([]);
  readonly headerTextPreview = computed(() => serializeNavLinks(this.headerLinks()));
  readonly mobileTextPreview = computed(() => serializeNavLinks(this.mobileLinks()));

  readonly form = this.formBuilder.nonNullable.group({
    storeName: ['', [Validators.required]],
    whatsappNumber: [''],
    supportEmail: ['', [Validators.email]],
    supportPhone: [''],
    freeDeliveryThreshold: [4999, [Validators.required, Validators.min(0)]],
    deliveryFee: [0, [Validators.required, Validators.min(0)]],
    deliveryMessage: [''],
    codMessage: [''],
    exchangePolicySummary: [''],
    defaultSeoTitle: [''],
    defaultSeoDescription: [''],
    instagram: [''],
    facebook: [''],
    tiktok: [''],
    youtube: [''],
    campaignChipsText: [''],
    trustBadgesText: [''],
    headerNavText: [''],
    mobileNavText: [''],
    footerColumnsText: [''],
    contactPageIntro: [''],
    aboutPageIntro: [''],
    faqIntro: [''],
    privacySummary: [''],
    termsSummary: [''],
    returnExchangeSummary: [''],
  });

  constructor() {
    void this.load();
  }

  async save() {
    this.error.set(null);
    this.success.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please correct the highlighted settings fields.');
      return;
    }

    this.saving.set(true);
    try {
      const raw = this.form.getRawValue();
      await this.service.save({
        ...raw,
        headerNavText: serializeNavLinks(this.headerLinks()),
        mobileNavText: serializeNavLinks(this.mobileLinks()),
      });
      this.success.set('Storefront settings updated successfully.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save settings.');
    } finally {
      this.saving.set(false);
    }
  }

  private async load() {
    const value = await this.service.loadFormValue();
    this.form.reset(value);
    this.headerLinks.set(parseNavLinks(value.headerNavText));
    this.mobileLinks.set(parseNavLinks(value.mobileNavText));
  }
}

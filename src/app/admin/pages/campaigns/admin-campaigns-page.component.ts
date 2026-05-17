import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminActionButtonComponent } from '../../components/admin-action-button.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge.component';
import { AdminCampaignsService } from '../../services/admin-campaigns.service';
import {
  AdminBannerEditorValue,
  AdminBannerListItem,
  AdminCampaignEditorValue,
  AdminCampaignListItem,
} from '../../models/admin-marketing.models';

@Component({
  selector: 'app-admin-campaigns-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, AdminActionButtonComponent, AdminStatusBadgeComponent],
  templateUrl: './admin-campaigns-page.component.html',
  styleUrl: './admin-campaigns-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly service = inject(AdminCampaignsService);

  readonly selectedBanner = signal<AdminBannerListItem | null>(null);
  readonly selectedCampaign = signal<AdminCampaignListItem | null>(null);
  readonly bannerImageFile = signal<File | null>(null);
  readonly campaignImageFile = signal<File | null>(null);
  readonly bannerPreview = signal('');
  readonly campaignPreview = signal('');
  readonly savingBanner = signal(false);
  readonly savingCampaign = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly bannerForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    subtitle: [''],
    description: [''],
    ctaText: [''],
    secondaryCtaText: [''],
    campaignType: [''],
    placement: ['home-hero'],
    linkUrl: ['/shop'],
    isActive: [true],
    sortOrder: [0 as number | null, [Validators.required]],
    startDate: [''],
    endDate: [''],
  });

  readonly campaignForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    subtitle: [''],
    description: [''],
    linkUrl: ['/shop'],
    ctaText: ['Explore'],
    campaignType: [''],
    placement: ['home-section'],
    active: [true],
    sortOrder: [0 as number | null, [Validators.required]],
    startDate: [''],
    endDate: [''],
    tag: [''],
  });

  constructor() {
    this.campaignForm.controls.title.valueChanges.subscribe(title => {
      if (!this.selectedCampaign()) {
        this.campaignForm.controls.slug.setValue(this.slugify(title), { emitEvent: false });
      }
    });
    void this.service.load();
  }

  selectBanner(item: AdminBannerListItem | null) {
    this.selectedBanner.set(item);
    this.bannerImageFile.set(null);
    this.bannerPreview.set(item?.imageUrl || '');
    this.bannerForm.reset(this.service.createBannerFormValue(item));
  }

  selectCampaign(item: AdminCampaignListItem | null) {
    this.selectedCampaign.set(item);
    this.campaignImageFile.set(null);
    this.campaignPreview.set(item?.imageUrl || '');
    this.campaignForm.reset(this.service.createCampaignFormValue(item));
  }

  onBannerImageSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] || null;
    this.bannerImageFile.set(file);
    this.bannerPreview.set(file ? URL.createObjectURL(file) : this.selectedBanner()?.imageUrl || '');
    if (input) input.value = '';
  }

  onCampaignImageSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] || null;
    this.campaignImageFile.set(file);
    this.campaignPreview.set(file ? URL.createObjectURL(file) : this.selectedCampaign()?.imageUrl || '');
    if (input) input.value = '';
  }

  async saveBanner() {
    this.error.set(null);
    this.success.set(null);
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      this.error.set('Please complete the required banner fields.');
      return;
    }
    this.savingBanner.set(true);
    try {
      await this.service.saveBanner(
        this.selectedBanner(),
        this.bannerForm.getRawValue() as AdminBannerEditorValue,
        this.bannerImageFile()
      );
      this.success.set(this.selectedBanner() ? 'Banner updated successfully.' : 'Banner created successfully.');
      this.selectBanner(null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save banner.');
    } finally {
      this.savingBanner.set(false);
    }
  }

  async saveCampaign() {
    this.error.set(null);
    this.success.set(null);
    if (this.campaignForm.invalid) {
      this.campaignForm.markAllAsTouched();
      this.error.set('Please complete the required campaign fields.');
      return;
    }
    this.savingCampaign.set(true);
    try {
      await this.service.saveCampaign(
        this.selectedCampaign(),
        this.campaignForm.getRawValue() as AdminCampaignEditorValue,
        this.campaignImageFile()
      );
      this.success.set(this.selectedCampaign() ? 'Campaign updated successfully.' : 'Campaign created successfully.');
      this.selectCampaign(null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save campaign.');
    } finally {
      this.savingCampaign.set(false);
    }
  }

  async deleteBanner(item: AdminBannerListItem) {
    if (typeof window === 'undefined' || !window.confirm(`Delete banner "${item.record.title}" permanently?`)) return;
    await this.service.deleteBanner(item);
    this.selectBanner(null);
  }

  async deleteCampaign(item: AdminCampaignListItem) {
    if (typeof window === 'undefined' || !window.confirm(`Delete campaign "${item.title}" permanently?`)) return;
    await this.service.deleteCampaign(item);
    this.selectCampaign(null);
  }

  private slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
}

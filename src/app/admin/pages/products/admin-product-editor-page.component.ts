import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminImageUploaderComponent } from '../../components/admin-image-uploader.component';
import { AdminActionButtonComponent } from '../../components/admin-action-button.component';
import { AdminImageDraft, ProductBadgeOption, ProductCollectionOption, ProductTypeOption, SeasonOption } from '../../models/admin-catalog.models';
import { AdminProductsService } from '../../services/admin-products.service';
import { Tables } from '../../../data-access/models/database.types';

@Component({
  selector: 'app-admin-product-editor-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, AdminImageUploaderComponent, AdminActionButtonComponent],
  templateUrl: './admin-product-editor-page.component.html',
  styleUrl: './admin-product-editor-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductEditorPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly service = inject(AdminProductsService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly warning = signal<string | null>(null);
  readonly product = signal<Tables<'products'> | null>(null);
  readonly imageDrafts = signal<AdminImageDraft[]>([]);
  readonly categories = signal<Tables<'categories'>[]>([]);
  readonly isNew = computed(() => !this.product());

  readonly collectionOptions: ProductCollectionOption[] = ['Eid', 'Ramadan', 'Summer Lawn', 'Winter', 'Wedding', 'Ready to Wear', 'Unstitched', 'Stitched', 'Sale'];
  readonly badgeOptions: ProductBadgeOption[] = ['New', 'Trending', 'Best Seller', 'Limited Stock'];
  readonly productTypeOptions: ProductTypeOption[] = ['stitched', 'unstitched', 'ready-to-wear', 'formal', 'lawn'];
  readonly seasonOptions: SeasonOption[] = ['spring', 'summer', 'autumn', 'winter', 'festive', 'all-season'];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    sku: ['', [Validators.required]],
    brand: ['UR-Fashion', [Validators.required]],
    description: [''],
    categoryId: ['', [Validators.required]],
    regularPrice: [null as number | null, [Validators.required, Validators.min(1)]],
    salePrice: [null as number | null],
    stockQuantity: [0 as number | null, [Validators.required, Validators.min(0)]],
    isActive: [true],
    isFeatured: [false],
    collection: ['' as ProductCollectionOption | ''],
    fabric: [''],
    sizes: [''],
    colors: [''],
    campaignTags: [''],
    seoTitle: [''],
    seoDescription: [''],
    badge: ['' as ProductBadgeOption | ''],
    deliveryNote: [''],
    codAvailable: [true],
    exchangeEligible: [true],
    productType: ['' as ProductTypeOption | ''],
    season: ['' as SeasonOption | ''],
    isReadyToWear: [false],
    isLawnCollection: [false],
    isEidCollection: [false],
    isWeddingFormal: [false],
  });

  private slugTouched = false;

  constructor() {
    this.form.controls.slug.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.slugTouched = true;
    });

    this.form.controls.name.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(name => {
      if (!this.slugTouched && !this.product()) {
        this.form.controls.slug.setValue(this.slugify(name), { emitEvent: false });
      }
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.success.set(params.get('saved') === '1' ? 'Product saved successfully.' : null);
    });

    void this.load();
  }

  async save() {
    this.form.markAllAsTouched();
    this.error.set(null);
    this.warning.set(null);

    if (this.form.invalid) {
      this.error.set('Please complete the required product fields before saving.');
      return;
    }

    const value = this.form.getRawValue();
    if (this.service.slugExists(value.slug, this.product()?.id)) {
      this.error.set('This slug is already in use. Please choose a unique product slug.');
      return;
    }

    if (this.service.skuExists(value.sku, this.product()?.id)) {
      this.error.set('This SKU is already in use. Please choose a unique product SKU.');
      return;
    }

    if (value.salePrice != null && value.salePrice > 0 && value.regularPrice != null && value.salePrice > value.regularPrice) {
      this.error.set('Sale price cannot exceed the regular/original price.');
      return;
    }

    if (!this.imageDrafts().length && value.isActive) {
      this.warning.set('Publishing without images is allowed, but at least one product image is strongly recommended.');
    }

    this.saving.set(true);
    try {
      const savedProduct = await this.service.saveProduct(this.product(), value, this.imageDrafts());
      await this.router.navigate(['/admin/products', savedProduct.id], { queryParams: { saved: '1' } });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save product.');
    } finally {
      this.saving.set(false);
    }
  }

  onImagesChanged(images: AdminImageDraft[]) {
    this.imageDrafts.set(images);
  }

  private async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const productId = this.route.snapshot.paramMap.get('id');
      const state = await this.service.loadEditorState(productId);
      this.product.set(state.product);
      this.categories.set(state.categories);
      this.form.reset(this.service.createFormValueFromRecord(state.product));
      this.slugTouched = Boolean(state.product);
      this.imageDrafts.set(this.service.createImageDrafts(state.product?.name || 'New product', state.images));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to load the product editor.');
    } finally {
      this.loading.set(false);
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

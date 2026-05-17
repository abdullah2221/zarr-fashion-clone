import { Tables } from '../../data-access/models/database.types';

export type AdminProductStatusFilter = 'all' | 'active' | 'inactive';
export type AdminFeaturedFilter = 'all' | 'featured' | 'standard';
export type AdminStockFilter = 'all' | 'low' | 'out' | 'in';
export type AdminProductSort = 'newest' | 'name' | 'price-high' | 'price-low' | 'stock-high' | 'stock-low';
export type AdminCategorySort = 'sort-order' | 'name' | 'active-first';

export type ProductCollectionOption =
  | 'Eid'
  | 'Ramadan'
  | 'Summer Lawn'
  | 'Winter'
  | 'Wedding'
  | 'Ready to Wear'
  | 'Unstitched'
  | 'Stitched'
  | 'Sale';

export type ProductBadgeOption = 'New' | 'Trending' | 'Best Seller' | 'Limited Stock';
export type ProductTypeOption = 'stitched' | 'unstitched' | 'ready-to-wear' | 'formal' | 'lawn';
export type SeasonOption = 'spring' | 'summer' | 'autumn' | 'winter' | 'festive' | 'all-season';

export interface AdminProductMetadata {
  collection?: ProductCollectionOption;
  fabric?: string;
  sizes?: string[];
  colors?: string[];
  badge?: ProductBadgeOption;
  campaignTags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  productType?: ProductTypeOption;
  season?: SeasonOption;
  isReadyToWear?: boolean;
  isLawnCollection?: boolean;
  isEidCollection?: boolean;
  isWeddingFormal?: boolean;
  deliveryNote?: string;
  codAvailable?: boolean;
  exchangeEligible?: boolean;
  stockLabel?: string;
}

export interface AdminProductFormValue {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  description: string;
  categoryId: string;
  regularPrice: number | null;
  salePrice: number | null;
  stockQuantity: number | null;
  isActive: boolean;
  isFeatured: boolean;
  collection: ProductCollectionOption | '';
  fabric: string;
  sizes: string;
  colors: string;
  campaignTags: string;
  seoTitle: string;
  seoDescription: string;
  badge: ProductBadgeOption | '';
  deliveryNote: string;
  codAvailable: boolean;
  exchangeEligible: boolean;
  productType: ProductTypeOption | '';
  season: SeasonOption | '';
  isReadyToWear: boolean;
  isLawnCollection: boolean;
  isEidCollection: boolean;
  isWeddingFormal: boolean;
}

export interface AdminCategoryFormValue {
  name: string;
  slug: string;
  description: string;
  sortOrder: number | null;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
  campaignLabel: string;
}

export interface AdminProductListItem {
  record: Tables<'products'>;
  categoryName: string;
  imageUrl: string;
  currentPrice: number;
  originalPrice: number | null;
  campaignTags: string[];
  metadata: AdminProductMetadata;
}

export interface AdminCategoryListItem {
  record: Tables<'categories'>;
  imageUrl: string;
  productCount: number;
}

export interface AdminImageDraft {
  id?: string;
  file?: File;
  storagePath?: string;
  previewUrl: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  markedForDeletion?: boolean;
}

export interface AdminProductEditorState {
  product: Tables<'products'> | null;
  images: Tables<'product_images'>[];
  categories: Tables<'categories'>[];
}

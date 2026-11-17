import type {
  CheckoutSettings,
  ProductPageSettings,
  CollectionPageSettings,
  ThemeSettings,
  HomeSettings,
  BlogSettings,
  PagesSettings,
} from "@/lib/shopify";

export interface SaveResult {
  message?: string;
  id?: string;
  error?: string;
  url?: string;
}

export interface AuthState {
  setupNeeded: boolean;
  authed: boolean;
}

export interface FieldObj {
  [key: string]: string | undefined | null;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface AdminProductVariant {
  id: string;
  title?: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  barcode: string;
  inventoryQuantity: number;
  inventoryItemId: string;
  cost?: string;
  weightKg?: string;
  requiresShipping?: boolean;
  tracked?: boolean;
  taxable?: boolean;
  selectedOptions?: { name: string; value: string }[];
  media?: { id: string; url: string }[];
}

export interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  status: string;
  image: string;
  collections: { id: string; title: string; handle: string }[];
  variantId: string;
  price: string;
  compareAtPrice: string;
  inventoryQuantity: number;
  inventoryItemId: string;
}

export interface AdminProductDetail {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  seoTitle: string;
  seoDescription: string;
  vendor: string;
  productType: string;
  tags: string;
  status: string;
  options: { id: string; name: string; values: string[] }[];
  variants: AdminProductVariant[];
  media: { id: string; url: string; altText: string }[];
  collections: string[];
  vape: Record<string, string>;
  faqs: { id: string; question: string; answer: string; position: number }[];
  reviews: {
    id: string;
    author: string;
    rating: number;
    title: string;
    body: string;
    verified: boolean;
    position: number;
  }[];
  related: { handle: string; title: string }[];
}

export interface AdminCollection {
  id: string;
  title: string;
  handle: string;
  productCount: number;
}

export interface AdminCollectionDetail {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  sortOrder: string;
  imageUrl: string;
  seoTitle: string;
  seoDescription: string;
  badge: string;
  heroSubtitle: string;
  showAsCard: boolean;
  productIds: string[];
}

export interface AdminOrderLineItem {
  id: string;
  title: string;
  variantTitle: string;
  quantity: number;
  refundableQuantity: number;
  unfulfilledQuantity: number;
  sku: string;
  vendor: string;
  unitPrice: string;
  total: string;
}

export interface AdminOrder {
  id: string;
  name: string;
  customer: string;
  fulfillment: string;
  financial?: string;
  total: string;
  currency: string;
  createdAt: string;
}

export interface AdminDraftOrder {
  id: string;
  name: string;
  status: string;
  customer: string;
  total: string;
  currency: string;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  name: string;
  createdAt: string;
  financial: string;
  fulfillment: string;
  note: string;
  tags: string;
  total: string;
  refunded: string;
  subtotal: string;
  shipping: string;
  tax: string;
  currency: string;
  customer: string;
  email: string;
  phone: string;
  shippingAddress: string;
  lineItems: AdminOrderLineItem[];
  fulfillmentOrders: {
    id: string;
    status: string;
    lineItems: { id: string; remainingQuantity: number; title: string }[];
  }[];
  fulfillments: {
    id: string;
    status: string;
    createdAt: string;
    tracking: string;
    trackingUrl: string;
  }[];
  refunds: { id: string; createdAt: string; amount: string }[];
  saleGateway: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: string;
  currency: string;
  note: string;
  tags: string;
}

export interface AdminCustomerDetail extends AdminCustomer {
  addresses: { id: string; label: string; isDefault: boolean }[];
  orderHistory: {
    id: string;
    name: string;
    createdAt: string;
    financial: string;
    fulfillment: string;
    total: string;
    currency: string;
  }[];
}

export interface AdminRedirect {
  id: string;
  path: string;
  target: string;
}

export interface AdminMetaobject {
  id: string;
  type?: string;
  fields: Record<string, string>;
  [key: string]: unknown;
}

export interface AdminShopSettings {
  announcements: string[];
  phone: string;
  footerText: string;
  logoUrl?: string;
  checkout: CheckoutSettings;
  productPage: ProductPageSettings;
  collectionPage: CollectionPageSettings;
  theme: ThemeSettings;
  home: HomeSettings;
  blog: BlogSettings;
  pages: PagesSettings;
}

export interface AdminBlogPost {
  id: string;
  handle: string;
  title: string;
  body: string;
  summary: string;
  tags: string;
  category: string;
  quickAnswer: string;
  productSlugs: string;
  publishedAt: string;
  isPublished: boolean;
  author: string;
}

export interface AdminPage {
  id: string;
  handle: string;
  title: string;
  body: string;
}

export interface AdminMenuItem {
  id?: string;
  title: string;
  url: string;
  type: string;
  resourceId?: string;
  children?: AdminMenuItem[];
}

export interface AdminMenu {
  id: string;
  title: string;
  handle: string;
  items: AdminMenuItem[];
}

export interface AdminDiscount {
  id: string;
  title: string;
  code: string;
  status: string;
}

export interface AdminFile {
  id: string;
  url: string;
}

export interface BulkProductRow {
  id: string;
  title: string;
  handle: string;
  status: string;
  vendor: string;
  productType: string;
  image: string;
  vape: Record<string, string>;
  relatedHandles: string[];
}

export interface BulkChange {
  id: string;
  vape?: Record<string, string | number | boolean | null>;
  relatedHandles?: string[];
}

export interface CreateProductInput {
  title: string;
  handle?: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string;
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
  price?: string | number;
  compareAtPrice?: string | number;
  sku?: string;
  barcode?: string;
  cost?: string | number;
  weightKg?: string | number;
  requiresShipping?: boolean;
  tracked?: boolean;
  taxable?: boolean;
  locationId?: string;
  inventoryQuantity?: string | number;
  options?: { name: string; values: string[] }[];
  variants?: Record<string, unknown>[];
  mediaSources?: string[];
  mediaAlts?: string[];
  mediaAltUpdates?: { id: string; alt: string }[];
  collectionIds?: string[];
  vape?: Record<string, unknown>;
  variantMedia?: { variantId?: string; mediaId?: string | null; mediaSource?: string; options?: string[] }[];
  faqs?: { id?: string; question: string; answer: string; position: number }[];
  reviews?: { id?: string; author: string; rating: number; title: string; body: string; verified: boolean; position: number }[];
  relatedHandles?: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
  variantUpdates?: Record<string, unknown>[];
  newVariants?: Record<string, unknown>[];
  deleteVariantIds?: string[];
  deleteMediaIds?: string[];
  inventoryUpdates?: { inventoryItemId: string; quantity: number | string; cost?: string | number; weightKg?: string | number; requiresShipping?: boolean; tracked?: boolean }[];
  vapeDeleteKeys?: string[];
}

export interface CreateCollectionInput {
  title: string;
  descriptionHtml?: string;
  sortOrder?: string;
}

export interface UpdateCollectionInput {
  id: string;
  title?: string;
  handle?: string;
  descriptionHtml?: string;
  sortOrder?: string;
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  badge?: string;
  heroSubtitle?: string;
  showAsCard?: boolean;
}

export interface CreateRedirectInput {
  path: string;
  target: string;
}

export interface HeroSlideInput {
  id?: string;
  title?: string;
  description?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  position?: number | string;
  imageFileId?: string;
  imageUrl?: string;
}

export interface HomeSectionInput {
  id?: string;
  key?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  productIds?: string[];
}

export interface TestimonialInput {
  id?: string;
  name?: string;
  role?: string;
  title?: string;
  review?: string;
  position?: number | string;
}

export interface FaqItemInput {
  id?: string;
  question?: string;
  answer?: string;
  position?: number | string;
}

export interface ShowcaseCardInput {
  id?: string;
  sectionKey?: string;
  title?: string;
  price?: string;
  revs?: number | string;
  badge?: string;
  brand?: string;
  imageUrl?: string;
  position?: number | string;
}

export interface FlavorInput {
  id?: string;
  name?: string;
  color?: string;
  inStock?: boolean;
  imageFileId?: string;
  imageUrl?: string;
}

export interface ProductReviewInput {
  id?: string;
  product?: string;
  author?: string;
  rating?: number | string;
  title?: string;
  body?: string;
  verified?: boolean;
  position?: number | string;
}

export interface CollectionFaqInput {
  id?: string;
  collection?: string;
  question?: string;
  answer?: string;
  position?: number | string;
}

export type MetaobjectInput =
  | HeroSlideInput
  | HomeSectionInput
  | TestimonialInput
  | FaqItemInput
  | ShowcaseCardInput
  | FlavorInput
  | ProductReviewInput
  | CollectionFaqInput;

export interface BulkChangeInput {
  id: string;
  title?: string;
  values: Record<string, string>;
}


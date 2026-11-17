export type ActionState<T = void> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  timestamp: number;
};

export interface ProductStatusToggleResult {
  id: string;
  status: "ACTIVE" | "DRAFT";
}

export interface BulkSaveResult {
  updatedCount: number;
}

export interface RedirectActionResult {
  id?: string;
  path: string;
  target: string;
}

export interface CollectionActionResult {
  id?: string;
  title: string;
}

export interface MetaobjectActionResult {
  id?: string;
  type: string;
}

export interface AuthActionResult {
  authed: boolean;
  setupNeeded?: boolean;
}

export type {
  CreateProductInput,
  UpdateProductInput,
  CreateCollectionInput,
  UpdateCollectionInput,
  CreateRedirectInput,
  HeroSlideInput,
  HomeSectionInput,
  TestimonialInput,
  FaqItemInput,
  ShowcaseCardInput,
  FlavorInput,
  ProductReviewInput,
  CollectionFaqInput,
  MetaobjectInput,
  BulkChangeInput,
} from "@/lib/admin/types";


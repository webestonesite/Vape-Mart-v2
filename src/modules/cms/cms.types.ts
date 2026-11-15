import { LinkDestinationFields } from "@/shared/components/SmartLink";

export type SectionType =
  | "section_hero"
  | "section_products"
  | "section_promo"
  | "section_categories"
  | "section_faq";

export interface BaseSectionDTO {
  id: string;
  type: SectionType;
  isActive: boolean;
}

export interface SectionHeroDTO extends BaseSectionDTO {
  type: "section_hero";
  heading: string;
  subHeading?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  textAlignment: "Left" | "Center";
  buttonLabel?: string;
  destinationFields?: LinkDestinationFields;
}

export interface SectionProductsDTO extends BaseSectionDTO {
  type: "section_products";
  heading: string;
  subHeading?: string;
  collectionHandle?: string;
  productLimit: number;
  showViewAll: boolean;
}

export interface SectionPromoDTO extends BaseSectionDTO {
  type: "section_promo";
  badgeText?: string;
  heading: string;
  descriptionJson?: string;
  imageUrl?: string;
  imagePosition: "Left" | "Right";
  themeStyle: "Light" | "Dark" | "Accent";
  buttonLabel?: string;
  destinationFields?: LinkDestinationFields;
}

export interface SectionCategoriesDTO extends BaseSectionDTO {
  type: "section_categories";
  heading: string;
  categories: Array<{
    title: string;
    handle: string;
    imageUrl?: string;
  }>;
}

export interface SectionFaqDTO extends BaseSectionDTO {
  type: "section_faq";
  heading: string;
  items: Array<{
    question: string;
    answerJson?: string;
  }>;
}

export type SectionDTO =
  | SectionHeroDTO
  | SectionProductsDTO
  | SectionPromoDTO
  | SectionCategoriesDTO
  | SectionFaqDTO;

export interface PageLayoutDTO {
  title: string;
  sections: SectionDTO[];
}


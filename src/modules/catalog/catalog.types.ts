export interface CatalogProductDTO {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number;
  availableForSale: boolean;
  featuredImage: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  } | null;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    availableForSale: boolean;
    quantityAvailable?: number;
    selectedOptions: Array<{ name: string; value: string }>;
  }>;
  vendor?: string;
  productType?: string;
  tags?: string[];
}

export interface CatalogCollectionDTO {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: {
    url: string;
    altText?: string;
  } | null;
  productsCount?: number;
}


import { CatalogProductDTO, CatalogCollectionDTO } from "./catalog.types";

export function mapRawProductToDTO(raw: any): CatalogProductDTO | null {
  if (!raw) return null;

  const minPrice = parseFloat(raw.priceRange?.minVariantPrice?.amount || "0");
  const maxCompareAt = parseFloat(raw.compareAtPriceRange?.maxVariantPrice?.amount || "0");

  const variants = (raw.variants?.nodes || []).map((v: any) => ({
    id: v.id,
    title: v.title,
    price: parseFloat(v.price?.amount || "0"),
    availableForSale: Boolean(v.availableForSale),
    quantityAvailable: v.quantityAvailable ?? undefined,
    selectedOptions: v.selectedOptions || [],
  }));

  const isAvailable = variants.length > 0 ? variants.some((v: any) => v.availableForSale) : true;

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description || "",
    price: minPrice,
    compareAtPrice: maxCompareAt > minPrice ? maxCompareAt : 0,
    availableForSale: isAvailable,
    featuredImage: raw.featuredImage
      ? {
          url: raw.featuredImage.url,
          altText: raw.featuredImage.altText || raw.title,
          width: raw.featuredImage.width,
          height: raw.featuredImage.height,
        }
      : null,
    images: (raw.images?.nodes || []).map((img: any) => ({
      url: img.url,
      altText: img.altText || raw.title,
    })),
    variants,
    vendor: raw.vendor || "",
    productType: raw.productType || "",
    tags: raw.tags || [],
  };
}

export function mapRawCollectionToDTO(raw: any): CatalogCollectionDTO | null {
  if (!raw) return null;
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description || "",
    image: raw.image ? { url: raw.image.url, altText: raw.image.altText || raw.title } : null,
  };
}


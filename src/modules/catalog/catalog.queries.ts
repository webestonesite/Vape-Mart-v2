import { ImageFragment } from "@/core/shopify/fragments";

export const GET_PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      vendor
      productType
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        ...ImageFields
      }
      images(first: 10) {
        nodes {
          ...ImageFields
        }
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
  ${ImageFragment}
`;

export const GET_COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query GetCollectionProducts($handle: String!, $first: Int = 24) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        ...ImageFields
      }
      products(first: $first) {
        nodes {
          id
          handle
          title
          description
          vendor
          featuredImage {
            ...ImageFields
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            nodes {
              id
              availableForSale
            }
          }
        }
      }
    }
  }
  ${ImageFragment}
`;

export const GET_LIVE_VARIANT_STOCK_QUERY = /* GraphQL */ `
  query GetLiveVariantStock($handle: String!) {
    product(handle: $handle) {
      id
      variants(first: 50) {
        nodes {
          id
          availableForSale
          quantityAvailable
          price {
            amount
          }
        }
      }
    }
  }
`;


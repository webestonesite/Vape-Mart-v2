/**
 * Canonical GraphQL Fragments
 * Single source of truth for Storefront and Admin GraphQL queries.
 */

export const ImageFragment = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const MediaImageFragment = /* GraphQL */ `
  fragment MediaImageFields on MediaImage {
    image {
      url
      altText
      width
      height
    }
  }
`;

export const MoneyFragment = /* GraphQL */ `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

export const SeoFragment = /* GraphQL */ `
  fragment SeoFields on SEO {
    title
    description
  }
`;

export const LinkFieldsFragment = /* GraphQL */ `
  fragment LinkFields on Metaobject {
    link_collection: field(key: "link_collection") {
      reference {
        ... on Collection {
          handle
          title
        }
      }
    }
    link_product: field(key: "link_product") {
      reference {
        ... on Product {
          handle
          title
        }
      }
    }
    link_page: field(key: "link_page") {
      reference {
        ... on Page {
          handle
          title
        }
      }
    }
    custom_url: field(key: "custom_url") {
      value
    }
  }
`;


import { ImageFragment } from "@/core/shopify/fragments";

export const GET_PAGE_LAYOUT_QUERY = /* GraphQL */ `
  query GetPageLayout($handle: String!) {
    layout: metaobject(handle: { handle: $handle, type: "page_layout" }) {
      id
      title: field(key: "title") {
        value
      }
      sections: field(key: "sections") {
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              type
              fields {
                key
                value
                reference {
                  ... on MediaImage {
                    image {
                      ...ImageFields
                    }
                  }
                  ... on Collection {
                    handle
                    title
                    image {
                      ...ImageFields
                    }
                  }
                  ... on Product {
                    handle
                    title
                  }
                  ... on Page {
                    handle
                    title
                  }
                }
                references(first: 20) {
                  nodes {
                    ... on Metaobject {
                      id
                      fields {
                        key
                        value
                      }
                    }
                    ... on Collection {
                      handle
                      title
                      image {
                        ...ImageFields
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ${ImageFragment}
`;


export const BATCHED_LAYOUT_QUERY = /* GraphQL */ `
  query GetGlobalLayout {
    settings: metaobject(handle: { handle: "global-settings", type: "site_settings" }) {
      id
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
            }
          }
        }
      }
    }
    mainMenu: menu(handle: "main-menu") {
      items {
        title
        url
        items {
          title
          url
        }
      }
    }
    footerMenu: menu(handle: "footer-menu") {
      items {
        title
        url
        items {
          title
          url
        }
      }
    }
  }
`;


// Deterministic redirects fixtures for test isolation

export const MOCK_GRAPHQL_REDIRECTS = [
  {
    id: "gid://shopify/UrlRedirect/501",
    path: "/discontinued-pods",
    target: "/collections/pods",
  },
  {
    id: "gid://shopify/UrlRedirect/502",
    path: "/old-starter-kits",
    target: "/collections/starter-kits",
  },
  {
    id: "gid://shopify/UrlRedirect/503",
    path: "/summer-vape-deal",
    target: "/collections/sale",
  },
];

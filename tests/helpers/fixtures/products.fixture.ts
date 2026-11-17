// Deterministic product fixtures for test isolation

export const MOCK_GRAPHQL_PRODUCTS = [
  {
    id: "gid://shopify/Product/101",
    title: "Elf Bar BC5000 Disposable",
    handle: "elf-bar-bc5000",
    status: "ACTIVE",
    vendor: "Elf Bar",
    productType: "Disposable Vape",
    tags: ["disposable", "5000-puffs", "rechargeable"],
    totalInventory: 45,
    featuredImage: {
      url: "https://cdn.shopify.com/mock/elf-bar.jpg",
      altText: "Elf Bar BC5000",
    },
    priceRangeV2: {
      minVariantPrice: { amount: "45.00", currencyCode: "AED" },
      maxVariantPrice: { amount: "45.00", currencyCode: "AED" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "55.00", currencyCode: "AED" },
      maxVariantPrice: { amount: "55.00", currencyCode: "AED" },
    },
    metafields: [
      { namespace: "vape", key: "puffs", type: "single_line_text_field", value: "5000" },
      { namespace: "vape", key: "nicotine_strength", type: "single_line_text_field", value: "5%" },
      { namespace: "vape", key: "battery_capacity", type: "single_line_text_field", value: "650mAh" },
      { namespace: "vape", key: "e_liquid_capacity", type: "single_line_text_field", value: "13ml" },
      { namespace: "vape", key: "charging_type", type: "single_line_text_field", value: "Type-C" },
    ],
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/1001",
          title: "Watermelon Ice",
          price: "45.00",
          compareAtPrice: "55.00",
          inventoryQuantity: 25,
          sku: "ELF-BC5000-WTR",
          selectedOptions: [{ name: "Flavor", value: "Watermelon Ice" }],
        },
        {
          id: "gid://shopify/ProductVariant/1002",
          title: "Blue Razz Ice",
          price: "45.00",
          compareAtPrice: "55.00",
          inventoryQuantity: 20,
          sku: "ELF-BC5000-BLU",
          selectedOptions: [{ name: "Flavor", value: "Blue Razz Ice" }],
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/102",
    title: "JUUL 2 Starter Kit",
    handle: "juul-2-starter-kit",
    status: "ACTIVE",
    vendor: "JUUL",
    productType: "Pod System",
    tags: ["juul", "starter-kit", "pods"],
    totalInventory: 15,
    featuredImage: {
      url: "https://cdn.shopify.com/mock/juul-2.jpg",
      altText: "JUUL 2 Starter Kit",
    },
    priceRangeV2: {
      minVariantPrice: { amount: "120.00", currencyCode: "AED" },
      maxVariantPrice: { amount: "120.00", currencyCode: "AED" },
    },
    compareAtPriceRange: null,
    metafields: [
      { namespace: "vape", key: "battery_capacity", type: "single_line_text_field", value: "250mAh" },
    ],
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/1003",
          title: "Default Title",
          price: "120.00",
          compareAtPrice: null,
          inventoryQuantity: 15,
          sku: "JUUL-2-KIT",
          selectedOptions: [{ name: "Title", value: "Default Title" }],
        },
      ],
    },
  },
];

export const MOCK_PRODUCT_DETAIL_NODE = {
  id: "gid://shopify/Product/101",
  title: "Elf Bar BC5000 Disposable",
  handle: "elf-bar-bc5000",
  descriptionHtml: "<p>The Elf Bar BC5000 features a 650mAh rechargeable battery.</p>",
  status: "ACTIVE",
  vendor: "Elf Bar",
  productType: "Disposable Vape",
  tags: ["disposable", "5000-puffs"],
  options: [{ id: "opt_1", name: "Flavor", values: ["Watermelon Ice", "Blue Razz Ice"] }],
  images: {
    nodes: [
      { id: "img_1", url: "https://cdn.shopify.com/mock/elf-bar.jpg", altText: "Elf Bar BC5000 Front" },
    ],
  },
  collections: {
    nodes: [
      { id: "gid://shopify/Collection/201", title: "Disposables", handle: "disposables" },
    ],
  },
  variants: {
    nodes: [
      {
        id: "gid://shopify/ProductVariant/1001",
        title: "Watermelon Ice",
        price: "45.00",
        compareAtPrice: "55.00",
        sku: "ELF-BC5000-WTR",
        barcode: "123456789012",
        inventoryQuantity: 25,
        inventoryItem: { id: "gid://shopify/InventoryItem/5001" },
        selectedOptions: [{ name: "Flavor", value: "Watermelon Ice" }],
        image: { id: "img_1", url: "https://cdn.shopify.com/mock/elf-bar.jpg", altText: "Watermelon" },
      },
    ],
  },
  metafields: {
    nodes: [
      { namespace: "vape", key: "puffs", type: "single_line_text_field", value: "5000" },
      { namespace: "vape", key: "nicotine_strength", type: "single_line_text_field", value: "5%" },
      { namespace: "vape", key: "sweetness", type: "number_integer", value: "4" },
      { namespace: "vape", key: "cooling", type: "number_integer", value: "3" },
      { namespace: "custom", key: "authenticity_guaranteed", type: "boolean", value: "true" },
    ],
  },
};

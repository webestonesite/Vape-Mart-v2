// Deterministic metaobjects fixtures for test isolation

export const MOCK_GRAPHQL_METAOBJECTS = [
  {
    id: "gid://shopify/Metaobject/601",
    handle: "summer-banner-1",
    type: "hero_slide",
    fields: [
      { key: "title", value: "Summer Vape Deals" },
      { key: "description", value: "Get up to 35% off on popular disposable vapes." },
      { key: "badge", value: "Limited Offer" },
      { key: "button_text", value: "Shop Deals" },
      { key: "button_link", value: "/collections/sale" },
      { key: "position", value: "1" },
    ],
  },
  {
    id: "gid://shopify/Metaobject/602",
    handle: "customer-review-ahmed",
    type: "testimonial",
    fields: [
      { key: "name", value: "Ahmed K." },
      { key: "review", value: "Fast same-day delivery in Dubai. Authentic products!" },
      { key: "rating", value: "5" },
    ],
  },
  {
    id: "gid://shopify/Metaobject/603",
    handle: "faq-delivery-time",
    type: "faq_item",
    fields: [
      { key: "question", value: "How fast is delivery in Dubai?" },
      { key: "answer", value: "We deliver within 2 to 4 hours across Dubai." },
      { key: "position", value: "1" },
    ],
  },
];

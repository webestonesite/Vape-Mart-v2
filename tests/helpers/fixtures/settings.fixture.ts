import type { ShopSettings } from "../../../src/lib/shopify";

// Deterministic shop settings fixtures for test isolation

export const MOCK_SHOP_SETTINGS: ShopSettings = {
  announcements: [
    "Free same-day delivery in Dubai on orders over AED 250",
    "100% Authentic Guaranteed Products",
  ],
  phone: "+971 4 123 4567",
  footerText: "Vape Mart UAE - Premium Vaping Products & Accessories",
  logoUrl: "https://cdn.shopify.com/mock/vape-mart-logo.png",
  checkout: {
    freeShippingThreshold: 250,
    deliveryFee: 25,
    vatNote: "All prices include 5% VAT",
    cityPromises: [],
    paymentLabels: [],
  },
  productPage: {
    trustBadges: [],
    shippingText: "Express delivery in Dubai",
    returnText: "30-day return policy",
    specOrder: ["puffs", "nicotine_strength", "battery_capacity"],
  },
  collectionPage: {
    itemsPerPage: 24,
    compareLimit: 4,
    sortOptions: [{ value: "BEST_SELLING", label: "Best Selling" }],
    puffBuckets: [],
    flavorFamilies: [],
    quizSteps: [],
    shopAllHero: { title: "", subtitle: "", image: "" },
  },
  theme: {
    searchPlaceholder: "Search vapes, pods, flavors...",
    topbarLinks: [],
    footerLinks: [],
    newsletterText: "",
    megaBanner: { title: "", subtitle: "", badge: "", href: "" },
    colors: { preset: "amber" },
    fonts: { heading: "", body: "" },
  },
  home: {
    promoBanners: [],
    categoryTiles: [],
    features: [],
    trustStats: { customers: 1000, reviews: 500 },
    sectionVisibility: {},
    sectionOrder: ["hero", "categories", "best_sellers"],
  },
  blog: {
    categories: ["News", "Guides"],
    categoryColors: {},
  },
  pages: {
    aboutValues: [],
    aboutStats: [],
    contactCards: [],
    pageHeroSubtitles: {},
  },
};

// Deterministic order fixtures for test isolation

export const MOCK_GRAPHQL_ORDERS = [
  {
    id: "gid://shopify/Order/301",
    name: "#1041",
    createdAt: "2026-11-15T10:00:00Z",
    displayFinancialStatus: "PAID",
    displayFulfillmentStatus: "UNFULFILLED",
    totalPriceSet: {
      shopMoney: { amount: "250.00", currencyCode: "AED" },
    },
    currentTotalPriceSet: {
      shopMoney: { amount: "250.00", currencyCode: "AED" },
    },
    totalRefundedSet: {
      shopMoney: { amount: "0.00", currencyCode: "AED" },
    },
    customer: {
      id: "gid://shopify/Customer/701",
      displayName: "Zayd Al-Mansoor",
      email: "zayd@example.com",
      phone: "+971501234567",
    },
    lineItems: {
      nodes: [
        {
          id: "gid://shopify/LineItem/801",
          title: "Elf Bar BC5000 Disposable - Watermelon Ice",
          quantity: 2,
          originalUnitPriceSet: { shopMoney: { amount: "45.00", currencyCode: "AED" } },
          image: { url: "https://cdn.shopify.com/mock/elf-bar.jpg" },
        },
        {
          id: "gid://shopify/LineItem/802",
          title: "JUUL 2 Starter Kit",
          quantity: 1,
          originalUnitPriceSet: { shopMoney: { amount: "120.00", currencyCode: "AED" } },
          image: { url: "https://cdn.shopify.com/mock/juul-2.jpg" },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Order/302",
    name: "#1042",
    createdAt: "2026-11-14T08:30:00Z",
    displayFinancialStatus: "PAID",
    displayFulfillmentStatus: "FULFILLED",
    currentTotalPriceSet: {
      shopMoney: { amount: "90.00", currencyCode: "AED" },
    },
    totalRefundedSet: {
      shopMoney: { amount: "0.00", currencyCode: "AED" },
    },
    customer: {
      id: "gid://shopify/Customer/702",
      displayName: "Sarah Khan",
      email: "sarah@example.com",
      phone: "+971509876543",
    },
    lineItems: {
      nodes: [
        {
          id: "gid://shopify/LineItem/803",
          title: "Elf Bar BC5000 Disposable - Blue Razz",
          quantity: 2,
          originalUnitPriceSet: { shopMoney: { amount: "45.00", currencyCode: "AED" } },
        },
      ],
    },
  },
];

export const MOCK_ORDER_DETAIL_NODE = {
  id: "gid://shopify/Order/301",
  name: "#1041",
  createdAt: "2026-11-15T10:00:00Z",
  displayFinancialStatus: "PAID",
  displayFulfillmentStatus: "UNFULFILLED",
  totalPriceSet: {
    shopMoney: { amount: "250.00", currencyCode: "AED" },
  },
  currentTotalPriceSet: {
    shopMoney: { amount: "250.00", currencyCode: "AED" },
  },
  totalRefundedSet: {
    shopMoney: { amount: "0.00", currencyCode: "AED" },
  },
  customer: {
    id: "gid://shopify/Customer/701",
    displayName: "Zayd Al-Mansoor",
    email: "zayd@example.com",
    phone: "+971501234567",
  },
  shippingAddress: {
    address1: "Villa 12, Palm Jumeirah",
    city: "Dubai",
    country: "United Arab Emirates",
  },
  lineItems: {
    nodes: [
      {
        id: "gid://shopify/LineItem/801",
        title: "Elf Bar BC5000 Disposable - Watermelon Ice",
        quantity: 2,
        refundableQuantity: 2,
        originalUnitPriceSet: { shopMoney: { amount: "45.00", currencyCode: "AED" } },
      },
      {
        id: "gid://shopify/LineItem/802",
        title: "JUUL 2 Starter Kit",
        quantity: 1,
        refundableQuantity: 1,
        originalUnitPriceSet: { shopMoney: { amount: "120.00", currencyCode: "AED" } },
      },
    ],
  },
  fulfillmentOrders: {
    nodes: [
      {
        id: "gid://shopify/FulfillmentOrder/901",
        status: "OPEN",
        lineItems: {
          nodes: [
            { id: "gid://shopify/FulfillmentOrderLineItem/911", totalQuantity: 2, remainingQuantity: 2 },
            { id: "gid://shopify/FulfillmentOrderLineItem/912", totalQuantity: 1, remainingQuantity: 1 },
          ],
        },
      },
    ],
  },
  fulfillments: [],
  transactions: [
    {
      id: "gid://shopify/OrderTransaction/951",
      kind: "SALE",
      status: "SUCCESS",
      gateway: "stripe",
      amountSet: { shopMoney: { amount: "250.00", currencyCode: "AED" } },
    },
  ],
  refunds: [],
};

export const MOCK_DRAFT_ORDERS = [
  {
    id: "gid://shopify/DraftOrder/401",
    name: "#D101",
    status: "OPEN",
    createdAt: "2026-11-15T12:00:00Z",
    totalPriceSet: {
      shopMoney: { amount: "180.00", currencyCode: "AED" },
    },
    totalPrice: "180.00",
    currencyCode: "AED",
    customer: {
      displayName: "Hamdan Rashid",
      email: "hamdan@example.com",
    },
    lineItems: {
      nodes: [
        { title: "Terea Heets Amber Selection", quantity: 3, originalUnitPrice: "60.00" },
      ],
    },
  },
];

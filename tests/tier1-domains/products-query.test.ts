import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getAdminProducts, getAdminProductDetail, listAllPanelProducts } from "@/lib/admin/products";
import {
  resetMocks,
  setMockResponse,
  getRecordedCalls,
} from "../helpers/test-context";
import { MOCK_GRAPHQL_PRODUCTS, MOCK_PRODUCT_DETAIL_NODE } from "../helpers/fixtures/products.fixture";

describe("Tier 1: Products Domain Queries", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("T1-PROD-01: queries product catalog listing with pagination", async () => {
    const res = await getAdminProducts({ limit: 10, cursor: "cursor_start", status: "ACTIVE" });

    assert.ok(Array.isArray(res.products));
    assert.equal(res.products.length, 2);
    assert.equal(res.products[0].id, "gid://shopify/Product/101");
    assert.equal(res.products[0].title, "Elf Bar BC5000 Disposable");
    assert.equal(res.products[0].price, "45.00");
    assert.equal(res.pageInfo.hasNextPage, false);
    assert.equal(res.pageInfo.endCursor, "cursor_prod_end");

    const calls = getRecordedCalls();
    assert.ok(calls.length > 0);
    const lastCall = calls[calls.length - 1];
    assert.equal(lastCall.variables.first, 10);
    assert.equal(lastCall.variables.after, "cursor_start");
    assert.equal(lastCall.variables.query, "status:ACTIVE");
  });

  it("T1-PROD-02: queries full product detail with metafields and variants", async () => {
    const detail = await getAdminProductDetail("gid://shopify/Product/101");

    assert.equal(detail.id, "gid://shopify/Product/101");
    assert.equal(detail.title, "Elf Bar BC5000 Disposable");
    assert.equal(detail.status, "ACTIVE");
    assert.equal(detail.vape.puffs, "5000");
    assert.equal(detail.vape.nicotine_strength, "5%");
    assert.equal(detail.vape.sweetness, "4");
    assert.equal(detail.variants.length, 1);
    assert.equal(detail.variants[0].price, "45.00");
    assert.equal(detail.variants[0].compareAtPrice, "55.00");
    assert.equal(detail.media.length, 1);
    assert.ok(detail.collections.length > 0);
  });

  it("T1-PROD-03: queries catalog with text search filter", async () => {
    await getAdminProducts({ query: "Elf Bar", limit: 25 });

    const calls = getRecordedCalls();
    const lastCall = calls[calls.length - 1];
    assert.equal(lastCall.variables.first, 25);
    assert.equal(lastCall.variables.query, "Elf Bar");
  });

  it("T1-PROD-04: listAllPanelProducts paginates until hasNextPage is false", async () => {
    let callIndex = 0;
    setMockResponse("products(", () => {
      callIndex++;
      if (callIndex === 1) {
        return {
          products: {
            nodes: [MOCK_GRAPHQL_PRODUCTS[0]],
            pageInfo: { hasNextPage: true, endCursor: "page1_cursor" },
          },
        };
      }
      return {
        products: {
          nodes: [MOCK_GRAPHQL_PRODUCTS[1]],
          pageInfo: { hasNextPage: false, endCursor: "page2_cursor" },
        },
      };
    });

    const allProducts = await listAllPanelProducts();

    assert.equal(allProducts.length, 2);
    assert.equal(allProducts[0].id, "gid://shopify/Product/101");
    assert.equal(allProducts[1].id, "gid://shopify/Product/102");
    assert.equal(callIndex, 2, "Expected exactly 2 paginated queries");
  });

  it("T1-PROD-05: handles products with missing or empty optional metafields", async () => {
    setMockResponse("product(", () => ({
      product: {
        ...MOCK_PRODUCT_DETAIL_NODE,
        metafields: { nodes: [] },
      },
    }));

    const detail = await getAdminProductDetail("gid://shopify/Product/101");

    assert.equal(detail.id, "gid://shopify/Product/101");
    assert.equal(detail.vape.puffs, "");
    assert.equal(detail.vape.nicotine_strength, "");
    assert.equal(detail.vape.battery_capacity, "");
  });

  it("T1-PROD-06: applies default limit 50 when limit parameter is omitted", async () => {
    await getAdminProducts({});

    const calls = getRecordedCalls();
    const lastCall = calls[calls.length - 1];
    assert.equal(lastCall.variables.first, 50);
  });
});

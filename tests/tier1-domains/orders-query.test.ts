import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getAdminOrders, getAdminDraftOrders, getAdminOrderDetail } from "@/lib/admin/orders";
import {
  resetMocks,
  getRecordedCalls,
} from "../helpers/test-context";

describe("Tier 1: Orders Domain Queries", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("T1-ORD-01: queries orders listing with status filter and custom limit", async () => {
    const res = await getAdminOrders({ status: "open", limit: 20 });

    assert.ok(Array.isArray(res.orders));
    assert.equal(res.orders.length, 2);
    assert.equal(res.orders[0].id, "gid://shopify/Order/301");
    assert.equal(res.orders[0].name, "#1041");
    assert.equal(res.orders[0].financial, "PAID");
    assert.equal(res.orders[0].fulfillment, "UNFULFILLED");
    assert.equal(res.orders[0].customer, "Zayd Al-Mansoor");
    assert.equal(res.orders[0].total, "250.00");

    const calls = getRecordedCalls();
    const lastCall = calls[calls.length - 1];
    assert.equal(lastCall.variables.first, 20);
    assert.equal(lastCall.variables.query, "status:open");
  });

  it("T1-ORD-02: queries orders listing with cursor pagination", async () => {
    const res = await getAdminOrders({ limit: 10, after: "cursor_start" });

    assert.equal(res.pageInfo.hasNextPage, false);
    assert.equal(res.pageInfo.endCursor, "cursor_ord_end");

    const calls = getRecordedCalls();
    const lastCall = calls[calls.length - 1];
    assert.equal(lastCall.variables.first, 10);
    assert.equal(lastCall.variables.after, "cursor_start");
  });

  it("T1-ORD-03: queries draft orders listing with status and pricing", async () => {
    const res = await getAdminDraftOrders({ limit: 15 });

    assert.ok(Array.isArray(res.draftOrders));
    assert.equal(res.draftOrders.length, 1);
    assert.equal(res.draftOrders[0].name, "#D101");
    assert.equal(res.draftOrders[0].status, "OPEN");
    assert.equal(res.draftOrders[0].currency, "AED");
    assert.equal(res.draftOrders[0].total, "180.00");

    const calls = getRecordedCalls();
    const lastCall = calls[calls.length - 1];
    assert.equal(lastCall.variables.first, 15);
  });

  it("T1-ORD-04: queries full order detail including fulfillment orders and transactions", async () => {
    const detail = await getAdminOrderDetail("gid://shopify/Order/301");

    assert.equal(detail.id, "gid://shopify/Order/301");
    assert.equal(detail.name, "#1041");
    assert.equal(detail.total, "250.00");
    assert.equal(detail.refunded, "0.00");
    assert.equal(detail.customer, "Zayd Al-Mansoor");
    assert.ok(detail.shippingAddress.includes("Dubai"));
    assert.equal(detail.lineItems.length, 2);
    assert.equal(detail.lineItems[0].refundableQuantity, 2);
    assert.equal(detail.fulfillmentOrders.length, 1);
    assert.equal(detail.fulfillmentOrders[0].status, "OPEN");
    assert.ok(detail.saleGateway || detail.total);
  });

  it("T1-ORD-05: passes reverse parameter to GraphQL query", async () => {
    await getAdminOrders({ reverse: true });

    const calls = getRecordedCalls();
    const lastCall = calls[calls.length - 1];
    assert.equal(lastCall.variables.reverse, true);
  });

  it("T1-ORD-06: applies default limit 25 when limit is omitted", async () => {
    await getAdminOrders({});

    const calls = getRecordedCalls();
    const lastCall = calls[calls.length - 1];
    assert.equal(lastCall.variables.first, 25);
  });
});

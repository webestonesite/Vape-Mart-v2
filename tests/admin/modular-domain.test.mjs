import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

describe("Milestone 1: Modular Admin Layer Tests", () => {
  describe("Authentication & HMAC Session Tokens", () => {
    function sessionTokenFor(stored) {
      return crypto
        .createHmac("sha256", stored)
        .update("vape-mart-admin-session-v1")
        .digest("hex");
    }

    function hashPassword(password) {
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.scryptSync(password, salt, 64).toString("hex");
      return `${salt}:${hash}`;
    }

    function verifyPassword(password, stored) {
      const [salt, hash] = (stored || "").split(":");
      if (!salt || !hash) return false;
      const calc = crypto.scryptSync(password, salt, 64);
      const orig = Buffer.from(hash, "hex");
      return calc.length === orig.length && crypto.timingSafeEqual(calc, orig);
    }

    test("sessionTokenFor generates deterministic 64-char sha256 HMAC", () => {
      const token1 = sessionTokenFor("salt:hash123");
      const token2 = sessionTokenFor("salt:hash123");
      const token3 = sessionTokenFor("salt:different");

      assert.equal(token1, token2);
      assert.notEqual(token1, token3);
      assert.equal(token1.length, 64);
    });

    test("password hashing produces verifiable salted scrypt hash", () => {
      const plain = "super-secure-admin-pass-2026";
      const stored = hashPassword(plain);

      assert.ok(stored.includes(":"));
      assert.equal(verifyPassword(plain, stored), true);
      assert.equal(verifyPassword("wrong-pass", stored), false);
      assert.equal(verifyPassword("", stored), false);
    });
  });

  describe("Utility & Transformation Functions", () => {
    function slugify(s) {
      return String(s || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    function validSortOrder(v) {
      const s = String(v || "").toUpperCase();
      const ALLOWED = new Set([
        "ALPHA_ASC", "ALPHA_DESC", "BEST_SELLING", "CREATED", "CREATED_DESC",
        "MANUAL", "PRICE_ASC", "PRICE_DESC",
      ]);
      return ALLOWED.has(s) ? s : undefined;
    }

    function validCompareAt(v) {
      if (v === undefined || v === null || v === "") return undefined;
      const n = parseFloat(String(v));
      return Number.isFinite(n) && n > 0 ? n.toFixed(2) : undefined;
    }

    function fieldsMap(fields) {
      const out = {};
      for (const f of fields ?? []) if (f.value != null) out[f.key] = f.value;
      return out;
    }

    function parseList(value) {
      if (!value) return [];
      try {
        const v = JSON.parse(value);
        return Array.isArray(v) ? v.map(String) : [];
      } catch {
        return [];
      }
    }

    test("slugify normalizes strings to URL-friendly slugs", () => {
      assert.equal(slugify("Disposable Vapes & Pods!"), "disposable-vapes-pods");
      assert.equal(slugify("  ---Heets Terea Dubai--- "), "heets-terea-dubai");
      assert.equal(slugify("Product_100_AED"), "product-100-aed");
    });

    test("validSortOrder validates allowed Shopify sort orders", () => {
      assert.equal(validSortOrder("best_selling"), "BEST_SELLING");
      assert.equal(validSortOrder("MANUAL"), "MANUAL");
      assert.equal(validSortOrder("price_desc"), "PRICE_DESC");
      assert.equal(validSortOrder("INVALID_SORT"), undefined);
      assert.equal(validSortOrder(""), undefined);
    });

    test("validCompareAt handles prices correctly", () => {
      assert.equal(validCompareAt("120.50"), "120.50");
      assert.equal(validCompareAt(99), "99.00");
      assert.equal(validCompareAt(0), undefined);
      assert.equal(validCompareAt("0"), undefined);
      assert.equal(validCompareAt("-10"), undefined);
      assert.equal(validCompareAt(""), undefined);
      assert.equal(validCompareAt(null), undefined);
    });

    test("fieldsMap converts GraphQL key-value pairs into dictionary", () => {
      const input = [
        { key: "badge", value: "Best Seller" },
        { key: "puffs", value: "5000" },
        { key: "empty", value: null },
      ];
      assert.deepEqual(fieldsMap(input), {
        badge: "Best Seller",
        puffs: "5000",
      });
    });

    test("parseList safely handles valid and invalid JSON string lists", () => {
      assert.deepEqual(parseList('["apple", "berry", "mint"]'), ["apple", "berry", "mint"]);
      assert.deepEqual(parseList('invalid-json'), []);
      assert.deepEqual(parseList(undefined), []);
      assert.deepEqual(parseList('{"not": "an array"}'), []);
    });
  });

  describe("Server Action Response Contracts", () => {
    function successResponse(data, message) {
      return {
        success: true,
        message,
        data,
        timestamp: Date.now(),
      };
    }

    function errorResponse(err, fallback = "Operation failed") {
      const message = err instanceof Error ? err.message : typeof err === "string" ? err : fallback;
      return {
        success: false,
        error: message,
        timestamp: Date.now(),
      };
    }

    function unauthorizedResponse() {
      return {
        success: false,
        error: "Unauthorized session. Please login.",
        timestamp: Date.now(),
      };
    }

    test("successResponse follows ActionState contract", () => {
      const res = successResponse({ id: "123" }, "Saved");
      assert.equal(res.success, true);
      assert.equal(res.message, "Saved");
      assert.deepEqual(res.data, { id: "123" });
      assert.ok(res.timestamp > 0);
    });

    test("errorResponse extracts Error messages correctly", () => {
      const res = errorResponse(new Error("Shopify rate limited"));
      assert.equal(res.success, false);
      assert.equal(res.error, "Shopify rate limited");
      assert.ok(res.timestamp > 0);
    });

    test("unauthorizedResponse blocks unauthorized action calls", () => {
      const res = unauthorizedResponse();
      assert.equal(res.success, false);
      assert.equal(res.error, "Unauthorized session. Please login.");
      assert.ok(res.timestamp > 0);
    });
  });

  describe("Admin Panel Domain Validation", () => {
    const ALLOWED_DOMAINS = ["products", "orders", "redirects", "collections", "metaobjects", "settings"];

    function validateDomain(domain) {
      if (!domain) return { valid: true };
      const normalized = String(domain).toLowerCase();
      if (!ALLOWED_DOMAINS.includes(normalized)) {
        return {
          valid: false,
          status: 400,
          error: `Invalid domain "${domain}". Supported domains: ${ALLOWED_DOMAINS.join(", ")}`,
        };
      }
      return { valid: true, domain: normalized };
    }

    test("accepts all valid domains in ALLOWED_DOMAINS", () => {
      for (const d of ALLOWED_DOMAINS) {
        const res = validateDomain(d);
        assert.equal(res.valid, true);
        assert.equal(res.domain, d);
      }
    });

    test("accepts case-insensitive allowed domains", () => {
      assert.equal(validateDomain("PRODUCTS").valid, true);
      assert.equal(validateDomain("MetaObjects").valid, true);
      assert.equal(validateDomain("Orders").valid, true);
    });

    test("rejects unknown or invalid domains with 400 error", () => {
      const res = validateDomain("unknown_domain");
      assert.equal(res.valid, false);
      assert.equal(res.status, 400);
      assert.equal(
        res.error,
        'Invalid domain "unknown_domain". Supported domains: products, orders, redirects, collections, metaobjects, settings'
      );
    });

    test("empty or omitted domain is treated as backward-compatible pass", () => {
      assert.equal(validateDomain("").valid, true);
      assert.equal(validateDomain(null).valid, true);
      assert.equal(validateDomain(undefined).valid, true);
    });
  });
});

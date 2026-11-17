import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Admin Panel Domain Validation Specification", () => {
  const ALLOWED_DOMAINS = ["products", "orders", "redirects", "collections", "metaobjects", "settings"] as const;
  type AllowedDomain = (typeof ALLOWED_DOMAINS)[number];

  function validateDomainParam(domain: string | null) {
    if (!domain) return { ok: true };
    if (!ALLOWED_DOMAINS.includes(domain.toLowerCase() as AllowedDomain)) {
      return {
        status: 400,
        body: {
          ok: false,
          error: `Invalid domain "${domain}". Supported domains: ${ALLOWED_DOMAINS.join(", ")}`,
        },
      };
    }
    return { status: 200, domain: domain.toLowerCase() };
  }

  function validatePostDataDomain(domainInput: unknown) {
    const domain = domainInput ? String(domainInput).toLowerCase() : "";
    if (!domain) {
      return { status: 200, isFullFetch: true };
    }
    if (!ALLOWED_DOMAINS.includes(domain as AllowedDomain)) {
      return {
        status: 400,
        body: {
          ok: false,
          error: `Invalid domain "${domain}". Supported domains: ${ALLOWED_DOMAINS.join(", ")}`,
        },
      };
    }
    return { status: 200, domain };
  }

  it("GET: returns 400 with descriptive message for invalid domain", () => {
    const res = validateDomainParam("unknown_domain");
    assert.equal(res.status, 400);
    assert.equal(res.body?.ok, false);
    assert.equal(
      res.body?.error,
      'Invalid domain "unknown_domain". Supported domains: products, orders, redirects, collections, metaobjects, settings'
    );
  });

  it("GET: allows all supported domains", () => {
    for (const d of ALLOWED_DOMAINS) {
      const res = validateDomainParam(d);
      assert.equal(res.status, 200);
      assert.equal(res.domain, d);
    }
  });

  it("GET: metaobjects is an allowed domain", () => {
    const res = validateDomainParam("metaobjects");
    assert.equal(res.status, 200);
    assert.equal(res.domain, "metaobjects");
  });

  it("POST: returns 400 with descriptive message for invalid domain on action 'data'", () => {
    const res = validatePostDataDomain("foobar");
    assert.equal(res.status, 400);
    assert.equal(res.body?.ok, false);
    assert.equal(
      res.body?.error,
      'Invalid domain "foobar". Supported domains: products, orders, redirects, collections, metaobjects, settings'
    );
  });

  it("POST: allows all supported domains on action 'data'", () => {
    for (const d of ALLOWED_DOMAINS) {
      const res = validatePostDataDomain(d);
      assert.equal(res.status, 200);
      assert.equal(res.domain, d);
    }
  });

  it("POST: empty/omitted domain falls back to backward compatible full fetch", () => {
    assert.equal(validatePostDataDomain(undefined).isFullFetch, true);
    assert.equal(validatePostDataDomain(null).isFullFetch, true);
    assert.equal(validatePostDataDomain("").isFullFetch, true);
  });
});

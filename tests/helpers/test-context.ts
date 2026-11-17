// Test context and global reset utilities
import assert from "node:assert/strict";
import {
  clearRevalidatedCache,
  getRevalidatedPaths,
  getRevalidatedTags,
  hasRevalidatedPath,
  hasRevalidatedTag,
} from "../mocks/next-cache";
import {
  resetMockCookies,
  setAdminSession,
  setMockCookie,
  deleteMockCookie,
  clearMockCookies,
} from "../mocks/next-headers";
import {
  clearRecordedCalls,
  getRecordedCalls,
  getLastRecordedCall,
  resetShopifyMocks,
  setMockResponse,
  setMockUserErrors,
} from "../mocks/shopify";

export function resetMocks(): void {
  clearRevalidatedCache();
  resetMockCookies();
  resetShopifyMocks();
}

export function assertActionSuccess<T>(
  res: { success: boolean; data?: T; message?: string; error?: string },
  expectedMessageSubstr?: string
): void {
  assert.equal(res.success, true, `Expected action to succeed, but got error: ${res.error}`);
  if (expectedMessageSubstr) {
    assert.ok(
      res.message && res.message.includes(expectedMessageSubstr),
      `Expected message "${res.message}" to include "${expectedMessageSubstr}"`
    );
  }
}

export function assertActionError<T>(
  res: { success: boolean; data?: T; message?: string; error?: string },
  expectedErrorSubstr?: string
): void {
  assert.equal(res.success, false, "Expected action to fail, but it succeeded");
  if (expectedErrorSubstr) {
    assert.ok(
      res.error && res.error.includes(expectedErrorSubstr),
      `Expected error "${res.error}" to include "${expectedErrorSubstr}"`
    );
  }
}

export function assertTagRevalidated(tag: string): void {
  assert.ok(
    hasRevalidatedTag(tag),
    `Expected cache tag "${tag}" to be revalidated, but revalidated tags were: ${JSON.stringify(getRevalidatedTags())}`
  );
}

export function assertTagNotRevalidated(tag: string): void {
  assert.equal(
    hasRevalidatedTag(tag),
    false,
    `Expected cache tag "${tag}" NOT to be revalidated, but it was found in: ${JSON.stringify(getRevalidatedTags())}`
  );
}

export {
  clearRevalidatedCache,
  getRevalidatedPaths,
  getRevalidatedTags,
  hasRevalidatedPath,
  hasRevalidatedTag,
  resetMockCookies,
  setAdminSession,
  setMockCookie,
  deleteMockCookie,
  clearMockCookies,
  clearRecordedCalls,
  getRecordedCalls,
  getLastRecordedCall,
  resetShopifyMocks,
  setMockResponse,
  setMockUserErrors,
};

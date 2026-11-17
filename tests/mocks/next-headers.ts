// Mock implementation of next/headers for offline test environment
import crypto from "node:crypto";

export const DEFAULT_STORED_HASH = "a1b2c3d4e5f6:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
export const DEFAULT_SESSION_TOKEN = crypto
  .createHmac("sha256", DEFAULT_STORED_HASH)
  .update("vape-mart-admin-session-v1")
  .digest("hex");

export const SESSION_COOKIE_NAME = "vm_admin_session";

interface CookieValue {
  name: string;
  value: string;
}

const cookieJar = new Map<string, string>();

// Initialize with valid admin session
cookieJar.set(SESSION_COOKIE_NAME, DEFAULT_SESSION_TOKEN);

export class MockCookieStore {
  get(name: string): CookieValue | undefined {
    const val = cookieJar.get(name);
    return val !== undefined ? { name, value: val } : undefined;
  }

  set(name: string, value: string, _options?: unknown): this {
    cookieJar.set(name, value);
    return this;
  }

  delete(name: string): this {
    cookieJar.delete(name);
    return this;
  }

  has(name: string): boolean {
    return cookieJar.has(name);
  }

  getAll(): CookieValue[] {
    return Array.from(cookieJar.entries()).map(([name, value]) => ({ name, value }));
  }
}

const storeInstance = new MockCookieStore();

export async function cookies(): Promise<MockCookieStore> {
  return storeInstance;
}

export async function headers(): Promise<Headers> {
  return new Headers();
}

export function setAdminSession(authenticated: boolean): void {
  if (authenticated) {
    cookieJar.set(SESSION_COOKIE_NAME, DEFAULT_SESSION_TOKEN);
  } else {
    cookieJar.delete(SESSION_COOKIE_NAME);
  }
}

export function setMockCookie(name: string, value: string): void {
  cookieJar.set(name, value);
}

export function deleteMockCookie(name: string): void {
  cookieJar.delete(name);
}

export function clearMockCookies(): void {
  cookieJar.clear();
}

export function resetMockCookies(): void {
  cookieJar.clear();
  cookieJar.set(SESSION_COOKIE_NAME, DEFAULT_SESSION_TOKEN);
}

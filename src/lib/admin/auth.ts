import "server-only";
import crypto from "node:crypto";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import { setShopMetafields } from "./settings";
import type { AuthState } from "./types";

export const SESSION_COOKIE = "vm_admin_session";

interface StoredHashQueryResponse {
  shop?: {
    metafield?: {
      value?: string | null;
    } | null;
  } | null;
}

async function getStoredHash(): Promise<string | null> {
  const d = await gql<StoredHashQueryResponse>(
    `{ shop { metafield(namespace: "admin", key: "panel_password") { value } } }`
  );
  return d.shop?.metafield?.value || null;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const calc = crypto.scryptSync(password, salt, 64);
  const orig = Buffer.from(hash, "hex");
  return calc.length === orig.length && crypto.timingSafeEqual(calc, orig);
}

export function sessionTokenFor(stored: string): string {
  return crypto
    .createHmac("sha256", stored)
    .update("vape-mart-admin-session-v1")
    .digest("hex");
}

export async function getAuthState(cookieToken: string | undefined): Promise<AuthState> {
  const stored = await getStoredHash();
  if (!stored) return { setupNeeded: true, authed: false };
  return {
    setupNeeded: false,
    authed: !!cookieToken && cookieToken === sessionTokenFor(stored),
  };
}

export async function setupPassword(code: string, password: string): Promise<string> {
  const expected = process.env.ADMIN_SETUP_CODE || "";
  if (!expected) throw new Error("Setup is not configured on the server (ADMIN_SETUP_CODE missing).");
  if (!code || code !== expected) throw new Error("Wrong setup code.");
  if (!password || password.length < 8) throw new Error("Password must be at least 8 characters.");
  const existing = await getStoredHash();
  if (existing) throw new Error("Password is already set. Use the login form.");
  const stored = hashPassword(password);
  await setShopMetafields([
    { key: "panel_password", type: "single_line_text_field", value: stored, namespace: "admin" },
  ]);
  return sessionTokenFor(stored);
}

export async function login(password: string): Promise<string> {
  const stored = await getStoredHash();
  if (!stored) throw new Error("Panel is not set up yet.");
  if (!verifyPassword(password || "", stored)) throw new Error("Wrong password.");
  return sessionTokenFor(stored);
}

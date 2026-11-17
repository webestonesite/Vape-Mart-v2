import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { SESSION_COOKIE, getAuthState } from "@/lib/admin/auth";
import type { ActionState } from "./types";

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function verifyAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const state = await getAuthState(token);
  return state.authed;
}

export function purgeTag(tag: string): void {
  try {
    revalidateTag(tag, { expire: 0 });
  } catch {
    // Ignore outside edge/cache context
  }
}

export function unauthorizedResponse<T = void>(): ActionState<T> {
  return {
    success: false,
    error: "Unauthorized session. Please login.",
    timestamp: Date.now(),
  };
}

export function errorResponse<T = void>(err: unknown, fallback = "Operation failed"): ActionState<T> {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : fallback;
  return {
    success: false,
    error: message,
    timestamp: Date.now(),
  };
}

export function successResponse<T = void>(data?: T, message?: string): ActionState<T> {
  return {
    success: true,
    message,
    data,
    timestamp: Date.now(),
  };
}

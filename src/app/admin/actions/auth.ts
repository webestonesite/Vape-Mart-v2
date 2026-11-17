"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE, getAuthState, login, setupPassword } from "@/lib/admin/auth";
import { COOKIE_OPTS, errorResponse, successResponse } from "./helpers";
import type { ActionState, AuthActionResult } from "./types";

export async function loginAction(
  prevStateOrPassword: unknown,
  formData?: FormData
): Promise<ActionState<AuthActionResult>> {
  try {
    let password = "";
    if (formData && typeof formData.get === "function") {
      password = String(formData.get("password") || "");
    } else if (typeof prevStateOrPassword === "string") {
      password = prevStateOrPassword;
    } else if (
      prevStateOrPassword &&
      typeof prevStateOrPassword === "object" &&
      "password" in (prevStateOrPassword as Record<string, unknown>)
    ) {
      password = String((prevStateOrPassword as Record<string, unknown>).password || "");
    }

    if (!password) {
      return {
        success: false,
        error: "Password is required.",
        timestamp: Date.now(),
      };
    }

    const token = await login(password);
    const store = await cookies();
    store.set(SESSION_COOKIE, token, COOKIE_OPTS);

    return successResponse<AuthActionResult>({ authed: true }, "Logged in successfully.");
  } catch (err) {
    return errorResponse<AuthActionResult>(err, "Login failed.");
  }
}

export async function setupPasswordAction(
  prevStateOrPayload: unknown,
  formData?: FormData
): Promise<ActionState<AuthActionResult>> {
  try {
    let code = "";
    let password = "";

    if (formData && typeof formData.get === "function") {
      code = String(formData.get("code") || "");
      password = String(formData.get("password") || "");
    } else if (prevStateOrPayload && typeof prevStateOrPayload === "object") {
      const obj = prevStateOrPayload as Record<string, unknown>;
      code = String(obj.code || "");
      password = String(obj.password || "");
    }

    if (!code || !password) {
      return {
        success: false,
        error: "Both setup code and password are required.",
        timestamp: Date.now(),
      };
    }

    const token = await setupPassword(code, password);
    const store = await cookies();
    store.set(SESSION_COOKIE, token, COOKIE_OPTS);

    return successResponse<AuthActionResult>({ authed: true }, "Admin password set successfully.");
  } catch (err) {
    return errorResponse<AuthActionResult>(err, "Setup failed.");
  }
}

export const setupAction = setupPasswordAction;

export async function logoutAction(): Promise<ActionState<void>> {
  try {
    const store = await cookies();
    store.set(SESSION_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
    return successResponse<void>(undefined, "Logged out successfully.");
  } catch (err) {
    return errorResponse<void>(err, "Logout failed.");
  }
}

export async function checkAuthAction(): Promise<ActionState<AuthActionResult>> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    const state = await getAuthState(token);
    return successResponse<AuthActionResult>(state);
  } catch (err) {
    return errorResponse<AuthActionResult>(err, "Failed to check auth state.");
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { createAdminRedirect, deleteAdminRedirect } from "@/lib/admin";
import {
  errorResponse,
  purgeTag,
  successResponse,
  unauthorizedResponse,
  verifyAdminSession,
} from "./helpers";
import type { ActionState, RedirectActionResult } from "./types";

function revalidateRedirectCaches() {
  purgeTag("admin-redirects");
  purgeTag("redirects");
  try {
    revalidatePath("/admin");
  } catch {
    // Non-fatal
  }
}

export async function createRedirectAction(
  prevStateOrPayload: unknown,
  maybeFormData?: FormData
): Promise<ActionState<RedirectActionResult>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    let path = "";
    let target = "";

    if (maybeFormData && typeof maybeFormData.get === "function") {
      path = String(maybeFormData.get("path") || "").trim();
      target = String(maybeFormData.get("target") || "").trim();
    } else if (prevStateOrPayload && typeof prevStateOrPayload === "object") {
      const obj = prevStateOrPayload as Record<string, unknown>;
      path = String(obj.path || "").trim();
      target = String(obj.target || "").trim();
    }

    if (!path.startsWith("/")) {
      return {
        success: false,
        error: "Redirect path must start with / (e.g. /old-url).",
        timestamp: Date.now(),
      };
    }
    if (!target) {
      return {
        success: false,
        error: "Target URL is required.",
        timestamp: Date.now(),
      };
    }

    const res = await createAdminRedirect({ path, target });
    revalidateRedirectCaches();
    return successResponse<RedirectActionResult>(
      { id: res.id, path, target },
      res.message || "Redirect added successfully."
    );
  } catch (err) {
    return errorResponse<RedirectActionResult>(err, "Failed to save redirect.");
  }
}

export const saveRedirectAction = createRedirectAction;

export async function deleteRedirectAction(redirectId: string): Promise<ActionState<{ id: string }>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await deleteAdminRedirect(redirectId);
    revalidateRedirectCaches();
    return successResponse<{ id: string }>({ id: redirectId }, res.message || "Redirect deleted successfully.");
  } catch (err) {
    return errorResponse<{ id: string }>(err, "Failed to delete redirect.");
  }
}

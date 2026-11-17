"use server";

import { revalidatePath } from "next/cache";
import { updateAdminShopSettings } from "@/lib/admin";
import {
  errorResponse,
  purgeTag,
  successResponse,
  unauthorizedResponse,
  verifyAdminSession,
} from "./helpers";
import type { ActionState } from "./types";

function revalidateSettingsCaches() {
  purgeTag("admin-settings");
  purgeTag("site-settings");
  purgeTag("home");
  try {
    revalidatePath("/admin");
    revalidatePath("/");
  } catch {
    // Non-fatal
  }
}

export async function saveShopSettingsAction(
  section: string,
  payload: Record<string, unknown>
): Promise<ActionState<void>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await updateAdminShopSettings(section, payload);
    revalidateSettingsCaches();
    return successResponse<void>(undefined, res.message || "Settings saved successfully.");
  } catch (err) {
    return errorResponse<void>(err, `Failed to save ${section} settings.`);
  }
}

export async function saveGeneralSettingsAction(payload: Record<string, unknown>): Promise<ActionState<void>> {
  return saveShopSettingsAction("general", payload);
}

export async function saveThemeSettingsAction(payload: Record<string, unknown>): Promise<ActionState<void>> {
  return saveShopSettingsAction("theme", payload);
}

export async function saveHomeSettingsAction(payload: Record<string, unknown>): Promise<ActionState<void>> {
  return saveShopSettingsAction("home", payload);
}

export async function saveCheckoutSettingsAction(payload: Record<string, unknown>): Promise<ActionState<void>> {
  return saveShopSettingsAction("checkout", payload);
}

export async function saveProductPageSettingsAction(payload: Record<string, unknown>): Promise<ActionState<void>> {
  return saveShopSettingsAction("productPage", payload);
}

export async function saveCollectionPageSettingsAction(payload: Record<string, unknown>): Promise<ActionState<void>> {
  return saveShopSettingsAction("collectionPage", payload);
}

export async function saveBlogSettingsAction(payload: Record<string, unknown>): Promise<ActionState<void>> {
  return saveShopSettingsAction("blogSettings", payload);
}

export async function savePagesSettingsAction(payload: Record<string, unknown>): Promise<ActionState<void>> {
  return saveShopSettingsAction("pages", payload);
}

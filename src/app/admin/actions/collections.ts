"use server";

import { revalidatePath } from "next/cache";
import {
  createAdminCollection,
  deleteAdminCollection,
  updateAdminCollection,
} from "@/lib/admin";
import {
  errorResponse,
  purgeTag,
  successResponse,
  unauthorizedResponse,
  verifyAdminSession,
} from "./helpers";
import type { ActionState, CollectionActionResult, CreateCollectionInput, UpdateCollectionInput } from "./types";

function revalidateCollectionCaches(handle?: string) {
  purgeTag("admin-collections");
  purgeTag("collections");
  purgeTag("sitemap");
  try {
    revalidatePath("/admin");
    revalidatePath("/collections");
    if (handle) {
      revalidatePath(`/collection/${handle}`);
      revalidatePath(`/collections/${handle}`);
    }
  } catch {
    // Non-fatal
  }
}

export async function createCollectionAction(
  payload: CreateCollectionInput
): Promise<ActionState<CollectionActionResult>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const title = String(payload.title || "").trim();
    if (!title) {
      return {
        success: false,
        error: "Collection title is required.",
        timestamp: Date.now(),
      };
    }
    const res = await createAdminCollection(title, {
      descriptionHtml: payload.descriptionHtml,
      sortOrder: payload.sortOrder,
    });
    revalidateCollectionCaches();
    return successResponse<CollectionActionResult>(
      { id: res.id, title },
      res.message || "Collection created successfully."
    );
  } catch (err) {
    return errorResponse<CollectionActionResult>(err, "Failed to create collection.");
  }
}

export async function updateCollectionAction(
  payload: UpdateCollectionInput
): Promise<ActionState<void>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await updateAdminCollection(payload);
    revalidateCollectionCaches(payload.handle);
    return successResponse<void>(undefined, res.message || "Collection updated successfully.");
  } catch (err) {
    return errorResponse<void>(err, "Failed to update collection.");
  }
}

export async function deleteCollectionAction(collectionId: string): Promise<ActionState<void>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await deleteAdminCollection(collectionId);
    revalidateCollectionCaches();
    return successResponse<void>(undefined, res.message || "Collection deleted successfully.");
  } catch (err) {
    return errorResponse<void>(err, "Failed to delete collection.");
  }
}

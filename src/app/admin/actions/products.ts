"use server";

import { revalidatePath } from "next/cache";
import { invalidateAllMemoryCaches } from "@/lib/shopify";
import {
  createAdminProduct,
  deleteAdminProduct,
  saveBulkMetafields,
  updateAdminProduct,
} from "@/lib/admin";
import {
  errorResponse,
  purgeTag,
  successResponse,
  unauthorizedResponse,
  verifyAdminSession,
} from "./helpers";
import type {
  ActionState,
  BulkChangeInput,
  BulkSaveResult,
  CreateProductInput,
  ProductStatusToggleResult,
  UpdateProductInput,
} from "./types";

function revalidateProductCaches(handle?: string) {
  try {
    invalidateAllMemoryCaches();
  } catch {
    // Non-fatal
  }
  purgeTag("admin-products");
  purgeTag("products");
  purgeTag("sitemap");
  purgeTag("collections");
  try {
    revalidatePath("/admin");
    revalidatePath("/products");
    if (handle) {
      revalidatePath(`/product/${handle}`);
      revalidatePath(`/products/${handle}`);
    }
  } catch {
    // Non-fatal
  }
}

export async function createProductAction(payload: CreateProductInput): Promise<ActionState<{ id?: string }>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await createAdminProduct(payload);
    revalidateProductCaches(payload.handle);
    return successResponse<{ id?: string }>({ id: res.id }, res.message || "Product created successfully.");
  } catch (err) {
    return errorResponse<{ id?: string }>(err, "Failed to create product.");
  }
}

export async function updateProductAction(payload: UpdateProductInput): Promise<ActionState<void>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await updateAdminProduct(payload);
    revalidateProductCaches(payload.handle);
    return successResponse<void>(undefined, res.message || "Product updated successfully.");
  } catch (err) {
    return errorResponse<void>(err, "Failed to update product.");
  }
}

export async function toggleProductStatusAction(
  productId: string,
  targetStatus: "ACTIVE" | "DRAFT"
): Promise<ActionState<ProductStatusToggleResult>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await updateAdminProduct({ id: productId, status: targetStatus });
    revalidateProductCaches();
    return successResponse<ProductStatusToggleResult>(
      { id: productId, status: targetStatus },
      res.message || `Product status set to ${targetStatus}.`
    );
  } catch (err) {
    return errorResponse<ProductStatusToggleResult>(err, "Failed to toggle product status.");
  }
}

export async function deleteProductAction(productId: string): Promise<ActionState<void>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await deleteAdminProduct(productId);
    revalidateProductCaches();
    return successResponse<void>(undefined, res.message || "Product deleted successfully.");
  } catch (err) {
    return errorResponse<void>(err, "Failed to delete product.");
  }
}

export async function bulkSaveAction(changes: BulkChangeInput[]): Promise<ActionState<BulkSaveResult>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await saveBulkMetafields(Array.isArray(changes) ? changes : []);
    revalidateProductCaches();
    return successResponse<BulkSaveResult>(
      { updatedCount: res.updated },
      `Bulk save completed: ${res.updated} products updated.`
    );
  } catch (err) {
    return errorResponse<BulkSaveResult>(err, "Failed to save bulk metafields.");
  }
}

export const bulkSaveProductsAction = bulkSaveAction;

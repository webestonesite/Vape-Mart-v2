"use server";

import { revalidatePath } from "next/cache";
import { fulfillAdminOrder, refundAdminOrder } from "@/lib/admin";
import {
  errorResponse,
  purgeTag,
  successResponse,
  unauthorizedResponse,
  verifyAdminSession,
} from "./helpers";
import type { ActionState } from "./types";

function revalidateOrderCaches() {
  purgeTag("admin-orders");
  try {
    revalidatePath("/admin");
  } catch {
    // Non-fatal
  }
}

export async function fulfillOrderAction(orderId: string): Promise<ActionState<void>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await fulfillAdminOrder(orderId);
    revalidateOrderCaches();
    return successResponse<void>(undefined, res.message || "Order fulfilled successfully.");
  } catch (err) {
    return errorResponse<void>(err, "Failed to fulfill order.");
  }
}

export async function refundOrderAction(orderId: string): Promise<ActionState<void>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await refundAdminOrder(orderId);
    revalidateOrderCaches();
    return successResponse<void>(undefined, res.message || "Order refunded successfully.");
  } catch (err) {
    return errorResponse<void>(err, "Failed to refund order.");
  }
}

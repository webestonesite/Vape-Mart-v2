"use server";

import { revalidatePath } from "next/cache";
import { deleteAdminMetaobject, saveAdminMetaobject } from "@/lib/admin";
import {
  errorResponse,
  purgeTag,
  successResponse,
  unauthorizedResponse,
  verifyAdminSession,
} from "./helpers";
import type {
  ActionState,
  CollectionFaqInput,
  FaqItemInput,
  FlavorInput,
  HeroSlideInput,
  HomeSectionInput,
  MetaobjectActionResult,
  ProductReviewInput,
  ShowcaseCardInput,
  TestimonialInput,
} from "./types";

function revalidateCmsCaches() {
  purgeTag("admin-content");
  purgeTag("cms-content");
  purgeTag("home");
  try {
    revalidatePath("/admin");
    revalidatePath("/");
  } catch {
    // Non-fatal
  }
}

export async function saveMetaobjectAction(
  type: string,
  payload: Record<string, unknown>
): Promise<ActionState<MetaobjectActionResult>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await saveAdminMetaobject(type, payload);
    revalidateCmsCaches();
    return successResponse<MetaobjectActionResult>(
      { id: res.id, type },
      res.message || "Metaobject saved successfully."
    );
  } catch (err) {
    return errorResponse<MetaobjectActionResult>(err, `Failed to save metaobject (${type}).`);
  }
}

export async function deleteMetaobjectAction(
  type: string,
  id: string
): Promise<ActionState<{ id: string }>> {
  if (!(await verifyAdminSession())) return unauthorizedResponse();

  try {
    const res = await deleteAdminMetaobject(id);
    revalidateCmsCaches();
    return successResponse<{ id: string }>({ id }, res.message || "Metaobject deleted successfully.");
  } catch (err) {
    return errorResponse<{ id: string }>(err, `Failed to delete metaobject (${type}).`);
  }
}

export async function saveHeroSlideAction(payload: HeroSlideInput): Promise<ActionState<MetaobjectActionResult>> {
  return saveMetaobjectAction("hero_slide", payload as unknown as Record<string, unknown>);
}

export async function deleteHeroSlideAction(id: string): Promise<ActionState<{ id: string }>> {
  return deleteMetaobjectAction("hero_slide", id);
}

export async function saveHomeSectionAction(payload: HomeSectionInput): Promise<ActionState<MetaobjectActionResult>> {
  return saveMetaobjectAction("home_section", payload as unknown as Record<string, unknown>);
}

export async function saveTestimonialAction(payload: TestimonialInput): Promise<ActionState<MetaobjectActionResult>> {
  return saveMetaobjectAction("testimonial", payload as unknown as Record<string, unknown>);
}

export async function deleteTestimonialAction(id: string): Promise<ActionState<{ id: string }>> {
  return deleteMetaobjectAction("testimonial", id);
}

export async function saveFaqAction(payload: FaqItemInput): Promise<ActionState<MetaobjectActionResult>> {
  return saveMetaobjectAction("faq_item", payload as unknown as Record<string, unknown>);
}

export async function deleteFaqAction(id: string): Promise<ActionState<{ id: string }>> {
  return deleteMetaobjectAction("faq_item", id);
}

export async function saveShowcaseAction(payload: ShowcaseCardInput): Promise<ActionState<MetaobjectActionResult>> {
  return saveMetaobjectAction("showcase_card", payload as unknown as Record<string, unknown>);
}

export async function deleteShowcaseAction(id: string): Promise<ActionState<{ id: string }>> {
  return deleteMetaobjectAction("showcase_card", id);
}

export async function saveFlavorAction(payload: FlavorInput): Promise<ActionState<MetaobjectActionResult>> {
  return saveMetaobjectAction("flavor", payload as unknown as Record<string, unknown>);
}

export async function deleteFlavorAction(id: string): Promise<ActionState<{ id: string }>> {
  return deleteMetaobjectAction("flavor", id);
}

export async function saveReviewAction(payload: ProductReviewInput): Promise<ActionState<MetaobjectActionResult>> {
  return saveMetaobjectAction("vm_product_review", payload as unknown as Record<string, unknown>);
}

export async function deleteReviewAction(id: string): Promise<ActionState<{ id: string }>> {
  return deleteMetaobjectAction("vm_product_review", id);
}

export async function saveCollectionFaqAction(payload: CollectionFaqInput): Promise<ActionState<MetaobjectActionResult>> {
  return saveMetaobjectAction("vm_collection_faq", payload as unknown as Record<string, unknown>);
}

export async function deleteCollectionFaqAction(id: string): Promise<ActionState<{ id: string }>> {
  return deleteMetaobjectAction("vm_collection_faq", id);
}

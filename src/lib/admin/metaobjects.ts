import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import { fieldsMap, fileFromUrl } from "./common";
import type { AdminMetaobject, FieldObj, PageInfo, SaveResult } from "./types";

interface MoCreateResponse {
  metaobjectCreate?: {
    metaobject?: { id?: string };
    userErrors?: { message: string }[];
  };
}

interface MoUpdateResponse {
  metaobjectUpdate?: {
    metaobject?: { id?: string };
    userErrors?: { message: string }[];
  };
}

interface MoDeleteResponse {
  metaobjectDelete?: {
    deletedId?: string;
    userErrors?: { message: string }[];
  };
}

interface MetaobjectsQueryResponse {
  metaobjects?: {
    nodes?: {
      id?: string;
      type?: string;
      fields?: { key: string; value: string | null }[];
    }[];
    pageInfo?: {
      hasNextPage?: boolean;
      endCursor?: string | null;
    };
  };
}

export async function moCreate(type: string, fields: FieldObj): Promise<string> {
  const d = await gql<MoCreateResponse>(
    `mutation MoCreate($metaobject: MetaobjectCreateInput!) {
       metaobjectCreate(metaobject: $metaobject) {
         metaobject { id }
         userErrors { message }
       }
     }`,
    {
      metaobject: {
        type,
        capabilities: { publish: { status: "ACTIVE" } },
        fields: Object.entries(fields)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([key, value]) => ({ key, value: String(value) })),
      },
    }
  );
  const errs = d.metaobjectCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  const id = d.metaobjectCreate?.metaobject?.id;
  if (!id) throw new Error("Shopify did not return an ID.");
  return id;
}

export async function moUpdate(id: string, fields: FieldObj): Promise<void> {
  const d = await gql<MoUpdateResponse>(
    `mutation MoUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
       metaobjectUpdate(id: $id, metaobject: $metaobject) {
         metaobject { id }
         userErrors { message }
       }
     }`,
    {
      id,
      metaobject: {
        capabilities: { publish: { status: "ACTIVE" } },
        fields: Object.entries(fields)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([key, value]) => ({ key, value: String(value) })),
      },
    }
  );
  const errs = d.metaobjectUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

export async function moDelete(id: string): Promise<void> {
  const d = await gql<MoDeleteResponse>(
    `mutation MoDelete($id: ID!) {
       metaobjectDelete(id: $id) {
         deletedId
         userErrors { message }
       }
     }`,
    { id }
  );
  const errs = d.metaobjectDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

export async function getAdminMetaobjects(
  type: string,
  opts: { limit?: number; after?: string | null } = {}
): Promise<{ metaobjects: AdminMetaobject[]; pageInfo: PageInfo }> {
  const limit = Math.min(Math.max(opts.limit || 50, 1), 250);
  const d = await gql<MetaobjectsQueryResponse>(
    `query PanelMetaobjects($type: String!, $first: Int!, $after: String) {
       metaobjects(type: $type, first: $first, after: $after) {
         nodes {
           id
           type
           fields { key value }
         }
         pageInfo { hasNextPage endCursor }
       }
     }`,
    { type, first: limit, after: opts.after || null }
  );

  const metaobjects: AdminMetaobject[] = (d.metaobjects?.nodes ?? []).map((n) => ({
    id: n.id || "",
    type: n.type || type,
    fields: fieldsMap(n.fields),
  }));

  const pageInfo: PageInfo = {
    hasNextPage: !!d.metaobjects?.pageInfo?.hasNextPage,
    endCursor: d.metaobjects?.pageInfo?.endCursor || null,
  };

  return { metaobjects, pageInfo };
}

export async function saveAdminMetaobject(
  type: string,
  p: Record<string, unknown>
): Promise<SaveResult> {
  const str = (v: unknown): string | undefined => (v !== undefined && v !== null ? String(v) : undefined);

  switch (type) {
    case "hero_slide":
    case "hero": {
      const fields: FieldObj = {
        title: str(p.title),
        description: str(p.description),
        badge: str(p.badge),
        button_text: str(p.buttonText),
        button_link: str(p.buttonLink),
        position: str(p.position),
      };
      if (p.imageFileId) fields.image = String(p.imageFileId);
      else if (p.imageUrl) fields.image = await fileFromUrl(String(p.imageUrl), String(p.title || "Hero slide"));
      if (p.id) {
        await moUpdate(String(p.id), fields);
        return { message: "Hero slide updated.", id: String(p.id) };
      }
      const id = await moCreate("hero_slide", fields);
      return { message: "Hero slide added.", id };
    }

    case "home_section":
    case "section": {
      const productIds = Array.isArray(p.productIds) ? p.productIds.map(String) : [];
      const fields: FieldObj = {
        title: str(p.title),
        subtitle: str(p.subtitle),
        badge_text: str(p.badgeText),
        products: JSON.stringify(productIds),
      };
      if (p.key) fields.section_key = String(p.key);
      if (p.id) {
        await moUpdate(String(p.id), fields);
        return { message: "Section saved.", id: String(p.id) };
      }
      const id = await moCreate("home_section", fields);
      return { message: "Section created.", id };
    }

    case "testimonial":
    case "review_testimonial": {
      const fields: FieldObj = {
        name: str(p.name),
        role: str(p.role),
        title: str(p.title),
        review: str(p.review),
        position: str(p.position),
      };
      if (p.id) {
        await moUpdate(String(p.id), fields);
        return { message: "Review updated.", id: String(p.id) };
      }
      const id = await moCreate("testimonial", fields);
      return { message: "Review added.", id };
    }

    case "faq_item":
    case "faq": {
      const fields: FieldObj = {
        question: str(p.question),
        answer: str(p.answer),
        position: str(p.position),
      };
      if (p.id) {
        await moUpdate(String(p.id), fields);
        return { message: "FAQ updated.", id: String(p.id) };
      }
      const id = await moCreate("faq_item", fields);
      return { message: "FAQ added.", id };
    }

    case "showcase_card":
    case "showcase": {
      const fields: FieldObj = {
        section_key: str(p.sectionKey),
        title: str(p.title),
        price: str(p.price),
        revs: str(p.revs),
        badge: str(p.badge),
        brand: str(p.brand),
        image_url: str(p.imageUrl),
        position: str(p.position),
      };
      if (p.id) {
        await moUpdate(String(p.id), fields);
        return { message: "Card updated.", id: String(p.id) };
      }
      const id = await moCreate("showcase_card", fields);
      return { message: "Card added.", id };
    }

    case "flavor": {
      const fields: FieldObj = {
        name: str(p.name),
        color: str(p.color),
        in_stock: p.inStock ? "true" : "false",
      };
      if (p.imageFileId) fields.image = String(p.imageFileId);
      else if (p.imageUrl) fields.image = await fileFromUrl(String(p.imageUrl), String(p.name || "Flavor"));
      if (p.id) {
        await moUpdate(String(p.id), fields);
        return { message: "Flavor updated.", id: String(p.id) };
      }
      const id = await moCreate("flavor", fields);
      return { message: "Flavor added.", id };
    }

    case "vm_product_review":
    case "product_review": {
      const fields: FieldObj = {
        product: str(p.product),
        author: str(p.author),
        rating: str(p.rating ?? "5"),
        title: str(p.title),
        body: str(p.body),
        verified: p.verified ? "true" : "false",
        position: str(p.position),
      };
      if (p.id) {
        await moUpdate(String(p.id), fields);
        return { message: "Review updated.", id: String(p.id) };
      }
      const id = await moCreate("vm_product_review", fields);
      return { message: "Review added.", id };
    }

    case "vm_collection_faq":
    case "collection_faq": {
      const fields: FieldObj = {
        collection: str(p.collection),
        question: str(p.question),
        answer: str(p.answer),
        position: str(p.position),
      };
      if (p.id) {
        await moUpdate(String(p.id), fields);
        return { message: "Collection FAQ updated.", id: String(p.id) };
      }
      const id = await moCreate("vm_collection_faq", fields);
      return { message: "Collection FAQ added.", id };
    }

    default:
      throw new Error(`Unsupported metaobject type: ${type}`);
  }
}

export async function deleteAdminMetaobject(id: string): Promise<SaveResult> {
  await moDelete(id);
  return { message: "Item deleted.", id };
}

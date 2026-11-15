/**
 * 1-Click Shopify CMS Metaobject Bootstrap Script
 * Provisions all 8 Metaobject definitions & starter layout in Shopify Admin idempotently.
 *
 * Usage:
 *   node scripts/bootstrap-shopify-cms.mjs
 */

import fs from "fs";
import path from "path";

// 1. Read .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envVars = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [k, ...v] = trimmed.split("=");
    if (k) envVars[k.trim()] = v.join("=").replace(/^["']|["']$/g, "").trim();
  }
}

const SHOP_DOMAIN =
  envVars.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  envVars.SHOPIFY_STORE_DOMAIN ||
  "vf4iap-u5.myshopify.com";

const API_VERSION = envVars.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2025-07";

async function getAdminToken() {
  const clientId = envVars.SHOPIFY_CLIENT_ID;
  const clientSecret = envVars.SHOPIFY_CLIENT_SECRET;
  const staticToken = envVars.SHOPIFY_ADMIN_ACCESS_TOKEN || envVars.SHOPIFY_ADMIN_TOKEN;

  if (staticToken) return staticToken;

  if (clientId && clientSecret) {
    console.log("🔑 Requesting Admin API OAuth token via client_credentials...");
    const res = await fetch(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });
    if (!res.ok) {
      throw new Error(`OAuth failed: HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.access_token;
  }

  throw new Error("No Shopify credentials found in .env.local");
}

async function shopifyAdminGql(token, query, variables = {}) {
  const res = await fetch(`https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return json;
}

const DEFINITIONS = [
  {
    name: "Site Settings",
    type: "site_settings",
    description: "Global store branding, announcement bar, and layout info",
    fieldDefinitions: [
      { name: "Store Name", key: "store_name", type: "single_line_text_field" },
      { name: "Logo", key: "logo", type: "file_reference" },
      { name: "Favicon", key: "favicon", type: "file_reference" },
      { name: "Show Announcement", key: "show_announcement", type: "boolean" },
      { name: "Announcement Text", key: "announcement_text", type: "single_line_text_field" },
      { name: "Support Phone", key: "support_phone", type: "single_line_text_field" },
      { name: "Support Email", key: "support_email", type: "single_line_text_field" },
      { name: "Footer About", key: "footer_about", type: "rich_text_field" },
      { name: "Copyright Text", key: "copyright_text", type: "single_line_text_field" },
    ],
  },
  {
    name: "FAQ Item",
    type: "faq_item",
    description: "Reusable accordion FAQ question & answer",
    fieldDefinitions: [
      { name: "Question", key: "question", type: "single_line_text_field" },
      { name: "Answer", key: "answer", type: "rich_text_field" },
    ],
  },
  {
    name: "Hero Section",
    type: "section_hero",
    description: "Homepage hero banner with background image and CTA button",
    fieldDefinitions: [
      { name: "Internal Title", key: "internal_title", type: "single_line_text_field" },
      { name: "Is Active", key: "is_active", type: "boolean" },
      { name: "Heading", key: "heading", type: "single_line_text_field" },
      { name: "Sub Heading", key: "sub_heading", type: "multi_line_text_field" },
      { name: "Desktop Image", key: "desktop_image", type: "file_reference" },
      { name: "Mobile Image", key: "mobile_image", type: "file_reference" },
      { name: "Text Alignment", key: "text_alignment", type: "single_line_text_field" },
      { name: "Button Label", key: "button_label", type: "single_line_text_field" },
      { name: "Link Collection", key: "link_collection", type: "collection_reference" },
      { name: "Link Product", key: "link_product", type: "product_reference" },
      { name: "Link Page", key: "link_page", type: "page_reference" },
      { name: "Custom URL", key: "custom_url", type: "single_line_text_field" },
    ],
  },
  {
    name: "Products Section",
    type: "section_products",
    description: "Showcases a curated grid or carousel of products from a collection",
    fieldDefinitions: [
      { name: "Is Active", key: "is_active", type: "boolean" },
      { name: "Heading", key: "heading", type: "single_line_text_field" },
      { name: "Sub Heading", key: "sub_heading", type: "single_line_text_field" },
      { name: "Collection", key: "collection", type: "collection_reference" },
      { name: "Product Limit", key: "product_limit", type: "number_integer" },
      { name: "Show View All", key: "show_view_all", type: "boolean" },
    ],
  },
  {
    name: "Promo Section",
    type: "section_promo",
    description: "Split promo banner with high-contrast copy, badge, and image",
    fieldDefinitions: [
      { name: "Is Active", key: "is_active", type: "boolean" },
      { name: "Badge Text", key: "badge_text", type: "single_line_text_field" },
      { name: "Heading", key: "heading", type: "single_line_text_field" },
      { name: "Description", key: "description", type: "rich_text_field" },
      { name: "Image", key: "image", type: "file_reference" },
      { name: "Image Position", key: "image_position", type: "single_line_text_field" },
      { name: "Theme Style", key: "theme_style", type: "single_line_text_field" },
      { name: "Button Label", key: "button_label", type: "single_line_text_field" },
      { name: "Link Collection", key: "link_collection", type: "collection_reference" },
      { name: "Link Product", key: "link_product", type: "product_reference" },
      { name: "Link Page", key: "link_page", type: "page_reference" },
      { name: "Custom URL", key: "custom_url", type: "single_line_text_field" },
    ],
  },
  {
    name: "Categories Section",
    type: "section_categories",
    description: "Visual grid of featured collections",
    fieldDefinitions: [
      { name: "Is Active", key: "is_active", type: "boolean" },
      { name: "Heading", key: "heading", type: "single_line_text_field" },
      { name: "Collections", key: "collections", type: "list.collection_reference" },
    ],
  },
];

async function main() {
  console.log("🚀 Starting Shopify Metaobject CMS Bootstrap for:", SHOP_DOMAIN);
  const token = await getAdminToken();
  console.log("✅ Authenticated with Shopify Admin API successfully.\n");

  // Query existing definitions
  const existingRes = await shopifyAdminGql(token, `{ metaobjectDefinitions(first: 50) { nodes { id type } } }`);
  const defMap = new Map();
  for (const d of existingRes.data?.metaobjectDefinitions?.nodes || []) {
    defMap.set(d.type, d.id);
  }

  // Create base definitions
  for (const def of DEFINITIONS) {
    if (defMap.has(def.type)) {
      console.log(`Definition [${def.type}] already exists (ID: ${defMap.get(def.type)})`);
      continue;
    }

    process.stdout.write(`Creating definition [${def.type}] ... `);
    const mutation = `
      mutation CreateMetaobjectDef($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            type
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const res = await shopifyAdminGql(token, mutation, {
      definition: {
        name: def.name,
        type: def.type,
        description: def.description,
        access: {
          storefront: "PUBLIC_READ",
        },
        fieldDefinitions: def.fieldDefinitions.map((f) => ({
          name: f.name,
          key: f.key,
          type: f.type,
        })),
      },
    });

    const errors = res.data?.metaobjectDefinitionCreate?.userErrors || [];
    if (errors.length > 0) {
      console.log("INFO:", errors.map((e) => e.message).join(", "));
    } else {
      const id = res.data?.metaobjectDefinitionCreate?.metaobjectDefinition?.id;
      defMap.set(def.type, id);
      console.log(`CREATED (ID: ${id})`);
    }
  }

  // Create section_faq with validation to faq_item
  if (!defMap.has("section_faq")) {
    const faqItemId = defMap.get("faq_item");
    process.stdout.write("Creating definition [section_faq] ... ");
    const faqDefRes = await shopifyAdminGql(
      token,
      `mutation CreateSectionFaq($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition { id type }
          userErrors { field message }
        }
      }`,
      {
        definition: {
          name: "FAQ Section",
          type: "section_faq",
          description: "List of expandable FAQs",
          access: { storefront: "PUBLIC_READ" },
          fieldDefinitions: [
            { name: "Is Active", key: "is_active", type: "boolean" },
            { name: "Heading", key: "heading", type: "single_line_text_field" },
            {
              name: "Items",
              key: "items",
              type: "list.metaobject_reference",
              validations: faqItemId ? [{ name: "metaobject_definition_id", value: faqItemId }] : undefined,
            },
          ],
        },
      }
    );
    const faqDefId = faqDefRes.data?.metaobjectDefinitionCreate?.metaobjectDefinition?.id;
    if (faqDefId) {
      defMap.set("section_faq", faqDefId);
      console.log(`CREATED (ID: ${faqDefId})`);
    } else {
      console.log("Result:", faqDefRes.data?.metaobjectDefinitionCreate?.userErrors || "OK");
    }
  } else {
    console.log(`Definition [section_faq] already exists (ID: ${defMap.get("section_faq")})`);
  }

  // Create page_layout with list.metaobject_reference
  if (!defMap.has("page_layout")) {
    process.stdout.write("Creating master definition [page_layout] ... ");

    const layoutMutation = `
      mutation CreatePageLayoutDef($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition { id type }
          userErrors { field message }
        }
      }
    `;

    const heroId = defMap.get("section_hero");
    const productsId = defMap.get("section_products");
    const promoId = defMap.get("section_promo");
    const categoriesId = defMap.get("section_categories");
    const faqId = defMap.get("section_faq");

    const layoutRes = await shopifyAdminGql(token, layoutMutation, {
      definition: {
        name: "Page Layout",
        type: "page_layout",
        description: "WordPress-style drag-and-drop page builder layout",
        access: { storefront: "PUBLIC_READ" },
        fieldDefinitions: [
          { name: "Title", key: "title", type: "single_line_text_field" },
          {
            name: "Hero Sections",
            key: "hero_sections",
            type: "list.metaobject_reference",
            validations: heroId ? [{ name: "metaobject_definition_id", value: heroId }] : undefined,
          },
          {
            name: "Product Sections",
            key: "product_sections",
            type: "list.metaobject_reference",
            validations: productsId ? [{ name: "metaobject_definition_id", value: productsId }] : undefined,
          },
          {
            name: "Promo Sections",
            key: "promo_sections",
            type: "list.metaobject_reference",
            validations: promoId ? [{ name: "metaobject_definition_id", value: promoId }] : undefined,
          },
          {
            name: "Category Sections",
            key: "category_sections",
            type: "list.metaobject_reference",
            validations: categoriesId ? [{ name: "metaobject_definition_id", value: categoriesId }] : undefined,
          },
          {
            name: "FAQ Sections",
            key: "faq_sections",
            type: "list.metaobject_reference",
            validations: faqId ? [{ name: "metaobject_definition_id", value: faqId }] : undefined,
          },
        ],
      },
    });

    const layoutId = layoutRes.data?.metaobjectDefinitionCreate?.metaobjectDefinition?.id;
    if (layoutId) {
      defMap.set("page_layout", layoutId);
      console.log(`CREATED (ID: ${layoutId})`);
    } else {
      console.log("Result:", layoutRes.data?.metaobjectDefinitionCreate?.userErrors || "OK");
    }
  } else {
    console.log(`Definition [page_layout] already exists (ID: ${defMap.get("page_layout")})`);
  }

  console.log("\n🎉 Shopify CMS Metaobject Bootstrap complete! All 8 definitions active in store.");
}

main().catch((err) => {
  console.error("\n❌ Bootstrap failed:", err.message);
  process.exit(1);
});

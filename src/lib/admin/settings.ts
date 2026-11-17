import "server-only";
import { shopifyAdminMutation as gql, fetchShopSettings } from "@/lib/shopify";
import { SHOP_ID, fileFromUrl } from "./common";
import type { AdminShopSettings, SaveResult } from "./types";

interface MetafieldsSetResponse {
  metafieldsSet?: {
    metafields?: { id: string; key: string }[];
    userErrors?: { message: string }[];
  };
}

export async function setShopMetafields(
  entries: { namespace?: string; key: string; type: string; value: string }[]
): Promise<void> {
  const d = await gql<MetafieldsSetResponse>(
    `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
       metafieldsSet(metafields: $metafields) {
         metafields { id key }
         userErrors { message }
       }
     }`,
    { metafields: entries.map((e) => ({ ...e, ownerId: SHOP_ID, namespace: e.namespace || "theme" })) }
  );
  const errs = d.metafieldsSet?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

export async function getAdminShopSettings(): Promise<AdminShopSettings> {
  const settings = await fetchShopSettings(0);
  return {
    announcements: settings.announcements || [],
    phone: settings.phone || "",
    footerText: settings.footerText || "",
    logoUrl: settings.logoUrl || "",
    checkout: settings.checkout || {},
    productPage: settings.productPage || {},
    collectionPage: settings.collectionPage || {},
    theme: settings.theme || {},
    home: settings.home || {},
    blog: settings.blog || {},
    pages: settings.pages || {},
  };
}

export async function updateAdminShopSettings(section: string, p: Record<string, unknown>): Promise<SaveResult> {
  switch (section) {
    case "settings":
    case "general": {
      const announcements = Array.isArray(p.announcements) ? p.announcements : [];
      await setShopMetafields([
        {
          key: "announcements",
          type: "list.single_line_text_field",
          value: JSON.stringify(announcements.map(String).filter((x: string) => x.trim())),
        },
        { key: "phone", type: "single_line_text_field", value: String(p.phone ?? "") },
        { key: "footer_text", type: "multi_line_text_field", value: String(p.footerText ?? "") },
      ]);
      return { message: "Top bar, phone and footer text saved." };
    }

    case "checkout":
    case "checkout.save": {
      await setShopMetafields([
        {
          namespace: "checkout",
          key: "free_shipping_threshold",
          type: "number_integer",
          value: String(parseInt(String(p.freeShippingThreshold ?? 0), 10) || 0),
        },
        {
          namespace: "checkout",
          key: "delivery_fee",
          type: "number_decimal",
          value: String(parseFloat(String(p.deliveryFee ?? 0)) || 0),
        },
        { namespace: "checkout", key: "vat_note", type: "single_line_text_field", value: String(p.vatNote || "") },
        { namespace: "checkout", key: "city_promises", type: "json", value: JSON.stringify(p.cityPromises ?? []) },
        { namespace: "checkout", key: "payment_labels", type: "json", value: JSON.stringify(p.paymentLabels ?? []) },
      ]);
      return { message: "Cart & checkout settings saved." };
    }

    case "productPage":
    case "productPage.save": {
      await setShopMetafields([
        { namespace: "product_page", key: "trust_badges", type: "json", value: JSON.stringify(p.trustBadges ?? []) },
        { namespace: "product_page", key: "shipping_text", type: "multi_line_text_field", value: String(p.shippingText || "") },
        { namespace: "product_page", key: "return_text", type: "multi_line_text_field", value: String(p.returnText || "") },
        { namespace: "product_page", key: "spec_order", type: "list.single_line_text_field", value: JSON.stringify(Array.isArray(p.specOrder) ? p.specOrder.map(String) : []) },
      ]);
      return { message: "Product page settings saved." };
    }

    case "collectionPage":
    case "collectionPage.save": {
      await setShopMetafields([
        { namespace: "collection_page", key: "items_per_page", type: "number_integer", value: String(parseInt(String(p.itemsPerPage ?? 0), 10) || 0) },
        { namespace: "collection_page", key: "compare_limit", type: "number_integer", value: String(parseInt(String(p.compareLimit ?? 0), 10) || 0) },
        { namespace: "collection_page", key: "sort_options", type: "json", value: JSON.stringify(p.sortOptions ?? []) },
        { namespace: "collection_page", key: "puff_buckets", type: "json", value: JSON.stringify(p.puffBuckets ?? []) },
        { namespace: "collection_page", key: "flavor_families", type: "json", value: JSON.stringify(p.flavorFamilies ?? []) },
        { namespace: "collection_page", key: "quiz_steps", type: "json", value: JSON.stringify(p.quizSteps ?? []) },
        { namespace: "collection_page", key: "shop_all_hero", type: "json", value: JSON.stringify(p.shopAllHero ?? {}) },
      ]);
      return { message: "Collection page settings saved." };
    }

    case "theme":
    case "theme.save": {
      const entries: { namespace?: string; key: string; type: string; value: string }[] = [
        { namespace: "theme", key: "search_placeholder", type: "single_line_text_field", value: String(p.searchPlaceholder || "") },
        { namespace: "theme", key: "topbar_links", type: "json", value: JSON.stringify(p.topbarLinks ?? []) },
        { namespace: "theme", key: "footer_links", type: "json", value: JSON.stringify(p.footerLinks ?? []) },
        { namespace: "theme", key: "newsletter_text", type: "single_line_text_field", value: String(p.newsletterText || "") },
        { namespace: "theme", key: "mega_banner", type: "json", value: JSON.stringify(p.megaBanner ?? {}) },
        { namespace: "theme", key: "colors", type: "json", value: JSON.stringify(p.colors ?? { preset: "emerald" }) },
        { namespace: "theme", key: "fonts", type: "json", value: JSON.stringify(p.fonts ?? { heading: "playfair", body: "system" }) },
      ];
      if (p.logoUrl) {
        const fileId = await fileFromUrl(String(p.logoUrl), "Store logo");
        entries.push({ namespace: "store", key: "logo", type: "file_reference", value: fileId });
      }
      await setShopMetafields(entries);
      return { message: "Theme settings saved." };
    }

    case "home":
    case "home.save": {
      await setShopMetafields([
        { namespace: "home", key: "promo_banners", type: "json", value: JSON.stringify(p.promoBanners ?? []) },
        { namespace: "home", key: "category_tiles", type: "json", value: JSON.stringify(p.categoryTiles ?? []) },
        { namespace: "home", key: "features", type: "json", value: JSON.stringify(p.features ?? []) },
        { namespace: "home", key: "trust_stats", type: "json", value: JSON.stringify(p.trustStats ?? {}) },
        { namespace: "home", key: "section_visibility", type: "json", value: JSON.stringify(p.sectionVisibility ?? {}) },
        { namespace: "home", key: "section_order", type: "list.single_line_text_field", value: JSON.stringify(p.sectionOrder ?? []) },
      ]);
      return { message: "Home page settings saved." };
    }

    case "blog":
    case "blogSettings":
    case "blogSettings.save": {
      await setShopMetafields([
        { namespace: "blog", key: "categories", type: "list.single_line_text_field", value: JSON.stringify(p.categories ?? []) },
        { namespace: "blog", key: "category_colors", type: "json", value: JSON.stringify(p.categoryColors ?? {}) },
      ]);
      return { message: "Blog settings saved." };
    }

    case "pages":
    case "pages.save": {
      await setShopMetafields([
        { namespace: "pages", key: "about_values", type: "json", value: JSON.stringify(p.aboutValues ?? []) },
        { namespace: "pages", key: "about_stats", type: "json", value: JSON.stringify(p.aboutStats ?? []) },
        { namespace: "pages", key: "contact_cards", type: "json", value: JSON.stringify(p.contactCards ?? []) },
        { namespace: "pages", key: "page_hero_subtitles", type: "json", value: JSON.stringify(p.pageHeroSubtitles ?? {}) },
      ]);
      return { message: "Info page settings saved." };
    }

    default:
      throw new Error(`Unknown settings section: ${section}`);
  }
}

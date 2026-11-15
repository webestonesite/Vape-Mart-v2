import { PageLayoutDTO, SectionDTO, SectionType } from "./cms.types";
import { parseMetaobjectFields } from "@/core/shopify/metaobject-utils";

export function mapRawPageLayoutToDTO(raw: any): PageLayoutDTO | null {
  if (!raw?.layout) return null;

  const title = raw.layout.title?.value || "Page Layout";
  const rawSections: any[] = raw.layout.sections?.references?.nodes || [];

  const sections: SectionDTO[] = [];

  for (const s of rawSections) {
    const type = s.type as SectionType;
    const fields = parseMetaobjectFields(s.fields || []);

    const isActive = fields.getBoolean("is_active", true);
    if (!isActive) continue;

    switch (type) {
      case "section_hero": {
        const desktopImg = fields.getReference<any>("desktop_image")?.image?.url;
        const mobileImg = fields.getReference<any>("mobile_image")?.image?.url;
        sections.push({
          id: s.id,
          type: "section_hero",
          isActive: true,
          heading: fields.getString("heading", "Premium Vaping Experience"),
          subHeading: fields.getString("sub_heading"),
          desktopImageUrl: desktopImg || undefined,
          mobileImageUrl: mobileImg || desktopImg || undefined,
          textAlignment: (fields.getString("text_alignment", "Left") as "Left" | "Center"),
          buttonLabel: fields.getString("button_label", "Shop Now"),
          destinationFields: {
            link_collection: fields.getReference("link_collection"),
            link_product: fields.getReference("link_product"),
            link_page: fields.getReference("link_page"),
            custom_url: { value: fields.getString("custom_url") },
          },
        });
        break;
      }

      case "section_products": {
        const collRef = fields.getReference<any>("collection");
        sections.push({
          id: s.id,
          type: "section_products",
          isActive: true,
          heading: fields.getString("heading", "Featured Products"),
          subHeading: fields.getString("sub_heading"),
          collectionHandle: collRef?.handle || undefined,
          productLimit: fields.getNumber("product_limit", 8),
          showViewAll: fields.getBoolean("show_view_all", true),
        });
        break;
      }

      case "section_promo": {
        const img = fields.getReference<any>("image")?.image?.url;
        sections.push({
          id: s.id,
          type: "section_promo",
          isActive: true,
          badgeText: fields.getString("badge_text"),
          heading: fields.getString("heading", "Special Offer"),
          descriptionJson: fields.getString("description"),
          imageUrl: img || undefined,
          imagePosition: (fields.getString("image_position", "Left") as "Left" | "Right"),
          themeStyle: (fields.getString("theme_style", "Dark") as "Light" | "Dark" | "Accent"),
          buttonLabel: fields.getString("button_label", "Explore Deal"),
          destinationFields: {
            link_collection: fields.getReference("link_collection"),
            link_product: fields.getReference("link_product"),
            link_page: fields.getReference("link_page"),
            custom_url: { value: fields.getString("custom_url") },
          },
        });
        break;
      }

      case "section_categories": {
        const collNodes = fields.getReferences<any>("collections");
        const categories = collNodes.map((c: any) => ({
          title: c.title,
          handle: c.handle,
          imageUrl: c.image?.url,
        }));
        sections.push({
          id: s.id,
          type: "section_categories",
          isActive: true,
          heading: fields.getString("heading", "Explore Categories"),
          categories,
        });
        break;
      }

      case "section_faq": {
        const itemNodes = fields.getReferences<any>("items");
        const items = itemNodes.map((item: any) => {
          const itemFields = parseMetaobjectFields(item.fields || []);
          return {
            question: itemFields.getString("question"),
            answerJson: itemFields.getString("answer"),
          };
        });
        sections.push({
          id: s.id,
          type: "section_faq",
          isActive: true,
          heading: fields.getString("heading", "Frequently Asked Questions"),
          items,
        });
        break;
      }
    }
  }

  return { title, sections };
}


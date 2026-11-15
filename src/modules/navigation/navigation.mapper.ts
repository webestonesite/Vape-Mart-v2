import { LayoutNavigationDTO, NavLinkDTO, SiteSettingsDTO } from "./navigation.types";
import { parseMetaobjectFields } from "@/core/shopify/metaobject-utils";

const DEFAULT_MAIN_MENU: NavLinkDTO[] = [
  { title: "Home", url: "/" },
  { title: "Collections", url: "/collections" },
  { title: "Disposables", url: "/collections/disposable-vapes" },
  { title: "Pod Systems", url: "/collections/pod-systems" },
  { title: "E-Liquids", url: "/collections/e-liquids" },
  { title: "Heets / Terea", url: "/collections/iqos-heets" },
  { title: "Blog", url: "/blog" },
];

const DEFAULT_FOOTER_MENU: NavLinkDTO[] = [
  { title: "About Us", url: "/about" },
  { title: "Contact", url: "/contact" },
  { title: "Privacy Policy", url: "/privacy-policy" },
  { title: "Terms & Conditions", url: "/terms-conditions" },
];

export function mapLayoutResponseToDTO(raw: any): LayoutNavigationDTO {
  const fields = parseMetaobjectFields(raw?.settings?.fields || []);

  const logoRef = fields.getReference<any>("logo");
  const logoUrl = logoRef?.image?.url || "";

  const faviconRef = fields.getReference<any>("favicon");
  const faviconUrl = faviconRef?.image?.url || "";

  const settings: SiteSettingsDTO = {
    storeName: fields.getString("store_name", "Vape Mart UAE"),
    logoUrl: logoUrl || undefined,
    faviconUrl: faviconUrl || undefined,
    showAnnouncement: fields.getBoolean("show_announcement", true),
    announcementText: fields.getString("announcement_text", "Free 2-3 Hours Express Delivery across Dubai on orders over AED 300!"),
    supportPhone: fields.getString("support_phone", "+971 50 000 0000"),
    supportEmail: fields.getString("support_email", "support@vapemart.ae"),
    footerAbout: fields.getString("footer_about", "UAE's premier online vape destination. Authentic disposables, pods, and e-liquids with rapid delivery across Dubai, Abu Dhabi, and all Emirates."),
    copyrightText: fields.getString("copyright_text", `© ${new Date().getFullYear()} Vape Mart UAE. All rights reserved.`),
  };

  const mapMenu = (items: any[]): NavLinkDTO[] => {
    if (!items || !Array.isArray(items) || items.length === 0) return [];
    return items.map((i) => ({
      title: i.title,
      url: i.url || "#",
      items: i.items ? mapMenu(i.items) : undefined,
    }));
  };

  const mainMenu = raw?.mainMenu?.items?.length ? mapMenu(raw.mainMenu.items) : DEFAULT_MAIN_MENU;
  const footerMenu = raw?.footerMenu?.items?.length ? mapMenu(raw.footerMenu.items) : DEFAULT_FOOTER_MENU;

  return {
    settings,
    mainMenu,
    footerMenu,
  };
}


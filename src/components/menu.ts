import { fetchShopifyMenu, type MenuLink } from "@/lib/shopify";
import type { HeaderNavItem } from "./Header";

/* Shopify menu -> Header nav items. Single source of truth for the menu
   mapping: the server header and every page that passes the menu down use
   this, so the arrangement is identical everywhere. No baked-in fallback
   menu anywhere: when the menu fetch fails the nav renders empty. */
export function mapMenuToNavItems(items: MenuLink[]): HeaderNavItem[] {
  return items.map((it) => ({
    label: it.title,
    href: it.url || "#",
    hasDropdown: Array.isArray(it.children) && it.children.length > 0,
    columns: (it.children || []).map((col) => ({
      heading: col.title,
      items: (col.children || []).map((link) => ({
        title: link.title,
        href: link.url || "#",
      })),
    })),
  }));
}

export async function fetchNavMenu(): Promise<HeaderNavItem[]> {
  try {
    return mapMenuToNavItems(await fetchShopifyMenu());
  } catch {
    return [];
  }
}

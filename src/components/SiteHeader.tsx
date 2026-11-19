import { fetchNavMenu } from "./menu";
import { Header } from "./Header";

/* Server-rendered header: the nav comes straight from the Shopify menu
   (vape-mart-main-menu) at render time. No baked-in fallback menu and no
   client-side swap — first paint already shows the real menu, exactly as
   arranged in Shopify. */
export async function SiteHeader() {
  const navItems = await fetchNavMenu();
  return <Header initialNavItems={navItems} />;
}

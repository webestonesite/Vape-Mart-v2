# Vape Mart UAE — Ultra-Fast Headless E-Commerce Storefront

Next.js 15 (App Router, Turbopack, TypeScript, Tailwind CSS) + Shopify Storefront & Admin GraphQL API (`2026-10`).  
Hosted on **Vercel Free (Hobby) Plan** with strict **Zero-Waste Edge Architecture** ($0/month hosting cost).

---

## 🚀 Key Features

1. **Zero Hardcoded Content**: 100% of banners, products, categories, menus, FAQs, and layout settings are managed via Shopify Metaobjects & the Admin Panel without redeploying.
2. **Shopify CDN Direct Image Loader**: All product and marketing images are transformed directly by Shopify's CDN (`format=webp&width=X`), bypassing Vercel's 1,000 image limit completely.
3. **5-Layer Fault Tolerance**:
   - `safeShopifyFetch` with 5000ms AbortController timeout & non-throwing `SafeResult<T>`.
   - Client-side `<SectionErrorBoundary>` isolating broken CMS sections.
   - `<SafeImage />` with automatic SVG fallback on broken/404 image URLs.
   - Dynamic route error boundaries (`error.tsx`).
4. **Instant Edge Cache Invalidation (`/api/revalidate`)**:
   - Webhook HMAC signature verification (`x-shopify-hmac-sha256`).
   - Surgical tag invalidation (`products`, `collections`, `cms-content`, `home`, `sitemap`).
   - 1-click manual sync: `/api/revalidate?secret=<REVALIDATE_SECRET>&tag=all`.
5. **Technical SEO Engine**: Dynamic `sitemap.xml` and `robots.txt` indexing all active Shopify products, collections, and pages.

---

## 🛠️ 1-Click Shopify CMS Bootstrap

To auto-provision all 8 Metaobject definitions (`site_settings`, `faq_item`, `section_hero`, `section_products`, `section_promo`, `section_categories`, `section_faq`, `page_layout`) in your Shopify store:

```bash
node scripts/bootstrap-shopify-cms.mjs
```

---

## 📡 Webhook Configuration (Shopify Admin)

To enable zero-redeploy live updates:
1. In Shopify Admin, navigate to **Settings → Notifications → Webhooks**.
2. Click **Create Webhook** (Format: `JSON`, URL: `https://yourdomain.com/api/revalidate`) for:
   - `Product creation`, `Product update`, `Product deletion`
   - `Collection creation`, `Collection update`, `Collection deletion`
   - `Metaobject entry creation`, `Metaobject entry update`, `Metaobject entry deletion`
3. Copy the **Webhook signing secret** at the bottom of the page and paste it into your `.env.local` / Vercel Environment Variables as `SHOPIFY_WEBHOOK_SECRET`.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run full TypeScript validation
npx tsc --noEmit

# Production build
npm run build
```

# VAPE MART UAE — MASTER IMPLEMENTATION TRACKER SHEET

**Execution Strategy:** Team Mode (Principal Architect, Infrastructure Specialist, Frontend Lead, QA/Verification Lead)  
**Total Phases:** 5 Phases | **Target:** Zero Downtime, 100% Dynamic CMS, Vercel Free Plan Zero-Waste Edge Architecture

---

## TEAM ROLES & RESPONSIBILITIES
- 🏛️ **Principal Architect (Lead)**: System boundaries, DTO schemas, Metaobject schema alignment, contract enforcement.
- ⚡ **Infra & Edge Specialist**: Shopify CDN proxy bypass, Vercel Edge caching, HMAC webhook revalidator, sitemap/robots.
- 🎨 **Staff Frontend Engineer**: Safe UI primitives (`SafeImage`, `SmartLink`, `ShopifyRichText`), ProductCard, Cart Drawer, Live PDP island.
- 🛡️ **QA & Verification Lead**: TypeScript compiler (`tsc --noEmit`), build analysis, zero-regression verification, CLS & mobile audits.

---

## IMPLEMENTATION PHASES CHECKLIST

### PHASE 1: VERCEL ZERO-WASTE CORE & SEO ENGINE
*Goal: Bypass Vercel 1,000 image limit completely and wire search engine indexing.*

| # | Task | Owner | Target File | Status |
|---|---|---|---|:---:|
| 1.1 | Custom Shopify CDN Image Loader (direct `cdn.shopify.com?width=X&format=webp`) | ⚡ Infra | `src/core/shopify/image-loader.ts` | [x] |
| 1.2 | Hook custom loader into Next.js config | ⚡ Infra | `next.config.ts` | [x] |
| 1.3 | Strict runtime environment validator | 🏛️ Architect | `src/core/config/env.ts` | [x] |
| 1.4 | Dynamic SEO Robots directive file | ⚡ Infra | `src/app/robots.ts` | [x] |
| 1.5 | Dynamic XML Sitemap generator (products, collections, pages) | ⚡ Infra | `src/app/sitemap.ts` | [x] |
| 1.6 | Step Verification (`tsc --noEmit` + build check) | 🛡️ QA | Terminal | [x] |

---

### PHASE 2: 5-LAYER FAULT TOLERANCE & SAFE PRIMITIVES
*Goal: Ensure no broken image, malformed link, timeout, or CMS syntax error ever crashes the site.*

| # | Task | Owner | Target File | Status |
|---|---|---|---|:---:|
| 2.1 | Non-throwing `safeShopifyFetch` with 5000ms AbortController timeout & `SafeResult<T>` | 🏛️ Architect | `src/core/shopify/client.ts` | [x] |
| 2.2 | Single source of truth for GraphQL fragments | 🏛️ Architect | `src/core/shopify/fragments.ts` | [x] |
| 2.3 | Typed Metaobject field extractor (`parseMetaobjectFields`) | 🏛️ Architect | `src/core/shopify/metaobject-utils.ts` | [x] |
| 2.4 | Currency (AED), date, and string formatting utilities | 🎨 Frontend | `src/shared/utils/formatters.ts` | [x] |
| 2.5 | `<SafeImage />` component with auto-fallback to inline SVG placeholder | 🎨 Frontend | `src/shared/components/SafeImage.tsx` | [x] |
| 2.6 | `<SmartLink />` polymorphic link resolver (Collection/Product/Page/Custom URL) | 🎨 Frontend | `src/shared/components/SmartLink.tsx` | [x] |
| 2.7 | `<ShopifyRichText />` safe recursive AST renderer | 🎨 Frontend | `src/shared/components/ShopifyRichText.tsx` | [x] |
| 2.8 | Step Verification (`tsc --noEmit`) | 🛡️ QA | Terminal | [x] |

---

### PHASE 3: DOMAIN MODULES & CLIENT-SIDE CART ENGINE
*Goal: Domain-driven catalog, zero-server cart mutations, and dynamic CMS sections.*

| # | Task | Owner | Target File | Status |
|---|---|---|---|:---:|
| 3.1 | Catalog queries, types, and flat DTO mapper | 🏛️ Architect | `src/modules/catalog/` | [x] |
| 3.2 | Canonical `<ProductCard />` (React.memo, WebP CDN image, badge) | 🎨 Frontend | `src/modules/catalog/components/ProductCard.tsx` | [x] |
| 3.3 | Live PDP Island `<LiveProductActions />` (client variant & stock sync) | 🎨 Frontend | `src/modules/catalog/components/LiveProductActions.tsx` | [x] |
| 3.4 | 100% Client-Side Cart Service (Shopify Storefront direct mutations) | ⚡ Infra | `src/modules/cart/cart.service.ts` | [x] |
| 3.5 | `<CartProvider />` with optimistic UI and auto-healing expired carts | 🎨 Frontend | `src/modules/cart/CartProvider.tsx` | [x] |
| 3.6 | Sliding `<CartDrawer />` UI with instant line updates & checkout button | 🎨 Frontend | `src/modules/cart/components/CartDrawer.tsx` | [x] |
| 3.7 | Navigation domain (Header, AnnouncementBar, Footer mappers & components) | 🎨 Frontend | `src/modules/navigation/` | [x] |
| 3.8 | CMS dynamic section components (`Hero`, `Products`, `Promo`, `Categories`, `Faq`) | 🎨 Frontend | `src/modules/cms/components/` | [x] |
| 3.9 | `<SectionRenderer />` with per-section `<SectionErrorBoundary>` isolation | 🏛️ Architect | `src/modules/cms/components/SectionRenderer.tsx` | [x] |
| 3.10 | Step Verification (`tsc --noEmit`) | 🛡️ QA | Terminal | [x] |

---

### PHASE 4: SURGICAL EDGE REVALIDATION & APP ROUTER INTEGRATION
*Goal: Zero-redeploy live content sync and edge-cached dynamic routes.*

| # | Task | Owner | Target File | Status |
|---|---|---|---|:---:|
| 4.1 | Dual-Mode `/api/revalidate` route (HMAC webhook verification + secret token) | ⚡ Infra | `src/app/api/revalidate/route.ts` | [x] |
| 4.2 | Root layout integration (`layout.tsx`) with batched global layout fetch & fallbacks | 🏛️ Architect | `src/app/layout.tsx` | [x] |
| 4.3 | Dynamic Homepage (`src/app/page.tsx`) connecting CMS builder + existing 3D Arc Dial | 🎨 Frontend | `src/app/page.tsx` | [x] |
| 4.4 | Edge-cached PDP (`products/[handle]/page.tsx`) with dynamic JSON-LD & live island | 🎨 Frontend | `src/app/products/[handle]/page.tsx` | [x] |
| 4.5 | Edge-cached Collection page (`collections/[handle]/page.tsx`) + client filters | 🎨 Frontend | `src/app/collections/[handle]/page.tsx` | [x] |
| 4.6 | Dynamic CMS content pages (`pages/[handle]/page.tsx` for About, Contact, Policies) | 🎨 Frontend | `src/app/pages/[handle]/page.tsx` | [x] |
| 4.7 | Route recovery boundaries (`error.tsx` on root, products, and collections) | 🛡️ QA | `src/app/**/error.tsx` | [x] |
| 4.8 | Step Verification (`tsc --noEmit` & `npm run build`) | 🛡️ QA | Terminal | [x] |

---

### PHASE 5: 1-CLICK METAOBJECT BOOTSTRAP SCRIPT & FINAL AUDIT
*Goal: Standalone Admin API deployment script and end-to-end production verification.*

| # | Task | Owner | Target File | Status |
|---|---|---|---|:---:|
| 5.1 | Idempotent Node script `bootstrap-shopify-cms.mjs` creating all 8 Metaobjects | ⚡ Infra | `scripts/bootstrap-shopify-cms.mjs` | [x] |
| 5.2 | Update `README.md` with 1-click bootstrap and webhook setup instructions | 🏛️ Architect | `README.md` | [x] |
| 5.3 | Final Full-App Typecheck (`npx tsc --noEmit`) -> 0 errors | 🛡️ QA | Terminal | [x] |
| 5.4 | Final Production Build (`npm run build`) -> All static edge (`○`/`●`), 0 dynamic SSR | 🛡️ QA | Terminal | [x] |
| 5.5 | Final Verification & Delivery Handover | 🛡️ QA | Report | [x] |

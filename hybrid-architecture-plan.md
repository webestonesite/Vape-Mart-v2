# EXHAUSTIVE MASTER HYBRID ARCHITECTURE & EXECUTION PLAN
**Project:** Vape Mart UAE — Ultra-Fast Enterprise Headless Storefront  
**Stack:** Next.js 15 (App Router, TypeScript, Tailwind CSS) + Shopify Storefront & Admin GraphQL API (`2026-10`)  
**Hosting Target:** Vercel Free (Hobby) Plan — Zero-Waste Edge Architecture ($0/month)  
**CMS Model:** Hybrid Dual-Engine (Shopify Metaobjects Drag-and-Drop Page Builder + Existing Next.js Admin/Metafield Support)  

---

## 1. VERCEL FREE PLAN ZERO-WASTE GUARDRAILS (STRICT ENFORCEMENT)

Every file across the repository must follow these rules to guarantee **0 Fluid CPU waste**, **0 Image Optimization quota burnout**, and **near-zero ISR writes**:

1. **Zero Hardcoded Content**:
   - Zero marketing copy, hero banners, announcement texts, header menus, footer columns, trust badges, FAQs, or SEO tags hardcoded in JSX/TSX.
   - 100% of content served dynamically via Shopify (`Metaobjects`, `Menus`, `Pages`, `Collections`, `Products`) or database fallback.
2. **Zero SSR Bailouts or Time-Based ISR in Server Components**:
   - **NEVER** use `export const revalidate = <number>` (time-based revalidation drains Vercel ISR write quota).
   - **NEVER** use `cache: 'no-store'` inside Server Components.
   - **NEVER** call `cookies()`, `headers()`, or read `searchParams` inside `layout.tsx` or any `page.tsx` Server Component (this bails out to dynamic SSR `ƒ` on every visitor and exhausts Fluid CPU).
   - Dynamic states (cart drawer, variant selection, live stock checks, collection filters/sorting) run strictly in Client Component islands.
3. **Indefinite Edge Caching + Surgical Tag Revalidation**:
   - Every server-side Shopify GraphQL query must use `cache: 'force-cache'` with `next: { tags: [...] }`.
   - Pages stay cached indefinitely at Vercel's global edge network (0 ISR writes, 0 CPU per request) until a Shopify Webhook triggers `/api/revalidate` and purges only the modified tag.
4. **Bypass Vercel Image Optimizer (1,000 monthly limit bypass)**:
   - Custom Next.js image loader redirects all image requests directly to `cdn.shopify.com` with `format=webp` and `width=X`. Consumes **0 Vercel image credits** and **0 CPU**.
5. **Zero-Server Cart & Real-Time Inventory Island**:
   - **NEVER** create `/api/cart` routes or Next.js Server Actions for cart operations.
   - Browser interacts directly with Shopify Storefront API for `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`, and live stock queries.

---

## 2. CLIENT-FRIENDLY SHOPIFY CMS & METAOBJECT DATA ARCHITECTURE
*(Compliant with Shopify Admin GraphQL API `2026-10`)*

Designed so non-technical store managers never type raw URLs, HTML tags, or CSS classes. Uses visual pickers (`file_reference`, `collection_reference`, `product_reference`, `page_reference`), WYSIWYG (`rich_text_field`), and boolean toggles (`is_active`).

### A. Global & Reusable Metaobjects

#### 1. `site_settings` *(Single entry with handle `global-settings`)*
Controls global store branding, announcement bar, and layout info:
- `store_name` (`single_line_text_field`): Brand title (e.g., "Vape Mart UAE")
- `logo` (`file_reference`): Store header logo (images only)
- `favicon` (`file_reference`): Store favicon (images only)
- `show_announcement` (`boolean`): Toggle top notification bar
- `announcement_text` (`single_line_text_field`): Promo message
- `announcement_collection` (`collection_reference`): Linked campaign collection
- `support_phone` (`single_line_text_field`): Support WhatsApp/Phone (e.g., "+971 50 000 0000")
- `support_email` (`single_line_text_field`): Support email
- `footer_about` (`rich_text_field`): Brand description in footer
- `copyright_text` (`single_line_text_field`): Footer copyright disclaimer

#### 2. `faq_item` *(Reusable FAQ items)*
- `question` (`single_line_text_field`): Accordion question title
- `answer` (`rich_text_field`): Rich text formatted answer

---

### B. Drag-and-Drop Page Section Metaobjects

#### 3. `section_hero` *(Hero Slider / Banner Block)*
- `internal_title` (`single_line_text_field`): Admin identifier (e.g., "Eid Campaign Hero")
- `is_active` (`boolean`): Show/hide toggle without deleting
- `heading` (`single_line_text_field`): Main bold headline
- `sub_heading` (`multi_line_text_field`): Supporting description
- `desktop_image` (`file_reference`): Desktop high-res banner image
- `mobile_image` (`file_reference`): Mobile-optimized portrait banner
- `text_alignment` (`single_line_text_field`): Preset choices `["Left", "Center"]`
- `button_label` (`single_line_text_field`): CTA button text
- `link_collection` (`collection_reference`): Target collection picker
- `link_product` (`product_reference`): Target product picker
- `link_page` (`page_reference`): Target content page picker
- `custom_url` (`single_line_text_field`): External fallback URL

#### 4. `section_products` *(Featured Products Carousel / Grid)*
- `is_active` (`boolean`): Show/hide toggle
- `heading` (`single_line_text_field`): Section headline (e.g., "Best Selling Vapes")
- `sub_heading` (`single_line_text_field`): Subtitle
- `collection` (`collection_reference`): Shopify collection picker
- `product_limit` (`number_integer`): Max products to render (default `8`)
- `show_view_all` (`boolean`): Toggle "View All" link

#### 5. `section_promo` *(Split Banner / Feature Highlight)*
- `is_active` (`boolean`): Show/hide toggle
- `badge_text` (`single_line_text_field`): Badge pill (e.g., "LIMITED EDITION")
- `heading` (`single_line_text_field`): Promo headline
- `description` (`rich_text_field`): Rich text promo description
- `image` (`file_reference`): Promo graphic
- `image_position` (`single_line_text_field`): Preset choices `["Left", "Right"]`
- `theme_style` (`single_line_text_field`): Preset choices `["Light", "Dark", "Accent"]`
- `button_label` (`single_line_text_field`): CTA text
- `link_collection` (`collection_reference`)
- `link_product` (`product_reference`)
- `link_page` (`page_reference`)
- `custom_url` (`single_line_text_field`)

#### 6. `section_categories` *(Visual Category Grid)*
- `is_active` (`boolean`): Show/hide toggle
- `heading` (`single_line_text_field`): Headline (e.g., "Shop by Category")
- `collections` (`list.collection_reference`): Multi-select collections to display

#### 7. `section_faq` *(FAQ Accordion Section)*
- `is_active` (`boolean`): Show/hide toggle
- `heading` (`single_line_text_field`): Section title (e.g., "Frequently Asked Questions")
- `items` (`list.metaobject_reference`): Validated to `faq_item` definition ID

---

### C. Master Page Builder Metaobject

#### 8. `page_layout` *(Starter entry: handle `home-page`)*
- `title` (`single_line_text_field`): Page title (e.g., "Homepage Layout")
- `sections` (`list.metaobject_reference`): Validated against definition IDs of `section_hero`, `section_products`, `section_promo`, `section_categories`, `section_faq`.
- **WordPress-style Drag & Drop**: Store owners reorder sections directly in Shopify Admin (`Content → Metaobjects → Page Layout → Home Page`) and click Save.

### D. Native Menus & Static CMS Pages
- **Header Navigation**: Native Shopify `menu(handle: "main-menu")` with multi-level nesting.
- **Footer Navigation**: Native Shopify `menu(handle: "footer-menu")` with column headers and links.
- **Dynamic Content Pages**: Shopify `page(handle: $handle)` at `/pages/[handle]` for About Us, Terms, Privacy Policy, Delivery Policy.

---

## 3. ENTERPRISE LAYERED DIRECTORY ARCHITECTURE

Strict separation into 4 distinct layers:

```text
├── scripts/
│   └── bootstrap-shopify-cms.mjs         # One-click Admin API script provisioning all 8 Metaobjects
├── src/
│   ├── core/                             # LAYER 1: Core Engine & Infrastructure (Zero UI coupling)
│   │   ├── config/
│   │   │   └── env.ts                    # Strict runtime environment variable validator
│   │   └── shopify/
│   │       ├── client.ts                 # Safe fetch wrapper + AbortController (5s) + force-cache
│   │       ├── image-loader.ts           # Custom Shopify CDN WebP proxy bypass
│   │       ├── fragments.ts              # Canonical reusable GraphQL fragments
│   │       └── metaobject-utils.ts       # Typed metaobject field extractor & DTO builder
│   │
│   ├── modules/                          # LAYER 2: Self-Contained Domain Modules
│   │   ├── catalog/                      # Products, Collections, Variants, Live Stock
│   │   │   ├── catalog.queries.ts        # Storefront GraphQL queries
│   │   │   ├── catalog.mapper.ts         # Flattens raw edges/nodes into typed DTOs
│   │   │   ├── catalog.types.ts          # Catalog interfaces
│   │   │   └── components/
│   │   │       ├── ProductCard.tsx       # Canonical product card (React.memo)
│   │   │       ├── ProductGrid.tsx       # Responsive product grid
│   │   │       └── LiveProductActions.tsx# Client island: live variant stock + Add to Cart
│   │   ├── cms/                          # Dynamic CMS Page Builder
│   │   │   ├── cms.queries.ts            # Batched Metaobject queries
│   │   │   ├── cms.mapper.ts             # Normalizes sections into typed DTOs
│   │   │   ├── cms.types.ts              # CMS interfaces
│   │   │   └── components/
│   │   │       ├── SectionRenderer.tsx   # Maps sections dynamically inside Error Boundaries
│   │   │       ├── SectionHero.tsx
│   │   │       ├── SectionProducts.tsx
│   │   │       ├── SectionPromo.tsx
│   │   │       ├── SectionCategories.tsx
│   │   │       └── SectionFaq.tsx
│   │   ├── cart/                         # 100% Client-Side Storefront Cart Engine
│   │   │   ├── cart.service.ts           # Direct browser-to-Shopify GraphQL cart mutations
│   │   │   ├── CartProvider.tsx          # React Context + localStorage persistence
│   │   │   └── components/
│   │   │       └── CartDrawer.tsx        # Slide-over cart drawer with optimistic updates
│   │   ├── navigation/                   # Global Header, Announcement Bar, Footer
│   │   │   ├── navigation.queries.ts
│   │   │   ├── navigation.mapper.ts
│   │   │   └── components/
│   │   │       ├── AnnouncementBar.tsx
│   │   │       ├── Header.tsx
│   │   │       └── Footer.tsx
│   │   └── seo/                          # Technical SEO, JSON-LD, Sitemap
│   │       └── seo.utils.ts              # Structured data builders
│   │
│   ├── shared/                           # LAYER 3: Reusable Safe Primitives
│   │   ├── components/
│   │   │   ├── SectionErrorBoundary.tsx  # Section-level blast radius containment
│   │   │   ├── SafeImage.tsx             # CDN WebP + inline SVG fallback on broken URL
│   │   │   ├── SmartLink.tsx             # Polymorphic CTA resolver (Collection/Product/Page/URL)
│   │   │   └── ShopifyRichText.tsx       # Safe recursive Shopify Rich Text JSON AST renderer
│   │   └── utils/
│   │       └── formatters.ts             # AED Currency, dates, clean text formatters
│   │
│   └── app/                              # LAYER 4: Thin Next.js App Router (Routing only)
│       ├── api/
│       │   └── revalidate/
│       │       └── route.ts              # HMAC-verified webhook + manual sync fallback
│       ├── collections/
│       │   └── [handle]/
│       │       ├── page.tsx              # Edge-cached collection page + client filters
│       │       └── error.tsx             # Granular collection error recovery
│       ├── products/
│       │   └── [handle]/
│       │       ├── page.tsx              # Edge-cached PDP + JSON-LD
│       │       └── error.tsx             # Granular product error recovery
│       ├── pages/
│       │   └── [handle]/
│       │       └── page.tsx              # Dynamic Shopify CMS pages (About, Terms, etc.)
│       ├── layout.tsx                    # Root layout with batched global navigation
│       ├── page.tsx                      # Root homepage (CMS builder or hybrid fallback)
│       ├── error.tsx                     # Global error boundary
│       ├── not-found.tsx                 # 404 page
│       ├── robots.ts                     # Bot crawling directives
│       └── sitemap.ts                    # Edge-cached dynamic XML sitemap
└── next.config.ts                        # Image loader & remotePatterns config
```

---

## 4. 5-LAYER FAULT TOLERANCE ARCHITECTURE

To ensure the storefront **never throws a 500 White Screen**:

1. **Layer 1: Non-Throwing Safe GraphQL Client (`safeShopifyFetch`)**:
   - 5000ms AbortController timeout.
   - Returns discriminated union `SafeResult<T>` (`{ ok: true, data: T } | { ok: false, error: string }`).
   - If Shopify times out or errors, returns `{ ok: false }` gracefully; server components render fallback content instead of crashing.
2. **Layer 2: Section Error Boundary (`<SectionErrorBoundary>`)**:
   - Every dynamic section block in `SectionRenderer.tsx` and `page.tsx` is wrapped in its own boundary.
   - If one section throws due to corrupt CMS data, only that section collapses to `null` while Hero, Products, Reviews, and Cart continue functioning normally.
3. **Layer 3: Layout & Navigation Fallbacks**:
   - In `layout.tsx`, if `site_settings` or menus fail to load, default navigation DTO renders (`Vape Mart UAE`, default links) so the page shell remains intact.
4. **Layer 4: Safe Media & Rich Text Primitives**:
   - `<SafeImage />`: If an image URL is missing, null, or returns 404, swaps to an inline SVG placeholder without layout shift (CLS = 0).
   - `<ShopifyRichText />`: Safe recursive parser wrapped in `try/catch`. If Shopify rich text JSON is invalid, renders plain text fallback.
5. **Layer 5: Granular Route Recovery (`error.tsx`)**:
   - Granular `error.tsx` handlers on `/products/[handle]`, `/collections/[handle]`, and root `/` offering a "Try Again" recovery button while keeping the Header and Footer visible.

---

## 5. DUAL-MODE INSTANT REVALIDATION (`/api/revalidate`)

### POST Handler (Shopify Webhooks)
- Validates Shopify webhook HMAC signature:
  `crypto.createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET).update(rawBody, 'utf8').digest('base64')`
- Uses `crypto.timingSafeEqual` to prevent timing attacks.
- Routes topic headers to surgical Next.js cache tags:
  - `products/*` → `revalidateTag('products')`, `revalidateTag('sitemap')`
  - `collections/*` → `revalidateTag('collections')`, `revalidateTag('sitemap')`
  - `metaobjects/*` → `revalidateTag('cms-content')`
  - `pages/*` → `revalidateTag('pages')`, `revalidateTag('sitemap')`
  - `menus/*` → `revalidateTag('menus')`

### GET Handler (Manual Emergency Sync)
- Accessible via `/api/revalidate?secret=<REVALIDATE_SECRET>&tag=all` (or specific tag e.g. `cms-content`).
- Allows immediate manual cache clear without waiting for webhooks.

---

## 6. CLIENT-SIDE CART & LIVE PDP INVENTORY ENGINE

1. **Zero Server Load**:
   - Client creates and manages cart directly with Shopify Storefront API (`cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`).
2. **Optimistic UI Updates**:
   - Drawer opens immediately and shows updated quantity/price before API confirms.
3. **Local Storage Persistence & Auto-Heal**:
   - `cartId` stored in `localStorage`. If Shopify returns `cart: null` (cart expired after 7-14 days), the client catches it, clears `localStorage`, and provisions a new cart instantly on the next add-to-cart click without user friction.
4. **Live PDP Variant Stock Island (`LiveProductActions.tsx`)**:
   - The product page HTML is 100% static edge-cached (`●`).
   - On page mount, `LiveProductActions` runs a lightweight client query for live variant prices and `availableForSale` stock count, ensuring out-of-stock items can never be purchased while keeping Vercel server usage at 0.

---

## 7. AUTOMATED 1-CLICK PROVISIONING SCRIPT (`scripts/bootstrap-shopify-cms.mjs`)

Standalone Node.js script using Admin GraphQL API (`2026-10`) to automatically:
1. Connect via `X-Shopify-Access-Token: ${SHOPIFY_ADMIN_ACCESS_TOKEN}`.
2. Call `metaobjectDefinitionCreate` with `access: { storefront: "PUBLIC_READ" }` for all 7 component definitions (`site_settings`, `faq_item`, `section_hero`, `section_products`, `section_promo`, `section_categories`, `section_faq`).
3. Create `page_layout` definition with `validations` binding the exact definition IDs of the 5 section types.
4. Create default entries for `global-settings` and `home-page` if not already present.
5. Idempotent: Can be run multiple times safely without duplicate definition errors.

---

## 8. STEP-BY-STEP IMPLEMENTATION ROADMAP

### Phase 1: Core Infrastructure & Vercel Zero-Waste Engine
- [ ] Configure `src/core/shopify/image-loader.ts` to redirect image sizing directly to `cdn.shopify.com`.
- [ ] Connect custom loader in `next.config.ts`.
- [ ] Implement `src/core/config/env.ts` with strict schema validation.
- [ ] Implement `src/core/shopify/client.ts` (`safeShopifyFetch` with 5s timeout & AbortController).
- [ ] Create `src/app/robots.ts` and dynamic `src/app/sitemap.ts`.

### Phase 2: Safe UI Primitives & Modular Foundations
- [ ] Create `src/shared/components/SafeImage.tsx` with inline SVG fallback.
- [ ] Create `src/shared/components/SmartLink.tsx` for polymorphic CTA resolution.
- [ ] Create `src/shared/components/ShopifyRichText.tsx` recursive AST renderer.
- [ ] Create `src/shared/utils/formatters.ts` (AED currency & formatting).
- [ ] Create `src/core/shopify/fragments.ts` and `src/core/shopify/metaobject-utils.ts`.

### Phase 3: Domain Modules (Catalog, Cart, CMS, Navigation)
- [ ] Catalog domain: `catalog.queries.ts`, `catalog.mapper.ts`, `ProductCard.tsx` (React.memo), `LiveProductActions.tsx`.
- [ ] Cart domain: `cart.service.ts`, `CartProvider.tsx`, `CartDrawer.tsx` (100% client-side Storefront mutations).
- [ ] CMS domain: `cms.queries.ts`, `cms.mapper.ts`, `SectionRenderer.tsx`, section components (`SectionHero`, `SectionProducts`, `SectionPromo`, `SectionCategories`, `SectionFaq`).
- [ ] Navigation domain: `navigation.queries.ts`, `navigation.mapper.ts`, `AnnouncementBar.tsx`, `Header.tsx`, `Footer.tsx`.

### Phase 4: App Router Integration & Surgical Edge Revalidation
- [ ] Create `src/app/api/revalidate/route.ts` (HMAC webhook verification + GET manual token sync).
- [ ] Refactor `src/app/layout.tsx` to use batched global layout queries and safe fallbacks.
- [ ] Connect `src/app/products/[handle]/page.tsx` with dynamic JSON-LD and LiveProductActions.
- [ ] Connect `src/app/collections/[handle]/page.tsx` with edge cache and client-side filtering.
- [ ] Add route error boundaries (`error.tsx`) on root, products, and collections.

### Phase 5: One-Click Metaobject Bootstrap Script & Verification
- [ ] Build `scripts/bootstrap-shopify-cms.mjs` for automated Shopify Admin metaobject provisioning.
- [ ] Execute `npx tsc --noEmit` to verify 0 TypeScript errors.
- [ ] Execute `npm run build` to verify all routes compile as static edge (`○` or `●`) with zero dynamic SSR (`ƒ`).

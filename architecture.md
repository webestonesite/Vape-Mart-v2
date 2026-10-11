# Architecture Specification - Vape Mart UAE

## Tech Stack & Runtime
- **Framework**: Next.js 16.3.6 (Turbopack, App Router)
- **Language**: TypeScript 5+ (Strict Type-Safety, Zero `any` or `dynamic`)
- **Styling**: Tailwind CSS v4 + Global CSS tokens (`globals.css`)
- **Animations**: Framer Motion 13+
- **Icons**: Lucide React (domain-specific icons only, zero generic sparkles)
- **Smooth Scroll**: Lenis Scroll integration

## Directory & Route Structure
```
src/
├── app/
│   ├── layout.tsx                     # Root layout, Google Fonts (Playfair, Outfit, Inter)
│   ├── page.tsx                       # Homepage (Hero, Best Selling, Flavor Lab, Heets, etc.)
│   ├── product/[slug]/page.tsx        # Single Product Page (RSC + JSON-LD)
│   ├── products/[slug]/page.tsx       # Alias route for single products
│   ├── collections/page.tsx           # All collections catalog page
│   ├── collections/[slug]/page.tsx    # Category specific collection page
│   ├── collection/[slug]/page.tsx     # Alias route for categories
│   ├── admin/                         # Theme customizer admin
│   ├── api/admin/theme/route.ts       # Theme settings API
│   └── globals.css                    # Design tokens & animations
├── components/
│   ├── Header.tsx                     # Reusable SiteHeader with ticker, mega menus, search
│   ├── Footer.tsx                     # Reusable SiteFooter with UAE 21+ compliance, links
│   ├── MobileBottomNav.tsx            # Floating mobile bottom navigation bar
│   ├── CartDrawer.tsx                 # Reusable 3-step Cart Drawer (Cart -> Express Checkout -> Order Confirmed)
│   ├── product/
│   │   └── ProductDetailView.tsx      # Single Product client presentation engine (12 sections + Jump Bar + Sticky Bar)
│   └── collection/
│       └── CollectionPageView.tsx     # Collection client catalog & filter engine (12 sections + Quick View + Chips)
├── data/
│   ├── products.ts                    # Strongly-typed catalog repository & query helpers
│   └── theme-published.json           # Dynamic theme customizer configuration
└── types/
    └── product.ts                     # Strict TypeScript interfaces
```

## Data Flow & Boundaries
- **Server Components (RSC)**: Handle route resolution, `generateMetadata`, JSON-LD structured data generation (`Product`, `BreadcrumbList`, `CollectionPage`), and data hydration.
- **Client Components ('use client')**: Isolated to interactive presentation layers (`ProductDetailView`, `CollectionPageView`, `Header`). Hydration guarded against window/localStorage leaks.

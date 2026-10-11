# SEO and Performance Specification - Vape Mart UAE

## Technical SEO Architecture
- **Semantic HTML**: Valid structural tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) with strict single `<h1>` hierarchy per route.
- **Dynamic Meta Tags**: Dynamic `title`, `description`, `canonical`, and OpenGraph images generated via `generateMetadata` in Server Components.
- **Structured Data (JSON-LD)**:
  - `Product` schema with `Offer`, `AggregateRating`, and `Brand`.
  - `BreadcrumbList` schema with explicit hierarchical links.
  - `CollectionPage` schema with category descriptions.
- **Robots Directives**: Standard indexing enabled for collection and product routes.

## Performance & Core Web Vitals (Target: 92+ Mobile PageSpeed)
- **Cumulative Layout Shift (CLS < 0.1)**: Explicit dimensions and reserved aspect-ratio boxes for all product images (`aspect-square`, `object-contain`).
- **Largest Contentful Paint (LCP)**: Primary above-the-fold product showcase images flagged with `priority`.
- **Interaction to Next Paint (INP)**: React 19 synthetic event optimizations, unblocking main thread during filter facet toggles.
- **Bundle Optimization**: Tree-shaken icons from `lucide-react`, dynamic font loading via `next/font/google`.

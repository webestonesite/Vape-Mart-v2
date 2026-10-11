# Error Handling Specification - Vape Mart UAE

## Route Fallbacks & 404 Resolution
- **Dynamic Product Routing**: If an unknown slug is requested, the system safely triggers Next.js `notFound()` or falls back to valid catalog entries without unhandled runtime exceptions.
- **Client Fallback States**:
  - Filter empty states display an informative recovery banner with a "Reset All Filters" trigger.
  - Image failure fallbacks to primary WebP/PNG placeholders.
- **Hydration Safety**:
  - Browser-specific objects (`window`, `localStorage`, `document`) gated behind `typeof window !== 'undefined'` and `useEffect` mounted flags.

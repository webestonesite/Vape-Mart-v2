# Design System Specification - Vape Mart UAE

## Color Grading & Design Tokens
- **Midnight Emerald Green**: `#064e3b` (Primary brand accent, header, CTAs)
- **Deep Forest Green**: `#022c22`, `#043e2e` (Footer, luxury dark cards, gradients)
- **Luxury Warm Gold / Amber**: `#f59e0b`, `#d97706`, `#fbbf24` (Badges, accents, highlights, star ratings)
- **Ultra Clean Surface**: `#ffffff`, `#f8fafc`, `border-neutral-200/80` (Clean Apple-like product stages)
- **Muted Green Accent**: `#a7f3d0` (Soft text & borders)

## Typography Hierarchy
- **Luxury Headings**: `Playfair Display` (`font-luxury`, serif) with letter-spacing `-0.015em`
- **Sub-Badges & Series**: `Cinzel` (`font-cinzel`, serif uppercase) with tracking `[0.2em]`
- **Body & Hardware Specs**: `Poppins` / `Inter` / `Outfit` for readability and numerical clarity

## Section Architecture
### Single Product Page (12 Sections + In-Page Nav)
- **Ergonomic Sticky Jump Bar**: Fixed sub-navigation (`[Overview] [Hardware Specs] [Flavor Profile] [Engineering] [Authenticity] [UAE Delivery] [Reviews] [FAQs]`) with real-time ScrollSpy and persistent price/buy CTA.
- **Floating Purchase Bar**: Slide-up sticky buy bar on scroll with `z-50`, safe-area inset padding, and 1-tap WhatsApp order button.
1. Breadcrumbs & UAE 2-Hour Express Dispatch Banner
2. Interactive Hero Stage (Multi-view gallery, color-coded flavor picker, nicotine strength, pricing, instant COD CTA)
3. Key Technical Specifications Matrix (Puffs, battery cell, e-liquid ml, coil resistance, charging port)
4. Sensory Flavor Lab & Aroma Gauge (Sweetness, cooling, throat-hit sliders, top/heart/base notes)
5. Patented Device Engineering & Architecture (Dual mesh coil, OLED display, anti-leak chamber)
6. UAE ESMA Authenticity & Anti-Counterfeit Verification (Interactive scratch code tester)
7. Nationwide Logistics & Express Delivery Matrix (Dubai 2-3h, Abu Dhabi/Sharjah same-day)
8. Frequently Bought Together Bundle Builder (1-click 3-piece discount bundle)
9. How to Use & Battery Safety Instructions (Step 1 to 4)
10. Community Reviews & Star Distribution Breakdown (Verified UAE buyers)
11. Frequently Asked Questions Accordion (Customs, lifespan, charging)
12. Related & Recommended Products Carousel

### Collection Page (12 Sections + Quick View + 1-Click Chips)
- **1-Click Quick Filter Bar**: Horizontal scrollable chips for instant brand filtering (Kief, Elf Bar, VOZOL, etc.) and puff ranges (<10k, 10k-25k, 25k+).
- **Quick View Modal**: Instant slide-over product preview with flavor selection and direct add-to-cart without leaving the catalog.
1. Luxury Hero Banner & Category Story (Emerald-Gold gradient)
2. Visual Quick-Jump Subcategory Chips
3. Flash Deal of the Day / Collection Spotlight
4. Multi-Facet Filtering Command Center (Brand, price, puffs, nicotine, flavor, stock, sort, grid/list view)
5. Responsive Product Grid & List Showcase
6. Curated Buyer's Guide & Comparison Matrix Table
7. Collection Flavor Palette Classification Wheel
8. UAE Regulatory, Tax Stamp & ESMA Compliance Banner
9. Community Ratings & Verified Buyer Testimonials
10. Category Specific FAQ Accordion
11. Longform SEO Editorial Guide (Google UAE #1 ranking)
12. VIP Sommelier & WhatsApp Assistance Hub

### Purchase & Checkout Experience
- **Slide-Over Cart Drawer (`CartDrawer`)**:
  - Live Free UAE Delivery Progress Meter (AED 350 threshold)
  - Stepper controls (+/- quantity) & delete actions
  - **Step 1 (Cart)**: Subtotal, VAT breakdown, 1-click WhatsApp order.
  - **Step 2 (Express Checkout)**: In-drawer frictionless checkout with UAE address, Emirate selection, Cash on Delivery / Card on Delivery selector.
  - **Step 3 (Confirmed)**: Instant order confirmation screen with order reference ID (e.g. `VM-247642`), estimated delivery time (2-3 hrs), and WhatsApp dispatch tracking.

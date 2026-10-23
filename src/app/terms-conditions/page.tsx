import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { getShopifyPageSections } from "@/lib/shopify-pages";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | Vape Mart UAE",
  description:
    "The terms and conditions for shopping with Vape Mart UAE — orders, delivery, returns, and acceptable use.",
};

const localSections = [
  {
    title: "1. Eligibility — Adults 21+ Only",
    body: [
      "By using this store you confirm you are at least 21 years old, in line with UAE Federal Law on vaping and nicotine products. We verify age at checkout and on delivery via Emirates ID or passport. Orders that fail age verification will be cancelled and refunded.",
    ],
  },
  {
    title: "2. Products & Authenticity",
    body: [
      "All products sold by Vape Mart are 100% original, ESMA certified, and tax-paid. Product images are for illustration; minor packaging variations between batches may occur. Prices are listed in AED and include applicable UAE taxes unless stated otherwise.",
    ],
  },
  {
    title: "3. Orders & Payment",
    body: [
      "An order is confirmed once you receive confirmation from us. We accept Cash on Delivery, credit/debit cards, and Apple Pay. We reserve the right to cancel orders in cases of pricing errors, suspected fraud, failed age verification, or stock unavailability — any payment taken will be refunded in full.",
    ],
  },
  {
    title: "4. Delivery",
    body: [
      "We deliver across all seven emirates. Express delivery is available in Dubai, Abu Dhabi, Sharjah, and Ajman; standard delivery applies elsewhere. Delivery times shown at checkout are estimates. Please ensure someone 21+ is available to receive the order with valid ID.",
    ],
  },
  {
    title: "5. Returns & Refunds",
    body: [
      "Unopened products in original sealed packaging may be returned within 7 days of delivery for a refund or exchange. For faulty or damaged items, contact us within 48 hours of delivery with photos and we will arrange a replacement or refund. Opened e-liquids and used devices cannot be returned for hygiene and safety reasons, except where faulty.",
    ],
  },
  {
    title: "6. Health Notice",
    body: [
      "Vaping products contain nicotine, which is addictive. They are intended as an alternative for adult smokers and are not recommended for non-smokers, pregnant women, or persons with heart conditions. If you experience adverse effects, stop use and consult a doctor.",
    ],
  },
  {
    title: "7. Acceptable Use",
    body: [
      "You agree not to misuse this site, attempt to access restricted areas, place fraudulent orders, or resell our products to persons under 21. We may suspend accounts or cancel orders that breach these terms.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: [
      "To the maximum extent permitted by UAE law, Vape Mart is not liable for indirect or consequential losses arising from the use of our products or site. Our total liability for any order is limited to the value of that order.",
    ],
  },
  {
    title: "9. Governing Law",
    body: [
      "These terms are governed by the laws of the United Arab Emirates. Any disputes will be subject to the jurisdiction of the courts of Dubai, UAE.",
    ],
  },
  {
    title: "10. Changes to These Terms",
    body: [
      "We may update these terms from time to time. Continued use of the store after changes are published constitutes acceptance of the updated terms.",
    ],
  },
];

export default async function TermsPage() {
  const cmsSections = await getShopifyPageSections("terms-conditions");
  const sections = cmsSections.length ? cmsSections : localSections;
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <PageHero
          badge="Legal"
          title="Terms & Conditions"
          subtitle="The ground rules for shopping with Vape Mart — orders, delivery, returns, and your responsibilities."
          crumbs={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]}
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 pb-16 sm:pb-24">
          <p className="text-slate-400 text-xs sm:text-sm mb-8">
            Effective date: October 18, 2026 · Vape Mart UAE
          </p>
          <div className="flex flex-col gap-6">
            {sections.map((s) => (
              <section
                key={s.title}
                className="rounded-[20px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
              >
                <h2 className="font-luxury text-slate-900 text-lg sm:text-xl font-bold mb-3">
                  {s.title}
                </h2>
                {s.body.map((p, i) => (
                  <p key={i} className="text-slate-600 text-[15px] leading-relaxed mb-3 last:mb-0">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
          <div className="mt-8 rounded-[20px] bg-emerald-50 border border-emerald-200 p-6 text-center">
            <p className="text-emerald-800 text-sm font-semibold">
              Questions about these terms? Email us at support@vapemart.ae
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

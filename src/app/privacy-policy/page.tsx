import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { getShopifyPageSections } from "@/lib/shopify-pages";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Vape Mart UAE",
  description:
    "How Vape Mart collects, uses and protects your personal information when you shop with us in the UAE.",
};

const localSections = [
  {
    title: "1. Information We Collect",
    body: [
      "When you place an order or contact us, we collect the information needed to serve you: your name, phone number, delivery address, email address, and order details. If you pay by card, payment processing is handled by secure third-party payment providers — we never store your full card numbers on our servers.",
      "We also collect basic technical information when you browse our site, such as device type, browser, and pages visited, to keep the store fast and secure.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "Your information is used to process and deliver your orders, verify your age (21+ as required by UAE law), provide customer support, and — only if you opt in — send you offers and new product updates. We do not sell your personal data to anyone.",
    ],
  },
  {
    title: "3. Age Verification",
    body: [
      "Vape Mart sells strictly to adults aged 21 and above. We verify age at checkout and our couriers check Emirates ID or passport on delivery. Any order that cannot be age-verified will be cancelled and refunded.",
    ],
  },
  {
    title: "4. Sharing of Information",
    body: [
      "We share your information only where necessary: with our courier partners to deliver your order, with payment providers to process payments, and with authorities where required by UAE law. Every partner is bound to handle your data securely.",
    ],
  },
  {
    title: "5. Data Security",
    body: [
      "We use encrypted connections (HTTPS), access controls, and secure hosting to protect your information. While no system is completely immune, we follow industry best practices and review our security regularly.",
    ],
  },
  {
    title: "6. Cookies",
    body: [
      "Our site uses essential cookies to keep your cart and session working, and optional analytics cookies to understand how visitors use the store. You can control cookies through your browser settings; blocking essential cookies may limit site functionality.",
    ],
  },
  {
    title: "7. Your Rights",
    body: [
      "You may request a copy of the personal data we hold about you, ask us to correct it, or ask us to delete it where legally possible. Contact us at support@vapemart.ae and we will respond within a reasonable time.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      "We may update this policy as our services or legal requirements change. The latest version will always be published on this page with its effective date.",
    ],
  },
];

export default async function PrivacyPolicyPage() {
  const cmsSections = await getShopifyPageSections("privacy-policy");
  const sections = cmsSections.length ? cmsSections : localSections;
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <PageHero
          badge="Legal"
          title="Privacy Policy"
          subtitle="Your privacy matters. Here is exactly what we collect, why we collect it, and how we protect it."
          crumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
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
              Questions about your data? Email us at support@vapemart.ae
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

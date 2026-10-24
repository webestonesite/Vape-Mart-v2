"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const channels = [
  {
    icon: Phone,
    title: "WhatsApp & Phone",
    value: "+971 55 168 8299",
    sub: "Fastest response — usually within minutes",
    href: "https://wa.me/971551688299",
  },
  {
    icon: Mail,
    title: "Email",
    value: "support@vapemart.ae",
    sub: "For orders, returns and partnerships",
    href: "mailto:support@vapemart.ae",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Downtown & Dubai Marina Hub",
    sub: "United Arab Emirates",
  },
  {
    icon: Clock,
    title: "Support Hours",
    value: "Mon – Sun: 9 AM – 11 PM",
    sub: "WhatsApp available all day",
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  // The intro copy is edited in Shopify admin (Content → Pages → Contact).
  const [introHtml, setIntroHtml] = useState("");
  // Contact cards + hero subtitle from the panel (shop metafields, namespace "pages").
  const [pageSettings, setPageSettings] = useState<any>(null);
  useEffect(() => {
    fetch("/api/site-content")
      .then((res) => res.json())
      .then((data) => { if (data?.settings?.pages) setPageSettings(data.settings.pages); })
      .catch(() => {});
  }, []);
  const CONTACT_ICONS: Record<string, any> = { Phone, Mail, MapPin, Clock };
  const channelsList: { icon: any; title: string; value: string; sub: string; href?: string }[] = pageSettings?.contact_cards?.length
    ? pageSettings.contact_cards.map((c: any) => ({ icon: CONTACT_ICONS[c.icon] || Phone, title: c.title || "", value: c.value || "", sub: c.sub || "", href: c.href || undefined }))
    : channels;
  const heroSubtitle = pageSettings?.page_hero_subtitles?.contact || "Questions about an order, a product, or wholesale? Our UAE support team replies fast — usually within minutes on WhatsApp.";
  useEffect(() => {
    fetch("/api/page-content?handle=contact")
      .then((res) => res.json())
      .then((data) => {
        if (data?.bodyHtml) setIntroHtml(data.bodyHtml);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <PageHero
          badge="Get In Touch"
          title="Contact Us"
          subtitle={heroSubtitle}
          crumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8 sm:mt-12 pb-16 sm:pb-24">
          {/* Channels */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-10 sm:mb-14">
            {channelsList.map((c) => {
              const inner = (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                    <c.icon size={22} className="text-emerald-700" />
                  </div>
                  <h3 className="font-luxury text-slate-900 text-lg font-bold mb-1">{c.title}</h3>
                  <p className="text-emerald-800 font-bold text-sm sm:text-base mb-1">{c.value}</p>
                  <p className="text-slate-500 text-xs sm:text-sm">{c.sub}</p>
                </>
              );
              return c.href ? (
                <a
                  key={c.title}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={c.title}
                  className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {inner}
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div className="grid lg:grid-cols-5 gap-8 sm:gap-10">
            <div className="lg:col-span-3 rounded-[24px] border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
{introHtml ? (
                <div
                  className="[&>h2]:font-luxury [&>h2]:text-slate-900 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-2 [&>p]:text-slate-500 [&>p]:text-sm [&>p]:mb-6"
                  dangerouslySetInnerHTML={{ __html: introHtml }}
                />
              ) : (
                <>
                  <h2 className="font-luxury text-slate-900 text-xl sm:text-2xl font-bold mb-2">
                    Send Us a Message
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                    Fill in the form and we will get back to you within a few hours during support times.
                  </p>
                </>
              )}
              {sent ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
                  <CheckCircle2 size={40} className="text-emerald-600 mx-auto mb-3" />
                  <p className="font-luxury text-emerald-900 text-lg font-bold mb-1">
                    Message Received
                  </p>
                  <p className="text-emerald-700/80 text-sm">
                    Thank you — our team will reply shortly. For urgent help, message us on WhatsApp.
                  </p>
                </div>
              ) : (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Your Name
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Ahmed Khan"
                        className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Phone / WhatsApp
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="+971 5X XXX XXXX"
                        className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Order question, product advice, wholesale…"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Side panel */}
            <div className="lg:col-span-2">
              <div className="rounded-[24px] bg-gradient-to-br from-[#022c22] to-[#064e3b] p-8 relative overflow-hidden h-full">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/15 rounded-full blur-[60px] pointer-events-none" />
                <h3 className="font-luxury text-white text-xl font-bold mb-4 relative z-10">
                  Prefer WhatsApp?
                </h3>
                <p className="text-emerald-100/70 text-sm leading-relaxed mb-6 relative z-10">
                  Most customers get the fastest help on WhatsApp — order tracking, flavour
                  recommendations, and same-day delivery coordination, all in one chat.
                </p>
                <a
                  href="https://wa.me/971551688299"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm px-6 py-3 rounded-xl transition-colors relative z-10"
                >
                  <Phone size={16} /> Chat on WhatsApp
                </a>
                <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                  <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                    Delivery Coverage
                  </p>
                  <p className="text-emerald-100/70 text-sm">
                    Dubai • Abu Dhabi • Sharjah • Ajman • Ras Al Khaimah • Fujairah • Umm Al Quwain
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

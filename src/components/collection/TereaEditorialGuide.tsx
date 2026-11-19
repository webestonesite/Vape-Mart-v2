"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Cpu,
  Droplets,
  Globe2,
  ShieldCheck,
  Flame,
  Check,
  BadgeCheck,
  Truck,
  CreditCard,
  Headset,
  RotateCcw,
  Tag,
  UserCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export const TEREA_FAQS = [
  {
    q: "How many sticks are in a TEREA pack?",
    a: "20 sticks. Every pack here is sold sealed, with the region printed on the label.",
  },
  {
    q: "Can one stick last longer than 14 puffs?",
    a: "On the IQOS ILUMA i devices, yes. The FlexPuff feature can add up to 4 extra puffs, so one stick can reach about 18 puffs depending on how you draw. The standard session is 14 puffs or 6 minutes.",
  },
  {
    q: "Can I use TEREA sticks in a Lambda device?",
    a: "Yes. The Lambda i9, i10 and X1 are induction devices made for TEREA sticks, and they heat the same way an ILUMA does. Lambda's blade models are different devices and do not take TEREA, so check the model before you buy.",
  },
  {
    q: "What is a Pearl stick?",
    a: "A Pearl stick has a small capsule in the filter. Press it and it releases extra flavour and menthol into the vapour. Sun Pearl, Oasis Pearl, Twilight Pearl, Provence Pearl, Riviera Pearl, Perint Pearl, Strawberry Pearl and Passion Fruit Pearl are the Pearl sticks in this range. If you don't click it, you get the base tobacco taste on its own.",
  },
  {
    q: "Can I buy TEREA by the carton?",
    a: "Yes. A carton is 10 packs, 200 sticks. Cartons are listed alongside the single packs.",
  },
  {
    q: "Do you deliver TEREA to Abu Dhabi?",
    a: "Yes. Abu Dhabi takes 1–2 days on standard delivery, and so do the other emirates including Ajman. Sharjah city gets same-day express when you order before 6pm, and Kalba and Khor Fakkan get next-day delivery. Cash on delivery is available on eligible orders, and orders over AED 400 ship free across the UAE.",
  },
  {
    q: "How do I return an order I'm not happy with?",
    a: "Contact the shop team on WhatsApp (+971 55 110 3401) and they will sort it out. The 30-day money-back promise covers products that arrive in a condition you don't trust.",
  },
];

export function TereaEditorialGuide() {
  const comparisonRows = [
    {
      flavour: "TEREA Bronze Indonesia",
      family: "Tobacco",
      menthol: "None",
      note: "Cocoa and dried fruit",
      bestFor: "Smokers switching who want a full tobacco taste",
    },
    {
      flavour: "TEREA Purple Wave Indonesia",
      family: "Fruit-menthol",
      menthol: "Cool menthol",
      note: "Dark forest fruit",
      bestFor: "Menthol smokers who want berry with the cool",
    },
    {
      flavour: "TEREA Blue Indonesia",
      family: "Menthol",
      menthol: "Peppermint, medium cooling",
      note: "Creamy aroma",
      bestFor: "Menthol smokers who want clean peppermint",
    },
    {
      flavour: "TEREA Turquoise Switzerland",
      family: "Menthol",
      menthol: "Crisp menthol, zesty",
      note: "Lightly toasted tobacco",
      bestFor: "Menthol smokers who want a crisp, zesty cool",
    },
  ];

  const popularSticks = [
    {
      title: "TEREA Bronze Indonesia",
      tag: "TOP TOBACCO PICK",
      desc: "Soft tobacco with cocoa and dried-fruit notes, and the fullest tobacco feel in the Indonesia range. Bronze is a common first pick for tobacco smokers, and it is the one to reach for when a lighter stick feels thin. If you want your first TEREA to taste like tobacco, start here.",
    },
    {
      title: "TEREA Purple Wave Indonesia",
      tag: "POPULAR FRUIT-MENTHOL",
      desc: "Cool menthol with dark forest fruit behind it, berry on the inhale and a clean cool finish. Purple Wave is the fruit-menthol stick in this range, and it is sold in six regions here, so check the pack if you have a favourite region. The Indonesia version is a good place to start.",
    },
    {
      title: "TEREA Blue Indonesia",
      tag: "CLASSIC CLEAN MENTHOL",
      desc: "Peppermint menthol with a creamy aroma, smooth and medium in its cooling. Blue is the clean menthol in the range, no fruit and no sweetness, just a steady cool from the first puff to the last. If you smoke menthol cigarettes and you want the closest match, this is it.",
    },
    {
      title: "TEREA Turquoise Switzerland",
      tag: "CRISP & ZESTY",
      desc: "Crisp menthol cooling over lightly toasted tobacco, with subtle zesty notes underneath. Turquoise is a light menthol in the Swiss range, and it suits smokers who want a clean cool without the weight of peppermint. If Blue feels too strong, this is the gentler step.",
    },
    {
      title: "TEREA Amber Kyrgyzstan",
      tag: "WARM & ROUNDED",
      desc: "Rich, rounded toasted tobacco with woody and nutty notes, warm and full-bodied. Amber is the classic tobacco stick in the Kyrgyzstan range, and it is the one to try if Bronze feels too cocoa-forward for you. A steady, uncomplicated tobacco from the first puff to the last.",
    },
    {
      title: "TEREA Rich Regular Japan",
      tag: "DEEP JAPAN REGULAR",
      desc: "Rich, full tobacco, and the strongest of the Japan Regular sticks stocked here. Rich Regular is for smokers who want no menthol, no fruit and no capsule, just a deep tobacco taste from the first puff. It is the fullest tobacco stick in the Japan range, and the one to try if Bronze feels light.",
    },
  ];

  const trustPoints = [
    {
      icon: CreditCard,
      title: "Cash on delivery",
      desc: "Pay when your order arrives. Cash on delivery is available on eligible orders across the UAE.",
    },
    {
      icon: Truck,
      title: "Same-day delivery in Dubai",
      desc: "Order before 6pm and your sticks arrive in 3–4 hours with express dispatch.",
    },
    {
      icon: Tag,
      title: "Free delivery over AED 400",
      desc: "Orders over AED 400 ship free across Dubai, Abu Dhabi, Sharjah and all Emirates.",
    },
    {
      icon: BadgeCheck,
      title: "Sealed original stock",
      desc: "Every pack is sealed, holds 20 sticks, and has the region printed on the label. Check the seal and label when your order arrives.",
    },
    {
      icon: Headset,
      title: "Real help on WhatsApp",
      desc: "Message the shop team on +971 55 110 3401 to help you pick a flavour, region or device.",
    },
    {
      icon: RotateCcw,
      title: "30-day money back",
      desc: "If a product arrives in a condition you don't trust, our 30-day money-back guarantee covers you.",
    },
    {
      icon: Check,
      title: "Prices in AED, stock per option",
      desc: "The price and stock you see belong to the exact flavour and region you picked, with zero surprise fees.",
    },
    {
      icon: UserCheck,
      title: "Age-checked delivery",
      desc: "TEREA is strictly for adult smokers (18+), with age verification completed upon delivery.",
    },
  ];

  return (
    <section className="mt-14 sm:mt-20 overflow-hidden rounded-3xl border border-emerald-900/10 bg-white">
      {/* 1. Guide Header — Emerald/Amber Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#043e2e] to-[#022c22] px-6 py-10 sm:px-10 sm:py-14 text-white">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/15 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-emerald-400/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 font-cinzel text-[11px] tracking-[0.24em] text-amber-300 font-bold">
            <BookOpen size={13} /> OFFICIAL BUYER&apos;S GUIDE & KNOWLEDGE BASE
          </p>
          <h2 className="mt-4 font-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            IQOS TEREA Shop UAE – TEREA Sticks from 7 Regions
          </h2>
          <p className="mt-5 text-[15px] sm:text-base leading-relaxed text-emerald-100/90">
            At the IQOS TEREA Shop UAE, you will find IQOS TEREA sticks from 7 regions, 61 flavours in all, made for IQOS ILUMA and ILUMA i devices. TEREA is a tobacco heating solution: the device heats the tobacco instead of burning it. Two things matter: every stick here works only in an ILUMA or a Lambda induction device. The region on the pack matters too, because the same flavour name can taste different by region. Indonesia brings 20 flavours, Uzbekistan 9, Japan 8, Italy and Kyrgyzstan 7 each, Switzerland 6 and Tajikistan 4, and they are not the same flavours in different boxes. If you already own an ILUMA device and you want real tobacco taste without ash or smoke, this is the range built for you.
          </p>
          <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed text-emerald-100/80">
            Every pack is sealed original stock, 20 sticks, with the region on the label so you can check before you open it. Buy IQOS Terea in Dubai online here, with delivery across Dubai, including Downtown Dubai and Dubai Marina, and the wider UAE. In Dubai, order before 6pm and your sticks arrive in 3–4 hours. Cash on delivery is available. If you are stuck between two flavours, the shop team on WhatsApp can help you pick. New to TEREA? Start with Bronze for tobacco or Blue for menthol. Below are the questions buyers ask most, the popular flavours, a comparison, and the FAQs.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {["7 Sourced Regions", "61 Flavours", "SmartCore Induction", "3-4h Dubai Express", "Cash on Delivery", "20 Sticks Per Pack"].map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1.5 text-xs font-semibold text-amber-300"
              >
                <Check size={13} className="text-amber-400" /> {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Educational Chapters */}
      <div className="px-6 sm:px-10 py-10 sm:py-12 border-b border-emerald-900/10">
        <div className="mb-8">
          <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-1">FREQUENT BUYER QUESTIONS</p>
          <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">
            Everything You Need to Know Before Buying TEREA
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {/* Chapter 1 */}
          <div className="rounded-2xl border border-emerald-900/10 bg-[#fafcfb] p-6 hover:border-amber-400/50 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-amber-300 font-bold text-sm">
                <Cpu size={18} />
              </span>
              <h4 className="font-luxury text-lg sm:text-xl font-bold text-emerald-950">
                Will TEREA sticks work in my IQOS?
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600 mb-3">
              TEREA sticks for IQOS ILUMA devices work only in the ILUMA family: the IQOS ILUMA, ILUMA i, ILUMA i ONE and ILUMA i PRIME, plus Lambda induction devices made for TEREA. If your device is an IQOS 3 DUO, an IQOS ORIGINALS, or any older model with a blade inside, TEREA sticks will not work in it.
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              Compatibility comes down to the heating technology. TEREA sticks are made by Philip Morris, and every stick has a thin metal element sealed inside it. The ILUMA heats that element from the inside using the SmartCore induction system, so there is no blade to insert and nothing to clean. A blade device cannot heat a Smartcore stick, and forcing one in can damage the blade. If you clean a blade after each session, it is not an ILUMA.
            </p>
          </div>

          {/* Chapter 2 */}
          <div className="rounded-2xl border border-emerald-900/10 bg-[#fafcfb] p-6 hover:border-amber-400/50 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-amber-300 font-bold text-sm">
                <Flame size={18} />
              </span>
              <h4 className="font-luxury text-lg sm:text-xl font-bold text-emerald-950">
                Which TEREA flavour should I try first?
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600 mb-3">
              Start with the family that matches what you smoke now, not with the flavour that sounds most interesting. Tobacco smokers do best with a tobacco stick. Menthol smokers do best with a menthol stick. The fruit and capsule sticks are worth trying once you know the basics.
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              The range falls into five families. Tobacco sticks like Bronze, Sienna, Amber and Silver, plus Japan&apos;s Regulars, taste of tobacco first. Menthol sticks like Blue, Green, Menthol and Mint are cool and clean. Fruit-menthol sticks like Purple Wave and Summer Wave add berry or fruit to the cool. Pearl sticks have a small capsule in the filter that you click to release flavour and menthol. Indonesia&apos;s Edition sticks blend real clove with tobacco, menthol or fruit, for smokers who like kretek-style clove. Beginners usually start with tobacco or menthol.
            </p>
          </div>

          {/* Chapter 3 */}
          <div className="rounded-2xl border border-emerald-900/10 bg-[#fafcfb] p-6 hover:border-amber-400/50 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-amber-300 font-bold text-sm">
                <Globe2 size={18} />
              </span>
              <h4 className="font-luxury text-lg sm:text-xl font-bold text-emerald-950">
                Is IQOS TEREA Purple Wave the same in every region?
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600 mb-3">
              No. The same flavour name can taste different depending on the region, and Purple Wave is the clearest example. It is sold here in six regions: Indonesia, Uzbekistan, Kyrgyzstan, Tajikistan, Switzerland and Italy. Each region&apos;s blend is its own, made for that market, so the Indonesian Purple Wave and the Swiss Purple Wave are not the same stick in a different box.
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              The same goes for Amber, Silver, Turquoise, Yellow and Sun Pearl, which all appear in more than one region here. The region is printed on the pack, so you can always check which one you are buying. If you tried a flavour on holiday or a friend recommended one, ask which region it was before you order, or you may get a different taste from the one you remember.
            </p>
          </div>

          {/* Chapter 4 */}
          <div className="rounded-2xl border border-emerald-900/10 bg-[#fafcfb] p-6 hover:border-amber-400/50 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-amber-300 font-bold text-sm">
                <ShieldCheck size={18} />
              </span>
              <h4 className="font-luxury text-lg sm:text-xl font-bold text-emerald-950">
                How do I know the TEREA sticks are genuine?
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600 mb-3">
              Check the pack before you open it. A genuine TEREA pack is sealed, holds 20 sticks, has the region printed on it, and carries the proper health warnings. Those four things are the authenticity check.
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              Loose sticks sold without a pack, packs with a broken seal, and packs with no region printed on them are all reasons to stop and ask questions. So is a price that looks far below what every other shop charges. Buying from a shop that stands behind its stock, with a returns promise behind it, is the simplest protection.
            </p>
          </div>

          {/* Chapter 5 (Span 2 columns on desktop) */}
          <div className="md:col-span-2 rounded-2xl border border-emerald-900/10 bg-[#fafcfb] p-6 hover:border-amber-400/50 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-amber-300 font-bold text-sm">
                <Droplets size={18} />
              </span>
              <h4 className="font-luxury text-lg sm:text-xl font-bold text-emerald-950">
                Is one TEREA stick like one cigarette?
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600 mb-3">
              In timing, yes. A TEREA stick lasts about 6 minutes or 14 puffs, roughly the length of a cigarette break. The nicotine is listed at about 0.5 mg per stick. The feel is closest to a cigarette in the tobacco sticks. Bronze and Rich Regular are the fullest, and they are the natural starting point for tobacco smokers. Menthol smokers usually find Blue or Green a better match.
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              The device heats the tobacco, so there is no ash, no smoke, and far less smell on your clothes. That is the honest picture. TEREA is still a tobacco product with nicotine in it, and it is not a way to quit smoking. It is also different from an e-cigarette: there is no liquid here, just tobacco heated until it gives off vapour. It is a different way to use tobacco, and whether it suits you depends on what you smoke now and what you want from the switch.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Popular Products Showcase */}
      <div className="px-6 sm:px-10 py-10 sm:py-12 border-b border-emerald-900/10 bg-emerald-950/2">
        <div className="mb-8">
          <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-1">TOP RATED PICKS</p>
          <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">
            Popular TEREA Flavours in Dubai
          </h3>
          <p className="mt-2 text-sm text-neutral-600 max-w-2xl leading-relaxed">
            These are the popular IQOS Terea flavors in the range, six sticks that cover the full spread from bold tobacco to cool menthol. Terea flavors in Dubai span all 7 regions, and these six are the ones to know first. The Terea Sticks Dubai buyers search for most are Bronze, Purple Wave and Blue.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularSticks.map((stick) => (
            <div
              key={stick.title}
              className="rounded-2xl border border-emerald-900/10 bg-white p-5 flex flex-col justify-between hover:shadow-lg hover:border-amber-400/60 transition-all group"
            >
              <div>
                <span className="inline-block font-cinzel text-[10px] tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full mb-3">
                  {stick.tag}
                </span>
                <h4 className="font-luxury text-lg font-bold text-emerald-950 mb-2 group-hover:text-amber-600 transition-colors">
                  {stick.title}
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {stick.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Comparison Table */}
      <div className="px-6 sm:px-10 py-10 sm:py-12 border-b border-emerald-900/10">
        <div className="mb-6">
          <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-1">SIDE-BY-SIDE BREAKDOWN</p>
          <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">
            Popular Products Compared
          </h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-emerald-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#064e3b] text-white font-cinzel text-xs tracking-wider uppercase">
              <tr>
                <th className="px-5 py-3.5 font-bold">Flavour</th>
                <th className="px-4 py-3.5 font-bold">Family</th>
                <th className="px-4 py-3.5 font-bold">Menthol</th>
                <th className="px-5 py-3.5 font-bold">Standout note</th>
                <th className="px-5 py-3.5 font-bold">Best for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/10 bg-white">
              {comparisonRows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-emerald-50/25"}>
                  <td className="px-5 py-3.5 font-bold text-emerald-950">{r.flavour}</td>
                  <td className="px-4 py-3.5 text-neutral-600">{r.family}</td>
                  <td className="px-4 py-3.5 text-neutral-600">{r.menthol}</td>
                  <td className="px-5 py-3.5 text-neutral-700 font-medium">{r.note}</td>
                  <td className="px-5 py-3.5 text-emerald-900 font-semibold">{r.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Why Shop With Vape Mart (8-Point Grid) */}
      <div className="px-6 sm:px-10 py-10 sm:py-12 bg-[#fafcfb] border-b border-emerald-900/10">
        <div className="mb-8">
          <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-1">SERVICE & TRUST</p>
          <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">
            Why Shop With Vape Mart
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            Vape Mart is a Terea Dubai shop built around genuine stock and straight answers.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustPoints.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-emerald-900/10 bg-white p-5 flex flex-col justify-start hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-900/5 border border-emerald-900/10 flex items-center justify-center text-emerald-800 mb-3">
                <item.icon size={20} className="text-amber-600" />
              </div>
              <h4 className="font-luxury text-base font-bold text-emerald-950 mb-1.5">
                {item.title}
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Closing CTA Strip */}
      <div className="px-6 sm:px-10 py-8 bg-gradient-to-r from-[#064e3b] to-[#022c22] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-luxury text-xl sm:text-2xl font-bold leading-tight">
            Order from the IQOS TEREA Shop UAE
          </h4>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Buy IQOS & Terea in Dubai in one order, device and sticks together, delivered across the UAE.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://wa.me/971551103401"
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-6 rounded-xl bg-amber-400 text-emerald-950 font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-amber-300 transition-colors shadow-md shadow-black/20"
          >
            Order on WhatsApp <ExternalLink size={14} />
          </a>
          <button
            onClick={() => {
              document.getElementById("collection-grid-top")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-11 px-5 rounded-xl border border-white/30 text-white font-bold text-xs tracking-wider uppercase hover:bg-white/10 transition-colors cursor-pointer"
          >
            Browse Sticks
          </button>
        </div>
      </div>
    </section>
  );
}


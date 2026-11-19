"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Cpu,
  Flame,
  Globe2,
  ShieldCheck,
  Zap,
  Check,
  BadgeCheck,
  Truck,
  CreditCard,
  Headset,
  RotateCcw,
  Tag,
  UserCheck,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

export function TereaEditorialGuide() {
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

  const chapters = [
    {
      num: "01",
      icon: Cpu,
      title: "Will TEREA sticks work in my IQOS?",
      p1: "TEREA sticks for IQOS ILUMA devices work only in the ILUMA family: the IQOS ILUMA, ILUMA i, ILUMA i ONE and ILUMA i PRIME, plus Lambda induction devices made for TEREA. If your device is an IQOS 3 DUO, an IQOS ORIGINALS, or any older model with a blade inside, TEREA sticks will not work in it.",
      p2: "Compatibility comes down to the heating technology. TEREA sticks are made by Philip Morris, and every stick has a thin metal element sealed inside it. The ILUMA heats that element from the inside using the SmartCore induction system, so there is no blade to insert and nothing to clean. A blade device cannot heat a Smartcore stick, and forcing one in can damage the blade. If you clean a blade after each session, it is not an ILUMA.",
    },
    {
      num: "02",
      icon: Flame,
      title: "Which TEREA flavour should I try first?",
      p1: "Start with the family that matches what you smoke now, not with the flavour that sounds most interesting. Tobacco smokers do best with a tobacco stick. Menthol smokers do best with a menthol stick. The fruit and capsule sticks are worth trying once you know the basics.",
      p2: "The range falls into five families. Tobacco sticks like Bronze, Sienna, Amber and Silver, plus Japan's Regulars, taste of tobacco first. Menthol sticks like Blue, Green, Menthol and Mint are cool and clean. Fruit-menthol sticks like Purple Wave and Summer Wave add berry or fruit to the cool. Pearl sticks have a small capsule in the filter that you click to release flavour and menthol. Indonesia's Edition sticks blend real clove with tobacco, menthol or fruit, for smokers who like kretek-style clove. Beginners usually start with tobacco or menthol.",
    },
    {
      num: "03",
      icon: Globe2,
      title: "Is IQOS TEREA Purple Wave the same in every region?",
      p1: "No. The same flavour name can taste different depending on the region, and Purple Wave is the clearest example. It is sold here in six regions: Indonesia, Uzbekistan, Kyrgyzstan, Tajikistan, Switzerland and Italy. Each region's blend is its own, made for that market, so the Indonesian Purple Wave and the Swiss Purple Wave are not the same stick in a different box.",
      p2: "The same goes for Amber, Silver, Turquoise, Yellow and Sun Pearl, which all appear in more than one region here. The region is printed on the pack, so you can always check which one you are buying. If you tried a flavour on holiday or a friend recommended one, ask which region it was before you order, or you may get a different taste from the one you remember.",
    },
    {
      num: "04",
      icon: ShieldCheck,
      title: "How do I know the TEREA sticks are genuine?",
      p1: "Check the pack before you open it. A genuine TEREA pack is sealed, holds 20 sticks, has the region printed on it, and carries the proper health warnings. Those four things are the authenticity check.",
      p2: "Loose sticks sold without a pack, packs with a broken seal, and packs with no region printed on them are all reasons to stop and ask questions. So is a price that looks far below what every other shop charges. Every pack sold here arrives sealed, with the region on the pack, and covered by the 30-day money-back guarantee.",
    },
    {
      num: "05",
      icon: Zap,
      title: "Is one TEREA stick like one cigarette?",
      p1: "In timing, yes. A TEREA stick lasts about 6 minutes or 14 puffs, roughly the length of a cigarette break. The nicotine is listed at about 0.5 mg per stick. The feel is closest to a cigarette in the tobacco sticks. Bronze and Rich Regular are the fullest, and they are the natural starting point for tobacco smokers. Menthol smokers usually find Blue or Green a better match.",
      p2: "The device heats the tobacco, so there is no ash, no smoke, and far less smell on your clothes. That is the honest picture. TEREA is still a tobacco product with nicotine in it, and it is not a way to quit smoking. It is also different from an e-cigarette: there is no liquid here, just tobacco heated until it gives off vapour. It is a different way to use tobacco, and whether it suits you depends on what you smoke now and what you want from the switch.",
    },
  ];

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

  const trustPoints = [
    { icon: CreditCard, title: "Cash on delivery", desc: "Pay when your order arrives across the UAE." },
    { icon: Truck, title: "Same-day delivery in Dubai", desc: "Order before 6pm, sticks arrive in 3–4 hours." },
    { icon: Tag, title: "Free delivery over AED 400", desc: "Orders over AED 400 ship free across UAE." },
    { icon: BadgeCheck, title: "Sealed original stock", desc: "Every pack is sealed, holds 20 sticks, region on label." },
    { icon: Headset, title: "Real help on WhatsApp", desc: "Message +971 55 110 3401 to help you pick a flavour." },
    { icon: RotateCcw, title: "30-day money back", desc: "Condition guarantee covers products you don't trust." },
    { icon: Check, title: "Prices in AED, stock per option", desc: "Exact flavour and region prices with zero surprise fees." },
    { icon: UserCheck, title: "Age-checked delivery", desc: "TEREA strictly for adult smokers (18+), verified." },
  ];

  return (
    <section className="mt-14 sm:mt-20 overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm">
      {/* 1. EMERALD TOP BANNER (2-COLUMN BALANCED LAYOUT) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#043e2e] to-[#022c22] px-6 py-10 sm:px-10 sm:py-14 text-white">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/15 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-emerald-400/10 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 grid lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 font-cinzel text-[11px] tracking-[0.24em] text-amber-300 font-bold mb-4">
              <BookOpen size={13} /> OFFICIAL BUYER&apos;S GUIDE & KNOWLEDGE BASE
            </p>
            <h2 className="font-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              IQOS TEREA Shop UAE – TEREA Sticks from 7 Regions
            </h2>
            <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-emerald-100/90 max-w-2xl">
              At the IQOS TEREA Shop UAE, you will find IQOS TEREA sticks from 7 regions, 61 flavours in all, made for IQOS ILUMA and ILUMA i devices. In Dubai, order before 6pm and your sticks arrive in 3–4 hours with cash on delivery available across the UAE.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["7 Sourced Regions", "61 Flavours", "SmartCore Induction", "3–4h Dubai Express", "Cash on Delivery", "20 Sticks Per Pack"].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1.5 text-xs font-semibold text-amber-300"
                >
                  <Check size={13} className="text-amber-400" /> {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: "TEREA At A Glance" Quick Stats Card */}
          <div className="rounded-2xl border border-amber-400/30 bg-white/[0.08] backdrop-blur-md p-6 sm:p-7 shadow-2xl">
            <p className="font-cinzel text-[10px] tracking-[0.22em] text-amber-300 font-bold mb-1">TEREA AT A GLANCE</p>
            <h3 className="font-luxury text-xl sm:text-2xl font-bold text-white mb-4">Key Specifications</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-black/25 border border-white/10 p-3.5 text-center">
                <span className="font-luxury text-2xl sm:text-3xl font-bold text-amber-300 block">61</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80 mt-1 block">Flavours in Stock</span>
              </div>
              <div className="rounded-xl bg-black/25 border border-white/10 p-3.5 text-center">
                <span className="font-luxury text-2xl sm:text-3xl font-bold text-amber-300 block">7</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80 mt-1 block">Sourced Regions</span>
              </div>
              <div className="rounded-xl bg-black/25 border border-white/10 p-3.5 text-center">
                <span className="font-luxury text-2xl sm:text-3xl font-bold text-amber-300 block">100%</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80 mt-1 block">Original Sealed</span>
              </div>
              <div className="rounded-xl bg-black/25 border border-white/10 p-3.5 text-center">
                <span className="font-luxury text-2xl sm:text-3xl font-bold text-amber-300 block">3–4h</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80 mt-1 block">Dubai Delivery</span>
              </div>
            </div>

            <a
              href="https://wa.me/971551103401?text=Hi%20Vape%20Mart!%20I%20need%20help%20choosing%20a%20Terea%20flavor."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              <span>Ask Our Experts on WhatsApp</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* 2. INTRO LEAD WITH TRUST SIDEBAR */}
      <div className="px-6 sm:px-10 py-8 sm:py-10 border-b border-emerald-900/10">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="space-y-4">
            <p className="text-base sm:text-lg leading-relaxed text-emerald-950 font-medium">
              At the IQOS TEREA Shop UAE, you will find IQOS TEREA sticks from 7 regions, 61 flavours in all, made for IQOS ILUMA and ILUMA i devices. TEREA is a tobacco heating solution: the device heats the tobacco instead of burning it. Two things matter: every stick here works only in an ILUMA or a Lambda induction device. The region on the pack matters too, because the same flavour name can taste different by region. Indonesia brings 20 flavours, Uzbekistan 9, Japan 8, Italy and Kyrgyzstan 7 each, Switzerland 6 and Tajikistan 4, and they are not the same flavours in different boxes. If you already own an ILUMA device and you want real tobacco taste without ash or smoke, this is the range built for you.
            </p>
            <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-600">
              Every pack is sealed original stock, 20 sticks, with the region on the label so you can check before you open it. Buy IQOS Terea in Dubai online here, with delivery across Dubai, including Downtown Dubai and Dubai Marina, and the wider UAE. In Dubai, order before 6pm and your sticks arrive in 3–4 hours. Cash on delivery is available. If you are stuck between two flavours, the shop team on WhatsApp can help you pick. New to TEREA? Start with Bronze for tobacco or Blue for menthol. Below are the questions buyers ask most, the popular flavours, a comparison, and the FAQs.
            </p>
          </div>

          <aside className="rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] p-5 sm:p-6 text-white relative overflow-hidden shadow-lg">
            <p className="font-cinzel text-[10px] tracking-[0.22em] text-amber-300 font-bold mb-4">WHY VAPE MART</p>
            <ul className="space-y-3.5">
              {[
                { icon: BadgeCheck, t: "100% Authentic", d: "Licensed UAE importer stock, sealed packs" },
                { icon: Truck, t: "Same-Day Dispatch", d: "Order before 6pm, Dubai express 3–4h" },
                { icon: CreditCard, t: "Cash on Delivery", d: "Pay cash or card at your doorstep" },
                { icon: Headset, t: "24/7 Expert Help", d: "Real humans on WhatsApp anytime" },
              ].map((f) => (
                <li key={f.t} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber-300">
                    <f.icon size={16} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{f.t}</span>
                    <span className="block text-xs text-emerald-100/70 mt-0.5">{f.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>

      {/* 3. FREQUENT BUYER QUESTIONS: 2-COLUMN BALANCED CARDS */}
      <div className="px-6 sm:px-10 py-10 border-b border-emerald-900/10">
        <div className="mb-8">
          <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-1">FREQUENT BUYER QUESTIONS</p>
          <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">
            Everything You Need to Know Before Buying TEREA
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {chapters.map((ch, idx) => (
            <motion.div
              key={ch.num}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className={`rounded-2xl border border-emerald-900/10 bg-[#fbfdfc] p-6 sm:p-7 hover:border-amber-400/50 hover:shadow-lg transition-all ${
                idx === 4 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/10 text-xs font-black text-emerald-900">
                  {ch.num}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 text-amber-600">
                  <ch.icon size={16} />
                </span>
              </div>
              <h4 className="font-luxury text-lg sm:text-xl font-bold text-emerald-950 mb-3">{ch.title}</h4>
              <p className="text-sm sm:text-[14.5px] leading-relaxed text-neutral-600 mb-3">{ch.p1}</p>
              <p className="text-sm sm:text-[14.5px] leading-relaxed text-neutral-600">{ch.p2}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. POPULAR FLAVOURS: 3-COLUMN GRID */}
      <div className="px-6 sm:px-10 py-10 border-b border-emerald-900/10">
        <div className="mb-8">
          <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-1">POPULAR PICKS</p>
          <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">
            Six TEREA Flavours Buyers Keep Coming Back To
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {popularSticks.map((stk, i) => (
            <motion.div
              key={stk.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="rounded-2xl border border-emerald-900/10 bg-white p-6 hover:border-amber-400/50 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block rounded-full bg-amber-400/15 px-3 py-1 font-cinzel text-[10px] tracking-[0.2em] font-bold text-amber-700 mb-3">
                  {stk.tag}
                </span>
                <h4 className="font-luxury text-lg sm:text-xl font-bold text-emerald-950 mb-2">{stk.title}</h4>
                <p className="text-sm leading-relaxed text-neutral-600">{stk.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 5. COMPARISON TABLE */}
      <div className="px-6 sm:px-10 py-10 border-b border-emerald-900/10">
        <div className="mb-8">
          <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-1">AT-A-GLANCE COMPARISON</p>
          <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">
            Popular Products Compared
          </h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-emerald-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#064e3b] text-white font-cinzel text-[11px] tracking-[0.14em]">
              <tr>
                <th className="px-6 py-4">FLAVOUR</th>
                <th className="px-6 py-4">FAMILY</th>
                <th className="px-6 py-4">MENTHOL</th>
                <th className="px-6 py-4">STANDOUT NOTE</th>
                <th className="px-6 py-4">BEST FOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/10">
              {comparisonRows.map((r, idx) => (
                <tr key={r.flavour} className={idx % 2 === 0 ? "bg-white" : "bg-[#fbfdfc]"}>
                  <td className="px-6 py-4 font-bold text-emerald-950 whitespace-nowrap">{r.flavour}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-md bg-emerald-900/5 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                      {r.family}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{r.menthol}</td>
                  <td className="px-6 py-4 text-neutral-600">{r.note}</td>
                  <td className="px-6 py-4 text-neutral-600">{r.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. WHY SHOP WITH VAPE MART (TRUST TILES) */}
      <div className="px-6 sm:px-10 py-10 border-b border-emerald-900/10">
        <div className="rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="mb-6">
            <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-300 font-bold mb-1">AUTHENTICITY & SERVICE</p>
            <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-white">Why Shop With Vape Mart</h3>
            <p className="mt-2 text-sm text-emerald-100/80">Vape Mart is a Terea Dubai shop built around genuine stock and straight answers.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPoints.map((tp) => (
              <div key={tp.title} className="rounded-xl bg-white/[0.07] border border-white/10 p-4">
                <tp.icon size={20} className="text-amber-400 mb-2" />
                <h5 className="font-bold text-sm text-white mb-1">{tp.title}</h5>
                <p className="text-xs leading-relaxed text-emerald-100/75">{tp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. CTA STRIP */}
      <div className="px-6 sm:px-10 py-6 bg-amber-500/10 border-t border-amber-500/20 text-center">
        <p className="text-sm sm:text-base font-medium text-amber-950">
          <strong className="font-bold">Order from the IQOS TEREA Shop UAE.</strong> Buy IQOS & Terea in Dubai in one order, device and sticks together, delivered across the UAE.
        </p>
      </div>
    </section>
  );
}

import { ProductItem, ProductFAQ } from "@/types/product";

export interface SeoSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

/**
 * Builds long-form, product-specific content sections for the single
 * product page. Everything is generated from the product's own data
 * (title, brand, puffs, flavours, specs, highlights) so each product
 * page gets unique, data-driven copy totalling 1500+ words.
 */
export function buildSeoSections(p: ProductItem): SeoSection[] {
  const puffsLabel = p.puffs ? `${p.puffs.toLocaleString()} puffs` : p.puffRange ? `${p.puffRange} puffs` : "a high puff count";
  const flavourNames = p.flavors.filter((f) => f.inStock).map((f) => f.name);
  const flavourListText =
    flavourNames.length > 0
      ? flavourNames.slice(0, 6).join(", ") + (flavourNames.length > 6 ? ` and ${flavourNames.length - 6} more` : "")
      : "a curated range of flavours";

  return [
    {
      heading: `An in-depth look at the ${p.title}`,
      paragraphs: [
        `Designed for the demands of the UAE market, the ${p.title} brings together ${puffsLabel}, a premium ${p.coilType ? p.coilType.split("(")[0].trim().toLowerCase() : "mesh coil"} heating system and ${p.activation ? p.activation.toLowerCase() : "simple draw-activated"} operation in one polished device. Every unit sold by Vape Mart is sourced through licensed UAE import channels, so what arrives at your door is exactly what the manufacturer intended — sealed, certified and ready to vape.`,
      ],
    },
    {
      heading: `Why vapers across the UAE choose the ${p.brand} ${puffsLabel} device`,
      paragraphs: [
        `Longevity is the first thing regular vapers notice. With ${puffsLabel} on board, the ${p.title} comfortably outlasts smaller disposables that need replacing every few days. For a moderate vaper, a single device can cover several weeks of daily use, which means fewer orders, less packaging waste and a noticeably lower cost per day compared with low-capacity alternatives.`,
        `The second reason is consistency. Many high-puff devices fade badly in their final third — flavour mutes, vapour thins and the draw goes harsh. The ${p.coilType ? p.coilType.split("(")[0].trim() : "advanced coil"} architecture inside this device is engineered to hold flavour fidelity from the first puff to the last, so the final sessions taste as clean as the opening ones. That reliability is exactly why ${p.brand} has built such a loyal following among Dubai and Abu Dhabi vapers.`,
      ],
    },
    {
      heading: "Design, build quality and performance",
      paragraphs: [
        `Pick up the ${p.title} and the build quality is immediately obvious: a solid, well-balanced body with a comfortable mouthpiece and a finish that resists the scuffs of pocket and bag life. Operation could not be simpler — there are no buttons, menus or settings to learn. ${p.activation ? p.activation : "Just inhale"} and the device fires instantly, delivering a smooth, responsive draw every time.`,
        `Under the shell, the performance story is about airflow and coil control. An adjustable airflow path lets you move between a tighter, cigarette-like mouth-to-lung draw and a looser restricted direct-lung pull, so the same device suits both transitioning smokers and experienced vapers. ${p.batteryCapacity ? `The ${p.batteryCapacity.toLowerCase()} cell` : "The integrated battery"} holds its voltage curve well, which keeps vapour warm and flavour dense instead of fading as the charge drops.`,
      ],
    },
    {
      heading: "Flavour collection: find your all-day vape",
      paragraphs: [
        `The ${p.title} ships in ${p.flavors.length} signature flavours, including ${flavourListText}. Each blend is mixed for balance rather than shock value — sweetness, cooling and throat hit are tuned so the flavour stays enjoyable across hundreds of puffs a day, not just the first ten. The tasting notes above each flavour card describe exactly what to expect before you commit.`,
        `Not sure where to start? Fruit-ice profiles like watermelon, berry and mango are the safest first pick for most vapers. If you enjoy a colder hit, reach for the mint and menthol-leaning options. Dessert and shisha-inspired blends suit evening vaping when you want something richer. Because every flavour runs on the same device and coil platform, switching between them never means relearning the draw.`,
      ],
    },
    {
      heading: "Nicotine strength guide",
      paragraphs: [
        `This device is offered at ${p.nicotineStrength}${p.nicotineOptions.length > 1 ? `, with additional options including ${p.nicotineOptions.filter((n) => n !== p.nicotineStrength).join(", ")}` : ""}. Nicotine salt is used across the range, which delivers a smoother throat hit than traditional freebase nicotine at the same strength — important in a device designed for frequent, satisfying puffs.`,
        `As a rule of thumb, adult smokers moving from a pack-a-day habit usually feel most comfortable at the higher end of the range, while lighter or social smokers often prefer the lower strengths. If you are new to vaping, start low: you can always step up, but too much nicotine too fast leads to dizziness and an unpleasant session. Vape Mart sells strictly to adults of legal smoking age in the UAE.`,
      ],
    },
    {
      heading: "Battery life and charging",
      paragraphs: [
        `${p.batteryCapacity ? `A ${p.batteryCapacity.toLowerCase()} rechargeable cell powers the ${p.title}` : `A rechargeable cell powers the ${p.title}`}, so the battery will comfortably outlast the e-liquid it ships with under normal use. ${p.chargingType ? `Charging is handled over ${p.chargingType.toLowerCase()}` : "Charging is handled over a modern USB port"}, which means the cable you already use for your phone probably works — no proprietary charger to hunt for.`,
        `For the longest cell life, top the device up with a standard 5V wall adapter rather than a high-wattage fast charger, and avoid leaving it plugged in overnight. The built-in protections — ${p.specifications.find((s) => /safety|protection/i.test(s.label))?.value || "short-circuit, overcharge and overtime cut-off"} — guard against the common electrical faults, but sensible charging habits still make a real difference to how many weeks the device serves you.`,
      ],
    },
    {
      heading: "How to use your device",
      paragraphs: [
        `There is no learning curve. Follow these steps and you will be vaping in under a minute:`,
      ],
      list: [
        "Unbox the device and check the holographic authenticity seal is intact before opening the pouch.",
        "Remove the silicone mouthpiece cap and any protective stickers from the airflow inlets.",
        "Take a slow, steady draw from the mouthpiece — the sensor fires the coil automatically, with no button to press.",
        `If vapour weakens, recharge over ${p.chargingType ? p.chargingType.split("(")[0].trim() : "USB"} until the indicator shows full, then continue.`,
        "When flavour fades permanently or the e-liquid is finished, dispose of the device responsibly at an e-waste collection point — never in household fire waste.",
      ],
    },
    {
      heading: "100% authentic — buy with confidence",
      paragraphs: [
        `Counterfeit vapes are a genuine problem in this market: fake devices can contain mislabelled nicotine levels, poor batteries and e-liquids of unknown origin. Every ${p.title} sold by Vape Mart is imported through licensed UAE channels and carries the manufacturer's holographic anti-counterfeit seal plus a scratch-off QR verification code on the packaging.`,
        `To verify yours, scratch the panel, scan the QR code with your phone and confirm the manufacturer's site reports a first-time genuine scan. If anything looks off — a missing seal, a code that shows multiple previous scans, or packaging that differs from the photos on this page — contact our WhatsApp support immediately with pictures and we will make it right. Authenticity is not a marketing line for us; it is the entire basis of the store.`,
      ],
    },
    {
      heading: "Fast, discreet delivery across the UAE",
      paragraphs: [
        `Order before 9 PM and Dubai customers typically receive their ${p.title} within 2–3 hours through our express courier network, with same-day service across Sharjah and Ajman. Abu Dhabi, Ras Al Khaimah, Fujairah and the remaining Emirates are covered by next-day nationwide delivery — every parcel tracked from our dispatch centre to your door.`,
        `Payment stays flexible: pay cash on delivery, or settle by card when the courier arrives — no prepayment required anywhere in the UAE. Orders over AED 350 ship free, and every package leaves in plain, unmarked packaging for full discretion. Bulk and corporate pricing is available on request through WhatsApp.`,
      ],
    },
  ];
}

/**
 * Product-specific FAQs: the product's own FAQs first, then generated
 * questions covering the topics buyers actually ask about. Capped at 12.
 */
export function buildProductFaqs(p: ProductItem): ProductFAQ[] {
  const puffsLabel = p.puffs ? `${p.puffs.toLocaleString()}` : p.puffRange || "high";
  const generated: ProductFAQ[] = [
    {
      q: `How long will the ${puffsLabel} puffs realistically last?`,
      a: `It depends on how heavily you vape. At a moderate pace of 300–500 puffs a day, a ${puffsLabel}-puff device typically lasts several weeks; heavy vapers will go through it faster, light vapers slower. The rechargeable battery is sized to outlast the e-liquid, so you will not be left with juice and no power.`,
    },
    {
      q: "Which flavour should I choose?",
      a: `Start from the flavour notes on this page: fruity-ice blends are the most popular all-day choices, mint and menthol options suit vapers who like a cold hit, and richer dessert or shisha-inspired profiles work well for evenings. If you are unsure, our WhatsApp team will happily recommend based on what you currently vape.`,
    },
    {
      q: "What nicotine strength is right for me?",
      a: `The device is available at ${p.nicotineStrength}${p.nicotineOptions.length > 1 ? ` (${p.nicotineOptions.join(" / ")})` : ""}. Heavier adult smokers usually prefer the higher strengths for satisfaction, while light or social smokers are often happier lower down. When in doubt, start lower — you can always adjust on your next order.`,
    },
    {
      q: "How do I charge the device, and how long does it take?",
      a: `${p.chargingType ? `Connect any standard USB cable to the ${p.chargingType.split("(")[0].trim().toLowerCase()} port` : "Connect a standard USB cable"} and charge with a regular 5V adapter. A full top-up typically takes well under an hour. Avoid high-wattage fast chargers and overnight charging to keep the cell healthy for the life of the device.`,
    },
    {
      q: "How can I verify my device is 100% authentic?",
      a: `Check the holographic seal on the box, then scratch off the verification panel and scan the QR code with your phone. The manufacturer's verification page should confirm a genuine, first-time scan. Every unit we sell is sourced through licensed UAE import channels.`,
    },
    {
      q: "How fast is delivery, and do you deliver to my Emirate?",
      a: `We deliver across all seven Emirates. Dubai orders placed before 9 PM usually arrive within 2–3 hours; Sharjah and Ajman are same-day; Abu Dhabi, Ras Al Khaimah, Fujairah and Umm Al Quwain are next-day. Shipping is free on orders over AED 350.`,
    },
    {
      q: "Can I pay Cash on Delivery?",
      a: `Yes. Cash on Delivery is available everywhere in the UAE — pay cash or by card to the courier when your order arrives. No prepayment or account is required.`,
    },
    {
      q: "Is this device suitable for beginners?",
      a: `Absolutely. There are no buttons, settings or refilling involved — you simply inhale and the draw-activated sensor does the rest. It is one of the easiest possible ways for an adult smoker to switch.`,
    },
    {
      q: "What if my order arrives damaged or faulty?",
      a: `Message our WhatsApp support immediately with your order details and clear photos of the issue. Faulty or damaged items are replaced quickly — we do not leave customers stuck with a device that does not work as advertised.`,
    },
    {
      q: "Can I return or exchange a flavour I do not like?",
      a: `For hygiene reasons, opened e-liquid devices cannot be resold, so we cannot accept taste-preference returns. Unopened, sealed devices can be exchanged within our return window — contact support before opening if you change your mind and we will arrange it.`,
    },
  ];

  const seen = new Set(p.faqs.map((f) => f.q.trim().toLowerCase()));
  const merged: ProductFAQ[] = [...p.faqs];
  for (const g of generated) {
    if (merged.length >= 12) break;
    const key = g.q.trim().toLowerCase();
    const dup = [...seen].some((s) => s.includes(key.slice(0, 20)) || key.includes(s.slice(0, 20)));
    if (!dup) {
      merged.push(g);
      seen.add(key);
    }
  }
  return merged;
}

/** Rough word count of the generated SEO copy (static templates only). */
export function seoWordCount(p: ProductItem): number {
  const sections = buildSeoSections(p);
  const faqs = buildProductFaqs(p);
  const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
  let n = 0;
  sections.forEach((s) => {
    n += words(s.heading);
    s.paragraphs.forEach((x) => { n += words(x); });
    s.list?.forEach((x) => { n += words(x); });
  });
  faqs.forEach((f) => { n += words(f.q) + words(f.a); });
  return n;
}

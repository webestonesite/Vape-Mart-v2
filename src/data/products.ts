import { ProductItem, CollectionCategory } from "@/types/product";

export const categories: CollectionCategory[] = [
  {
    slug: "disposable-vape",
    name: "Disposable Vapes",
    title: "Premium Disposable Vapes in UAE",
    subtitle: "High-puff rechargeable disposables from Elf Bar, Vozol, Yuoto, and Tugboat with instant mesh coil flavor delivery.",
    badge: "TOP CATEGORY",
    icon: "Flame",
    image: "/images/prod_disposable.png",
    count: 148,
    description: "Explore the UAE's most comprehensive catalog of authentic disposable vapes. Offering ultra-high puff counts from 5,000 up to 40,000 puffs, dual-mesh coils, smart LED battery indicators, and rapid Type-C charging. Same-day delivery across Dubai, Sharjah, and Abu Dhabi."
  },
  {
    slug: "pods-system",
    name: "Pod Systems & Kits",
    title: "Advanced Pod Systems & Closed Kits",
    subtitle: "Compact, refillable, and pre-filled pod kits from JUUL2, Uwell Caliburn, Vaporesso, and Myle.",
    badge: "TRENDING",
    icon: "Zap",
    image: "/images/prod_pod.png",
    count: 86,
    description: "Ideal for adult smokers seeking smooth nicotine salt delivery and effortless pocket portability. Our pod collection includes both open-refillable systems and authentic closed pod systems."
  },
  {
    slug: "e-liquid",
    name: "Premium E-Liquids",
    title: "Artisan Nicotine Salts & Freebase E-Juice",
    subtitle: "Original imported American, UK, and Malaysian gourmet e-juices with intense aroma and authentic fruit ice notes.",
    badge: "FLAVOR LAB",
    icon: "Droplets",
    image: "/images/prod_eliquid.png",
    count: 112,
    description: "Crafted for maximum flavor depth and cloud density. Choose from 20mg to 50mg nicotine salts for pod devices, or 3mg to 6mg high-VG freebase e-liquids for sub-ohm tank systems."
  },
  {
    slug: "heated-tobacco",
    name: "TEREA & HEETS",
    title: "IQOS ILUMA TEREA & HEETS Sticks",
    subtitle: "Original Indonesian, Italian, and European heated tobacco sticks with Smartcore Induction System.",
    badge: "GENUINE 100%",
    icon: "ShieldCheck",
    image: "/images/terea_heets.jpg",
    count: 44,
    description: "Zero ash, zero tar, and no blade cleaning required. Authentic Indonesian & Japanese TEREA sticks designed specifically for IQOS ILUMA devices with same-day express delivery across Dubai."
  },
  {
    slug: "vape-kits",
    name: "Vape Starter & Mod Kits",
    title: "High-Performance Sub-Ohm Vape Kits",
    subtitle: "Rugged, high-wattage box mods and versatile pod mods from Geekvape, Voopoo, and Vaporesso.",
    badge: "PRO SERIES",
    icon: "Layers",
    image: "/images/cat_vape_kits.png",
    count: 52,
    description: "Built for cloud chasers and flavour purists. Featuring IP68 shockproof & waterproof ratings, responsive chipset firing speeds, and massive rechargeable battery life."
  },
  {
    slug: "shisha-hookah",
    name: "E-Shisha & Hookah",
    title: "Electronic Shisha Devices & Flavors",
    subtitle: "Modern charcoal-free electronic hookah devices with clean vapor output and authentic Two Apple flavours.",
    badge: "LUXURY",
    icon: "Flame",
    image: "/images/hero_slide_2.jpg",
    count: 32,
    description: "Experience royal hookah pleasure without toxic charcoal combustion or mess. Enjoy authentic Al Fakher shisha molasses notes in ultra-modern electronic portable form."
  }
];

export const allProducts: ProductItem[] = [
  {
    id: "prod-1",
    slug: "kief-king-35000-disposable-vape",
    title: "Kief King 35,000 Puffs 3mg/20mg Disposable Vape",
    subtitle: "Smart HD Screen, Turbo Dual Mesh Mode & Rapid 850mAh Type-C Fast Charge",
    brand: "KIEF KING",
    category: "Disposable Vapes",
    categorySlug: "disposable-vape",
    subCategory: "Rechargeable Disposables",
    price: 49.00,
    originalPrice: 65.00,
    revs: 57,
    rating: 4.9,
    badge: "BEST SELLER",
    inStock: true,
    stockQuantity: 18,
    sku: "KK-35K-UAE-01",
    primaryImage: "/images/cat_vape_kits.png",
    images: [
      "/images/cat_vape_kits.png",
      "/images/prod_disposable.png",
      "/images/product-1.png",
      "/images/hero_slide_1.jpg"
    ],
    shortDescription: "The ultimate high-puff device engineered for the UAE market. Delivering up to 35,000 smooth puffs with twin mesh coil technology, interactive OLED battery display, and adjustable airflow control.",
    fullDescription: "Engineered for maximum reliability and extraordinary flavor consistency from puff 1 to 35,000. The Kief King 35K combines dual high-grade organic mesh coils with an intelligent power modulation chip. Users can switch between Regular Mode (35,000 puffs) and Turbo Mode (20,000 puffs with double vapor density). The crystal-clear OLED screen gives real-time feedback on battery percentage and e-liquid level so you never run out unexpectedly.",
    puffs: 35000,
    puffRange: "25000-35000",
    nicotineStrength: "20mg (2%)",
    nicotineOptions: ["20mg (2%)", "50mg (5%)", "3mg Low Nic"],
    eLiquidCapacity: "26ml Pre-filled",
    batteryCapacity: "850mAh Pure Cobalt",
    chargingType: "Type-C Fast Charging (45 min)",
    coilType: "Dual Sub-Ohm Organic Mesh (1.0Ω)",
    activation: "Draw-Activated Instant Inhale",
    flavorFamily: "fruit_ice",
    flavors: [
      { id: "fl-1", name: "Glacial Watermelon Ice", color: "#10b981", inStock: true },
      { id: "fl-2", name: "Blueberry Mountain Mist", color: "#3b82f6", inStock: true },
      { id: "fl-3", name: "Georgia Peach Mango", color: "#f97316", inStock: true },
      { id: "fl-4", name: "Miami Mint Frost", color: "#06b6d4", inStock: true },
      { id: "fl-5", name: "Double Apple Shisha Ice", color: "#ef4444", inStock: false }
    ],
    sensoryProfile: {
      sweetness: 4,
      cooling: 5,
      throatHit: 4,
      topNote: "Crisp Sugared Summer Watermelon",
      heartNote: "Crushed Ice & Ripe Berry Nectar",
      baseNote: "Sub-Zero Alpine Arctic Finish",
      ratio: "60 VG / 40 PG"
    },
    highlights: [
      { title: "35,000 Certified Puffs", desc: "Longest lasting high-capacity disposable in UAE with verified ESMA standards.", iconName: "Flame" },
      { title: "Dual Mesh Power Tech", desc: "Two synchronized heating coils prevent burning and amplify flavor fidelity.", iconName: "Zap" },
      { title: "Full Smart OLED Screen", desc: "Real-time indicators for accurate battery percentage and remaining juice level.", iconName: "Layers" },
      { title: "Adjustable Dynamic Airflow", desc: "Seamless slider to switch from tight MTL draw to smooth restricted DTL clouds.", iconName: "Wind" }
    ],
    specifications: [
      { label: "Puff Capacity", value: "Up to 35,000 Puffs" },
      { label: "E-Liquid Volume", value: "26.0 mL Pre-filled" },
      { label: "Battery Specification", value: "850 mAh Rechargeable Cobalt Cell" },
      { label: "Charging Interface", value: "USB Type-C (5V/1A)" },
      { label: "Coil Architecture", value: "Dual Integrated Mesh Matrix (1.0 Ohm)" },
      { label: "Nicotine Salt Level", value: "20mg/ml (2%) / 50mg/ml (5%)" },
      { label: "Firing Mechanism", value: "Sensor Inhale Activation" },
      { label: "Safety Protections", value: "Short Circuit, Overcharge, 10s Cut-off" }
    ],
    bundleUpsell: {
      title: "Dubai Cloud Master Essentials Bundle",
      bundlePrice: 85.00,
      savings: 22.00,
      bundleItems: [
        { id: "b-1", title: "Kief King 35K Device", price: 49.00, img: "/images/cat_vape_kits.png" },
        { id: "b-2", title: "Heavy Duty Braided Fast-Charging USB-C Cable", price: 25.00, img: "/images/prod_disposable.png" },
        { id: "b-3", title: "Vape Mart Silicone Anti-Dust Cap & Lanyard", price: 33.00, img: "/images/product-1.png" }
      ]
    },
    reviews: [
      {
        id: "rev-1",
        author: "Zayed Al-Nahyan",
        rating: 5,
        date: "March 24, 2026",
        title: "Hands down the best disposable in Dubai!",
        comment: "Flavor doesn't fade at all even after 2 weeks of heavy vaping. Screen shows the exact juice percentage. Order was delivered to Business Bay in just 1 hour 45 minutes!",
        verified: true,
        location: "Dubai Marina, UAE"
      },
      {
        id: "rev-2",
        author: "Markus Becker",
        rating: 5,
        date: "March 18, 2026",
        title: "Incredible battery life and icy hit",
        comment: "The Glacial Watermelon is unreal. Cooling is sharp and throat hit is super smooth. Type-C charges from flat to 100% in around 40 minutes.",
        verified: true,
        location: "Downtown Dubai, UAE"
      },
      {
        id: "rev-3",
        author: "Rashid K.",
        rating: 4,
        date: "March 02, 2026",
        title: "Huge puff count and authentic device",
        comment: "Scanned the QR verification sticker on the back box and it confirmed authentic first scan. Very impressed with Vape Mart UAE service.",
        verified: true,
        location: "Abu Dhabi, UAE"
      }
    ],
    faqs: [
      { q: "How long does the 35,000 puffs realistically last?", a: "For an average daily vaper taking 300 to 500 puffs per day, one Kief King 35,000 device typically lasts between 3 to 5 weeks." },
      { q: "Can I recharge this device?", a: "Yes, it features a USB Type-C charging port on the base. Use a standard 5V/1A charger for optimal battery cell lifespan." },
      { q: "How do I check if my device is 100% authentic?", a: "Every box comes with a holographic anti-counterfeit seal and a scratch-off QR code on the side. You can scan it directly with your smartphone to verify authenticity." },
      { q: "How fast is delivery across UAE?", a: "We offer 2 to 3-hour express courier delivery in Dubai, and guaranteed same-day delivery across Sharjah, Ajman, and Abu Dhabi for orders placed before 7 PM." }
    ],
    relatedSlugs: [
      "vozol-star-40000-nicotine-vape",
      "myle-meta-max-18000-disposable",
      "elf-bar-joinone-25000-pod-kit"
    ]
  },
  {
    id: "prod-2",
    slug: "vozol-star-40000-nicotine-vape",
    title: "Vozol Star 40,000 Puffs 20mg/50mg Disposable Vape",
    subtitle: "Silicone Drip Mouthpiece Protection, Dual S.i.L.C Tech & 1000mAh Battery",
    brand: "VOZOL",
    category: "Disposable Vapes",
    categorySlug: "disposable-vape",
    subCategory: "Rechargeable Disposables",
    price: 45.00,
    originalPrice: 60.00,
    revs: 55,
    rating: 4.8,
    badge: "40K PUFFS",
    inStock: true,
    stockQuantity: 24,
    sku: "VOZOL-40K-02",
    primaryImage: "/images/prod_disposable.png",
    images: [
      "/images/prod_disposable.png",
      "/images/product-2.png",
      "/images/cat_vape_kits.png",
      "/images/hero_slide_2.jpg"
    ],
    shortDescription: "Pushing the boundaries of endurance with 40,000 massive puffs, patented S.i.L.C flavor coil enhancement, and medical-grade hygienic mouthpiece cover.",
    fullDescription: "The Vozol Star 40K introduces ultra-durable eco-friendly composite construction paired with the revolutionary S.i.L.C (Smooth, Identical, Long-lasting, Clean) heating system. Zero burnt taste even during chain-vaping. Includes an attached silicone hygienic mouth cap to keep desert dust and pocket lint away.",
    puffs: 40000,
    puffRange: "35000+",
    nicotineStrength: "20mg (2%)",
    nicotineOptions: ["20mg (2%)", "50mg (5%)"],
    eLiquidCapacity: "28ml Pre-filled",
    batteryCapacity: "1000mAh Rapid Cell",
    chargingType: "Type-C Fast Charging",
    coilType: "S.i.L.C Dual Mesh",
    activation: "Draw-Activated",
    flavorFamily: "fruit_ice",
    flavors: [
      { id: "vz-1", name: "Strawberry Kiwi Ice", color: "#ef4444", inStock: true },
      { id: "vz-2", name: "Watermelon Bubblegum", color: "#10b981", inStock: true },
      { id: "vz-3", name: "Cool Mint Blast", color: "#06b6d4", inStock: true },
      { id: "vz-4", name: "Cranberry Grape", color: "#a855f7", inStock: true }
    ],
    sensoryProfile: {
      sweetness: 4,
      cooling: 4,
      throatHit: 4,
      topNote: "Candied Sweet Strawberry Nectar",
      heartNote: "Tangy Exotic Kiwi Pulp",
      baseNote: "Chilled Crystalline Spearmint",
      ratio: "65 VG / 35 PG"
    },
    highlights: [
      { title: "Record 40,000 Puffs", desc: "Long-run performance with 28ml capacity reservoir.", iconName: "Flame" },
      { title: "S.i.L.C Mesh Technology", desc: "Patented coil design prevents e-liquid spitting and harshness.", iconName: "Zap" },
      { title: "Hygienic Mouthpiece Cap", desc: "Keep mouthpiece clean and sterile wherever you travel in UAE.", iconName: "ShieldCheck" }
    ],
    specifications: [
      { label: "Puff Count", value: "40,000 Puffs" },
      { label: "E-Liquid Volume", value: "28.0 mL" },
      { label: "Battery Capacity", value: "1000 mAh" },
      { label: "Charging Port", value: "Type-C" },
      { label: "Nicotine Level", value: "20mg or 50mg" }
    ],
    reviews: [
      {
        id: "rev-201",
        author: "Faisal Mansoori",
        rating: 5,
        date: "March 20, 2026",
        title: "Best flavor in the market",
        comment: "The mouthpiece cap is a genius feature. Clean vapor, no leaking in the Dubai heat.",
        verified: true,
        location: "Sharjah, UAE"
      }
    ],
    faqs: [
      { q: "Is Vozol Star 40K rechargeable?", a: "Yes, fast Type-C charging brings the 1000mAh battery to full capacity in under 45 minutes." }
    ],
    relatedSlugs: [
      "kief-king-35000-disposable-vape",
      "myle-meta-max-18000-disposable"
    ]
  },
  {
    id: "prod-3",
    slug: "myle-meta-max-18000-disposable",
    title: "Myle Meta Max 18,000 Puff 50mg Disposable Vape",
    subtitle: "New York Engineered, Dual Tank Isolation & Anti-Leak Chamber",
    brand: "MYLE",
    category: "Disposable Vapes",
    categorySlug: "disposable-vape",
    subCategory: "Rechargeable Disposables",
    price: 50.00,
    originalPrice: 70.00,
    revs: 50,
    rating: 4.8,
    badge: "MYLE AUTHENTIC",
    inStock: true,
    stockQuantity: 15,
    sku: "MYLE-MM-18K",
    primaryImage: "/images/product-2.png",
    images: [
      "/images/product-2.png",
      "/images/prod_disposable.png",
      "/images/cat_vape_kits.png"
    ],
    shortDescription: "Signature Myle smoothness packed into an 18,000 puff high-end aluminum alloy device. Unmatched throat hit satisfaction.",
    fullDescription: "From the pioneer brand that revolutionized pod satisfaction in New York and Dubai. The Myle Meta Max features an airtight sealed reservoir, gold-plated internal contacts, and pure pharmaceutical-grade nicotine salts for ultra-crisp satisfaction.",
    puffs: 18000,
    puffRange: "12000-25000",
    nicotineStrength: "50mg (5%)",
    nicotineOptions: ["20mg (2%)", "50mg (5%)"],
    eLiquidCapacity: "20ml",
    batteryCapacity: "800mAh",
    chargingType: "Type-C",
    coilType: "Mesh Chamber",
    activation: "Draw-Activated",
    flavorFamily: "menthol",
    flavors: [
      { id: "my-1", name: "Iced Mint", color: "#06b6d4", inStock: true },
      { id: "my-2", name: "Lush Ice", color: "#10b981", inStock: true },
      { id: "my-3", name: "Red Apple", color: "#ef4444", inStock: true }
    ],
    sensoryProfile: {
      sweetness: 3,
      cooling: 5,
      throatHit: 5,
      topNote: "Pure Garden Spearmint",
      heartNote: "Crushed Peppermint Ice",
      baseNote: "Clean Sub-Zero Menthol",
      ratio: "50 VG / 50 PG"
    },
    highlights: [
      { title: "Myle Heritage Quality", desc: "Recognized worldwide for exceptional nicotine satisfaction.", iconName: "ShieldCheck" },
      { title: "Anti-Leak 5-Chamber Seal", desc: "Guaranteed zero juice leakage even in hot glove boxes.", iconName: "Lock" }
    ],
    specifications: [
      { label: "Puff Count", value: "18,000 Puffs" },
      { label: "E-Liquid", value: "20ml" },
      { label: "Nicotine", value: "50mg (5%)" }
    ],
    reviews: [
      {
        id: "rev-301",
        author: "Tareq H.",
        rating: 5,
        date: "March 15, 2026",
        title: "Very strong satisfying throat hit",
        comment: "If you like Myle pods, this has the exact same flavor profile but lasts a whole month.",
        verified: true,
        location: "Dubai, UAE"
      }
    ],
    faqs: [
      { q: "Is this genuine Myle?", a: "Yes, 100% authentic Myle product with scratch verification and UAE tax stamp." }
    ],
    relatedSlugs: [
      "kief-king-35000-disposable-vape",
      "juul2-starter-kit-slate-grey"
    ]
  },
  {
    id: "prod-4",
    slug: "elf-bar-joinone-25000-pod-kit",
    title: "Elf Bar JoinOne Ice 25,000 Puffs Pod Kit in UAE",
    subtitle: "Modular Detachable Battery & Replaceable Flavor Cartridge System",
    brand: "ELF BAR",
    category: "Disposable Vapes",
    categorySlug: "disposable-vape",
    subCategory: "Modular Pods",
    price: 50.00,
    originalPrice: 65.00,
    revs: 54,
    rating: 4.8,
    badge: "ECO MODULAR",
    inStock: true,
    stockQuantity: 20,
    sku: "ELF-J1-25K",
    primaryImage: "/images/prod_pod.png",
    images: [
      "/images/prod_pod.png",
      "/images/product-3.png",
      "/images/prod_disposable.png"
    ],
    shortDescription: "A revolutionary 2-piece design from Elf Bar. Re-use the high capacity battery base and simply replace the 25,000 puff pre-filled flavor cartridge.",
    fullDescription: "Elf Bar JoinOne transforms sustainable vaping. Instead of throwing away the entire battery when e-liquid finishes, the magnetic battery base detaches easily. You only buy replacement pods, saving money and reducing lithium waste.",
    puffs: 25000,
    puffRange: "25000-35000",
    nicotineStrength: "50mg (5%)",
    nicotineOptions: ["20mg (2%)", "50mg (5%)"],
    eLiquidCapacity: "22ml Pod Cartridge",
    batteryCapacity: "850mAh Detachable Base",
    chargingType: "USB-C",
    coilType: "QUAQ Dual Mesh 2.0",
    activation: "Draw-Activated",
    flavorFamily: "fruit_ice",
    flavors: [
      { id: "elf-1", name: "Blue Razz Ice", color: "#3b82f6", inStock: true },
      { id: "elf-2", name: "Watermelon Ice", color: "#10b981", inStock: true },
      { id: "elf-3", name: "Sour Apple Frost", color: "#84cc16", inStock: true }
    ],
    sensoryProfile: {
      sweetness: 4,
      cooling: 5,
      throatHit: 4,
      topNote: "Tangy Blue Raspberry Syrup",
      heartNote: "Sweet Candied Fruit Essence",
      baseNote: "Frosty Menthol Exhale",
      ratio: "60 VG / 40 PG"
    },
    highlights: [
      { title: "QUAQ Mesh 2.0", desc: "Up to 30% richer flavor extraction with micro-etched mesh.", iconName: "Zap" },
      { title: "Detachable Base", desc: "Eco-friendly battery reuse saves up to 40% on replacement pods.", iconName: "RefreshCcw" }
    ],
    specifications: [
      { label: "Puff Output", value: "25,000 Puffs" },
      { label: "System", value: "Detachable Battery + Pre-filled Pod" },
      { label: "Nicotine", value: "50mg / 20mg" }
    ],
    reviews: [
      {
        id: "rev-401",
        author: "Karim B.",
        rating: 5,
        date: "March 10, 2026",
        title: "Smart design from Elf Bar",
        comment: "Loving the magnetic pod system. Super cost-effective for everyday use.",
        verified: true,
        location: "Dubai Silicon Oasis, UAE"
      }
    ],
    faqs: [
      { q: "Can I buy replacement pods separately?", a: "Yes, we stock all replacement flavor cartridges at AED 30 each." }
    ],
    relatedSlugs: [
      "kief-king-35000-disposable-vape",
      "vozol-star-40000-nicotine-vape"
    ]
  },
  {
    id: "prod-5",
    slug: "juul2-starter-kit-slate-grey",
    title: "JUUL 2 Starter Kit with Slate Grey Device & 2 Pods",
    subtitle: "Next-Gen Smartphone Pairing, 20% More Battery & Enhanced Draw Sensation",
    brand: "JUUL OFFICIAL",
    category: "Pod Systems & Kits",
    categorySlug: "pods-system",
    subCategory: "Closed Pod System",
    price: 145.00,
    originalPrice: 175.00,
    revs: 110,
    rating: 4.9,
    badge: "STARTER KIT",
    inStock: true,
    stockQuantity: 12,
    sku: "JUUL2-SK-SLT",
    primaryImage: "/images/juul_product.jpg",
    images: [
      "/images/juul_product.jpg",
      "/images/product-1.png",
      "/images/hero_slide_3.jpg"
    ],
    shortDescription: "The official JUUL2 starter package with improved inhalation airflow, 70% more e-liquid per pod, and magnetic rapid USB charging dock.",
    fullDescription: "JUUL2 is engineered to provide an authentic, cigarette-like transition for adult smokers. With upgraded airflow, enhanced draw feedback, and intelligent pod authentication, it guarantees pure satisfaction with every draw. Includes Slate Grey Device, USB Charging Dock, and 2 genuine JUUL2 pods.",
    nicotineStrength: "18mg/ml (1.8%)",
    nicotineOptions: ["18mg/ml"],
    eLiquidCapacity: "1.2ml per Pod (Pack of 2)",
    batteryCapacity: "350mAh High Density",
    chargingType: "Magnetic USB Dock",
    coilType: "Ceramic Nichrome Pod",
    activation: "Intelligent Auto-Draw",
    flavorFamily: "tobacco",
    flavors: [
      { id: "j2-1", name: "Virginia Tobacco", color: "#b45309", inStock: true },
      { id: "j2-2", name: "Crisp Menthol", color: "#06b6d4", inStock: true },
      { id: "j2-3", name: "Polar Menthol", color: "#0284c7", inStock: true }
    ],
    sensoryProfile: {
      sweetness: 1,
      cooling: 2,
      throatHit: 5,
      topNote: "Sun-Cured Brightleaf Tobacco",
      heartNote: "Rich Toasted Earthy Notes",
      baseNote: "Clean Crisp Dry Exhale",
      ratio: "50 VG / 50 PG"
    },
    highlights: [
      { title: "20% Bigger Battery", desc: "Comfortably lasts the entire day on a single dock charge.", iconName: "Battery" },
      { title: "Official Authenticity Chip", desc: "Device rejects counterfeit pods automatically for consumer safety.", iconName: "ShieldCheck" },
      { title: "Cigarette-Like Tight MTL", desc: "Designed specifically to replicate traditional smoking sensation.", iconName: "Wind" }
    ],
    specifications: [
      { label: "In the Box", value: "JUUL2 Device, USB Dock, 2 Pods" },
      { label: "Finish", value: "Slate Grey Anodized Aluminum" },
      { label: "Pod Capacity", value: "1.2 mL per pod (vs 0.7ml in JUUL1)" },
      { label: "Nicotine Level", value: "18 mg/mL SaltNic" }
    ],
    reviews: [
      {
        id: "rev-501",
        author: "Omar S.",
        rating: 5,
        date: "March 22, 2026",
        title: "Finally got off cigarettes thanks to this",
        comment: "The JUUL2 Virginia Tobacco gives the exact dry cigarette feel. Authentic product with UAE ESMA sticker.",
        verified: true,
        location: "Jumeirah, Dubai"
      }
    ],
    faqs: [
      { q: "Are old JUUL1 pods compatible with JUUL2?", a: "No, JUUL2 uses larger 1.2ml pods with smart security chips designed exclusively for JUUL2 devices." }
    ],
    relatedSlugs: [
      "iqos-terea-amber-indonesian-uae",
      "uwell-caliburn-g2-pod-system"
    ]
  },
  {
    id: "prod-6",
    slug: "iqos-terea-amber-indonesian-uae",
    title: "IQOS Terea Amber Selection Indonesian in UAE (1 Carton)",
    subtitle: "Authentic Indonesian Sticks for IQOS ILUMA with Smartcore Induction Heating",
    brand: "TEREA INDO",
    category: "TEREA & HEETS",
    categorySlug: "heated-tobacco",
    subCategory: "Indonesian TEREA",
    price: 125.00,
    originalPrice: 145.00,
    revs: 84,
    rating: 4.9,
    badge: "100% INDONESIAN",
    inStock: true,
    stockQuantity: 40,
    sku: "TEREA-AMB-IND-01",
    primaryImage: "/images/terea_heets.jpg",
    images: [
      "/images/terea_heets.jpg",
      "/images/hero_slide_1.jpg",
      "/images/juul_product.jpg"
    ],
    shortDescription: "1 Carton (10 packs / 200 sticks) of genuine Indonesian TEREA Amber Selection. Rich, balanced, and roasted tobacco aroma with subtle woody tea undertones.",
    fullDescription: "Exclusively designed for IQOS ILUMA with revolutionary SMARTCORE INDUCTION SYSTEM. Each stick contains an embedded stainless steel heating element that warms the tobacco from within without burning. No blade breakage, zero tobacco residue, and no cleaning required.",
    nicotineStrength: "0.5mg Tobacco Yield",
    nicotineOptions: ["Original Yield"],
    flavorFamily: "tobacco",
    flavors: [
      { id: "tr-1", name: "Amber Selection (Roasted & Balanced)", color: "#d97706", inStock: true },
      { id: "tr-2", name: "Bronze Selection (Rich & Warm)", color: "#78350f", inStock: true },
      { id: "tr-3", name: "Purple Wave (Berry Menthol)", color: "#7e22ce", inStock: true },
      { id: "tr-4", name: "Green Zing (Herbal Citrus)", color: "#15803d", inStock: true }
    ],
    sensoryProfile: {
      sweetness: 1,
      cooling: 0,
      throatHit: 4,
      topNote: "Roasted Fine Virginia Tobacco Leaf",
      heartNote: "Delicate Nutty & Woody Essence",
      baseNote: "Subtle Warm Black Tea Nuances",
      ratio: "Pure Heated Tobacco"
    },
    highlights: [
      { title: "Blade-Free Technology", desc: "Zero cleaning, zero burnt blade smell, no ash.", iconName: "Zap" },
      { title: "Direct Indonesian Import", desc: "Authentic batch with original seals and tax inspection.", iconName: "ShieldCheck" },
      { title: "Complete Carton (200 Sticks)", desc: "10 individual packs inside sealed outer box.", iconName: "Layers" }
    ],
    specifications: [
      { label: "Quantity", value: "1 Carton (10 Packs / 200 Sticks)" },
      { label: "Origin", value: "Indonesia Official Import" },
      { label: "Compatibility", value: "IQOS ILUMA, ILUMA One, ILUMA Prime only" },
      { label: "Not Compatible With", value: "IQOS 3 Duo or older blade devices" }
    ],
    reviews: [
      {
        id: "rev-601",
        author: "Ahmed Al-Zarooni",
        rating: 5,
        date: "March 21, 2026",
        title: "Best TEREA flavor, 100% authentic",
        comment: "Fresh production batch. Clean taste and delivery within 2 hours in Dubai. Ordering my monthly cartons here.",
        verified: true,
        location: "Al Barsha, Dubai"
      }
    ],
    faqs: [
      { q: "Can I use TEREA sticks in my older IQOS 3 Duo?", a: "No! TEREA sticks contain a metal heating element and will permanently damage the heating blade of older IQOS 3 devices." }
    ],
    relatedSlugs: [
      "juul2-starter-kit-slate-grey",
      "kief-king-35000-disposable-vape"
    ]
  },
  {
    id: "prod-7",
    slug: "uwell-caliburn-g2-pod-system",
    title: "Uwell Caliburn G2 Pod System Starter Kit",
    subtitle: "Progressive Airflow Adjustment Wheel, Haptic Vibration & Pro-FOCS Tech",
    brand: "UWELL",
    category: "Pod Systems & Kits",
    categorySlug: "pods-system",
    subCategory: "Refillable Pods",
    price: 95.00,
    originalPrice: 120.00,
    revs: 112,
    rating: 4.9,
    badge: "TOP RATED",
    inStock: true,
    stockQuantity: 14,
    sku: "UW-CAL-G2-01",
    primaryImage: "/images/prod_pod.png",
    images: [
      "/images/prod_pod.png",
      "/images/product-3.png",
      "/images/cat_vape_kits.png"
    ],
    shortDescription: "The gold standard of open-system pod vaping. Features a wheel-dial precision airflow controller, haptic feedback vibrations, and replacement mesh coils.",
    fullDescription: "The Caliburn G2 is praised worldwide as the pinnacle of flavour restitution for nicotine salt e-liquids. With Uwell's patented Pro-FOCS flavor optimizing tech and a tactile wheel dial located right on the pod cartridge, vapers can tailor their draw with surgical precision.",
    nicotineStrength: "Refillable (Compatible with 20mg-50mg SaltNic)",
    nicotineOptions: ["Refillable System"],
    eLiquidCapacity: "2.0ml Refillable Pod",
    batteryCapacity: "750mAh Built-in Battery",
    chargingType: "Type-C Fast Charge",
    coilType: "UN2 Meshed-H 1.2Ω & 0.8Ω",
    activation: "Dual Draw or Button Fire",
    flavorFamily: "fruit_ice",
    flavors: [
      { id: "cg-1", name: "Space Grey", color: "#475569", inStock: true },
      { id: "cg-2", name: "Cobalt Blue", color: "#1e40af", inStock: true },
      { id: "cg-3", name: "Gradient Forest", color: "#065f46", inStock: true }
    ],
    sensoryProfile: {
      sweetness: 4,
      cooling: 3,
      throatHit: 4,
      topNote: "Pure Flavor Extraction (Coil Dependent)",
      heartNote: "Rich Warm Vapor Density",
      baseNote: "Subtle Smooth Throat Draw",
      ratio: "Ideal with 50/50 E-Liquids"
    },
    highlights: [
      { title: "Progressive Airflow Wheel", desc: "Fine-tune from ultra-tight MTL to airy cloud draw.", iconName: "Wind" },
      { title: "Haptic Vibration Alerts", desc: "Device vibrates on short circuit, low voltage, or 8s draw limit.", iconName: "Zap" },
      { title: "Pro-FOCS Flavor Tech", desc: "Recycled vapor channel enhances juice aromatics by 35%.", iconName: "Flame" }
    ],
    specifications: [
      { label: "Battery", value: "750 mAh Built-in" },
      { label: "Output Power", value: "Max 18 Watts" },
      { label: "Coil Options", value: "1.2Ω Mesh & 0.8Ω Mesh included" },
      { label: "Weight", value: "36 grams ultra-lightweight" }
    ],
    reviews: [
      {
        id: "rev-701",
        author: "Danielle M.",
        rating: 5,
        date: "March 12, 2026",
        title: "The best flavor pod kit ever created",
        comment: "Coils last 2 to 3 weeks each. Never leaks. The airflow wheel lets you make the draw as tight as you want.",
        verified: true,
        location: "Dubai Hills, UAE"
      }
    ],
    faqs: [
      { q: "What juice is recommended for Caliburn G2?", a: "We strongly recommend 50VG/50PG nicotine salt e-liquids like Tokyo or Nasty Juice." }
    ],
    relatedSlugs: [
      "juice-head-blueberry-lemon-100ml",
      "nasty-juice-asap-grape-60ml",
      "juul2-starter-kit-slate-grey"
    ]
  },
  {
    id: "prod-8",
    slug: "juice-head-blueberry-lemon-100ml",
    title: "Juice Head Blueberry Lemon 100ml Freebase E-Liquid",
    subtitle: "USA Formulated Premium High VG E-Juice with Tart Candied Lemon Zest",
    brand: "JUICE HEAD",
    category: "Premium E-Liquids",
    categorySlug: "e-liquid",
    subCategory: "Freebase 100ml",
    price: 55.00,
    originalPrice: 75.00,
    revs: 79,
    rating: 4.9,
    badge: "MADE IN USA",
    inStock: true,
    stockQuantity: 30,
    sku: "JH-BL-100ML",
    primaryImage: "/images/prod_eliquid.png",
    images: [
      "/images/prod_eliquid.png",
      "/images/product-2.png",
      "/images/cat_vape_kits.png"
    ],
    shortDescription: "A delectable medley of fresh plump forest blueberries intertwined with juicy Californian Meyer lemon nectar. High VG formulation for monster cloud production.",
    fullDescription: "Juice Head Blueberry Lemon represents California artisan e-liquid craft at its finest. Rich, succulent sweet blueberries dance on the inhale, while tangy freshly-squeezed lemon peel awakens the senses on the exhale. Formulated with 70VG/30PG for smooth sub-ohm tank and RDA performance.",
    nicotineStrength: "3mg / 6mg",
    nicotineOptions: ["3mg Low", "6mg Medium", "0mg Zero"],
    eLiquidCapacity: "100ml Chubby Gorilla Bottle",
    flavorFamily: "fruit_ice",
    flavors: [
      { id: "jh-1", name: "Blueberry Lemon Original", color: "#3b82f6", inStock: true },
      { id: "jh-2", name: "Blueberry Lemon Freeze (Iced)", color: "#06b6d4", inStock: true }
    ],
    sensoryProfile: {
      sweetness: 4,
      cooling: 2,
      throatHit: 3,
      topNote: "Wild Mountain Sweet Blueberries",
      heartNote: "Tangy Meyer Lemon Pulp",
      baseNote: "Subtle Sweet Candied Citrus Peel",
      ratio: "70 VG / 30 PG"
    },
    highlights: [
      { title: "Authentic USA Formula", desc: "Manufactured in ISO-certified laboratories in Southern California.", iconName: "ShieldCheck" },
      { title: "Pure Cloud Formulation", desc: "70% Vegetable Glycerin produces dense aromatic vapor clouds.", iconName: "Droplets" }
    ],
    specifications: [
      { label: "Bottle Size", value: "100 mL" },
      { label: "Nicotine Strengths", value: "3mg / 6mg / 0mg" },
      { label: "Country of Origin", value: "United States of America" }
    ],
    reviews: [
      {
        id: "rev-801",
        author: "Liam O'Connor",
        rating: 5,
        date: "March 08, 2026",
        title: "All-day vape perfection",
        comment: "Not too overly sweet, the tart lemon balances out the blueberry perfectly. Coils stay super clean.",
        verified: true,
        location: "Dubai, UAE"
      }
    ],
    faqs: [
      { q: "Can I use this 100ml in my small pod kit?", a: "This is a 70VG high-thickness liquid designed for sub-ohm vape kits and high-wattage coils (above 25W). For small pods, consider nicotine salts instead." }
    ],
    relatedSlugs: [
      "uwell-caliburn-g2-pod-system",
      "nasty-juice-asap-grape-60ml"
    ]
  },
  {
    id: "prod-9",
    slug: "nasty-juice-asap-grape-60ml",
    title: "Nasty Juice ASAP Grape 60ml High VG E-Liquid",
    subtitle: "World Famous Malaysian Black Grape & Ripe Berry Blend with Signature Low Mint",
    brand: "NASTY JUICE",
    category: "Premium E-Liquids",
    categorySlug: "e-liquid",
    subCategory: "Freebase 60ml",
    price: 48.00,
    originalPrice: 65.00,
    revs: 91,
    rating: 4.9,
    badge: "WORLD BEST",
    inStock: true,
    stockQuantity: 28,
    sku: "NASTY-AG-60",
    primaryImage: "/images/prod_eliquid.png",
    images: [
      "/images/prod_eliquid.png",
      "/images/cat_vape_kits.png",
      "/images/product-1.png"
    ],
    shortDescription: "Award-winning black grape concoction combined with other sweet berries, producing a delicious grape vapor breath with gentle low-mint chill.",
    fullDescription: "ASAP Grape by Nasty Juice has won dozens of international vaping awards for good reason. Bitter and sweet notes of black grape are married with sparkling berries and finished with Nasty's trademark subtle mint coolness.",
    nicotineStrength: "3mg / 6mg",
    nicotineOptions: ["3mg", "6mg"],
    eLiquidCapacity: "60ml Signature Aluminum Bottle",
    flavorFamily: "fruit_ice",
    flavors: [
      { id: "ns-1", name: "ASAP Grape", color: "#a855f7", inStock: true }
    ],
    sensoryProfile: {
      sweetness: 5,
      cooling: 3,
      throatHit: 3,
      topNote: "Deep Black Vineyard Grape",
      heartNote: "Crushed Raspberry & Currant Juice",
      baseNote: "Subtle Malaysian Low-Mint",
      ratio: "70 VG / 30 PG"
    },
    highlights: [
      { title: "Aluminum Tin Packaging", desc: "Protects delicate e-liquid compounds from UV and heat degradation.", iconName: "ShieldCheck" },
      { title: "Multi-Award Winner", desc: "Voted #1 Best Fruit E-Liquid at global vape expos.", iconName: "Star" }
    ],
    specifications: [
      { label: "Bottle", value: "60 mL Aluminum Canister" },
      { label: "VG/PG Ratio", value: "70% VG / 30% PG" },
      { label: "Origin", value: "Nasty Worldwide Labs" }
    ],
    reviews: [
      {
        id: "rev-901",
        author: "Kareem T.",
        rating: 5,
        date: "March 05, 2026",
        title: "Classic flavor that never gets old",
        comment: "I've been vaping ASAP Grape since 2018 in Dubai. Vape Mart has the 100% original version with authentic hologram.",
        verified: true,
        location: "Mirdif, Dubai"
      }
    ],
    faqs: [
      { q: "Is this genuine Nasty Juice?", a: "Yes, complete with tamper-evident seal and security scratch check." }
    ],
    relatedSlugs: [
      "juice-head-blueberry-lemon-100ml",
      "uwell-caliburn-g2-pod-system"
    ]
  },
  {
    id: "prod-10",
    slug: "al-fakher-crown-bar-8000-shisha",
    title: "Al Fakher Crown Bar 8000 Puffs DTL Disposable E-Shisha",
    subtitle: "Authentic Al Fakher Two Apple Shisha Sensation with Direct-To-Lung Cloud Draw",
    brand: "AL FAKHER",
    category: "E-Shisha & Hookah",
    categorySlug: "shisha-hookah",
    subCategory: "Electronic Shisha",
    price: 40.00,
    originalPrice: 55.00,
    revs: 91,
    rating: 4.9,
    badge: "AUTHENTIC SHISHA",
    inStock: true,
    stockQuantity: 35,
    sku: "AF-CB-8K-01",
    primaryImage: "/images/cat_vape_kits.png",
    images: [
      "/images/cat_vape_kits.png",
      "/images/prod_disposable.png",
      "/images/hero_slide_2.jpg"
    ],
    shortDescription: "Created by the world's #1 shisha molasses master. Delivers the legendary Al Fakher Two Apples and Grape Mint taste with direct-to-lung cloud volume.",
    fullDescription: "Experience authentic shisha culture anywhere in the UAE. The Al Fakher Crown Bar 8000 is specially calibrated for DTL (Direct To Lung) draws to mimic real hookah pipes with thick, satisfying white clouds. Powered by a 600mAh rechargeable battery and 0.6Ω sub-ohm mesh.",
    puffs: 8000,
    puffRange: "6000-10000",
    nicotineStrength: "5mg (0.5%) Shisha Nicotine",
    nicotineOptions: ["5mg Low Shisha Nicotine"],
    eLiquidCapacity: "18ml Pre-filled",
    batteryCapacity: "600mAh Rechargeable",
    chargingType: "Type-C Fast Charge",
    coilType: "Sub-Ohm 0.6Ω Hookah Mesh",
    activation: "Draw-Activated High Flow",
    flavorFamily: "tobacco",
    flavors: [
      { id: "af-1", name: "Two Apple Shisha Classic", color: "#16a34a", inStock: true },
      { id: "af-2", name: "Grape Mint Shisha", color: "#9333ea", inStock: true },
      { id: "af-3", name: "Magic Love Shisha Fusion", color: "#ec4899", inStock: true },
      { id: "af-4", name: "Gum Mint Cool", color: "#06b6d4", inStock: true }
    ],
    sensoryProfile: {
      sweetness: 4,
      cooling: 3,
      throatHit: 3,
      topNote: "Sweet Red Anise & Green Crisp Apple",
      heartNote: "Rich Arabic Shisha Molasses Nectar",
      baseNote: "Subtle Chilled Hookah Water Finish",
      ratio: "Hookah Cloud Formulation"
    },
    highlights: [
      { title: "Direct-to-Lung Draw", desc: "Special 0.6Ω coil replicates huge fluffy shisha cloud density.", iconName: "Flame" },
      { title: "Al Fakher Heritage Flavor", desc: "Made directly with master extract formulas from Al Fakher.", iconName: "ShieldCheck" }
    ],
    specifications: [
      { label: "Puff Rating", value: "Up to 8,000 DTL Puffs" },
      { label: "Nicotine Level", value: "5mg/ml (0.5% Smooth Shisha Level)" },
      { label: "Coil Resistance", value: "0.6 Ohm Sub-Ohm Cloud Mesh" }
    ],
    reviews: [
      {
        id: "rev-1001",
        author: "Hamdan Al-Maktoum",
        rating: 5,
        date: "March 19, 2026",
        title: "Exact Two Apples shisha cafe taste",
        comment: "This literally tastes identical to sitting at a Dubai shisha cafe smoking Al Fakher Double Apple. Incredible.",
        verified: true,
        location: "Downtown Dubai, UAE"
      }
    ],
    faqs: [
      { q: "Is the nicotine level high?", a: "No, it is formulated at 5mg (0.5%), giving you a super smooth shisha experience without high nicotine throat bite." }
    ],
    relatedSlugs: [
      "kief-king-35000-disposable-vape",
      "iqos-terea-amber-indonesian-uae"
    ]
  }
];

export function getProductBySlug(slug: string): ProductItem | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): ProductItem[] {
  if (!categorySlug || categorySlug === "all") return allProducts;
  return allProducts.filter((p) => p.categorySlug === categorySlug);
}

export function getAllProducts(): ProductItem[] {
  return allProducts;
}

export function getCategoryBySlug(slug: string): CollectionCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getRelatedProducts(slug: string): ProductItem[] {
  const current = getProductBySlug(slug);
  if (!current) return allProducts.slice(0, 4);
  const related = allProducts.filter((p) => current.relatedSlugs?.includes(p.slug) || (p.categorySlug === current.categorySlug && p.slug !== slug));
  return related.length > 0 ? related.slice(0, 4) : allProducts.filter((p) => p.slug !== slug).slice(0, 4);
}

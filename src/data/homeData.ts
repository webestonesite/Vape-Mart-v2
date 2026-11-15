import themeData from "@/data/theme-published.json";

export interface HomeProduct {
  title: string;
  price: string;
  revs: number;
  badge?: string;
  brand?: string;
  img: string;
  slug?: string;
}

export type Product = HomeProduct;

export const bestSellingProducts: HomeProduct[] = [
  { title: "KIEF King 35000 Puffs Disposable Vape", price: "45.00", revs: 57, badge: "VAPOR UAE", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/KIEFKing35000PuffsDisposableVape.webp?v=1781160145" },
  { title: "Vozol Star 40000 Puffs Disposable Vape", price: "40.00", revs: 55, badge: "BEST SELLER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_40000_Puffs_Disposable_Vape_devices_3_different_flavor.webp?v=1785160523" },
  { title: "Waka Blade 50K Puffs 50mg in Dubai, UAE", price: "55.00", revs: 50, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaBlade50KPuffs50mginDubai_UAE.webp?v=1776947486" },
  { title: "ELFBAR BC10000 Puffs Disposable Vape 20mg Nicotine/50 mg nicotine", price: "35.00", revs: 54, badge: "7% OFF", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/ELFBAR_BC10000_Puffs_Disposable_Vape_20mg_Nicotine_with_peach_and_mango_slices.jpg?v=1780560836" },
  { title: "OXBAR Tri Fusion 45K Disposable Vape", price: "45.00", revs: 42, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/OXBARTriFusion45KDisposableVape.webp?v=1781421347" },
  { title: "VGOD SaltNic e-liquids 25 mg and 50 mg", price: "30.00", revs: 39, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IcedCherryLime.jpg?v=1753208462" },
  { title: "Mazaya 50K Cloud Aura", price: "49.00", revs: 48, badge: "TOP", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Mazaya50KCloudAura.webp?v=1781098994" },
  { title: "Nasty Juice 3MG Freebase E-Liquid 60ml", price: "30.00", revs: 62, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Nasty_Juice_3mg_e-liquid_bottle_Blackcurrant_Bad_Blood_flavors_device_with_box.jpg?v=1783152654" }
];

export const tereaHeetsProducts: HomeProduct[] = themeData.tereaHeets?.products ?? [
  { title: "IQOS Terea Amber Selection Indonesian in UAE", price: "100.00", revs: 84, badge: "BEST SELLER", brand: "TEREA INDO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Bronze Selection Indonesian Sticks", price: "100.00", revs: 67, badge: "POPULAR", brand: "TEREA INDO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Purple Wave Menthol Heated Sticks", price: "100.00", revs: 92, badge: "COOL", brand: "TEREA INDO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Sienna Balanced Warm Tobacco", price: "100.00", revs: 48, badge: "", brand: "TEREA ILUMA", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Green Zing Crisp Herbal Menthol", price: "100.00", revs: 53, badge: "FRESH", brand: "TEREA ILUMA", img: "/images/terea_heets.jpg" },
  { title: "IQOS Heets Bronze Selection Arabic Version", price: "100.00", revs: 76, badge: "CLASSIC", brand: "HEETS DUO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Heets Amber Selection Smooth Rich Flavor", price: "100.00", revs: 61, badge: "", brand: "HEETS DUO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Heets Silver Selection Subtle Refined Tobacco", price: "100.00", revs: 39, badge: "", brand: "HEETS DUO", img: "/images/terea_heets.jpg" }
];

export const juulProductsList: HomeProduct[] = themeData.juulProducts?.products ?? [
  { title: "JUUL 2 Starter Kit with Slate Grey Device & 2 Pods", price: "90.00", revs: 110, badge: "STARTER KIT", brand: "JUUL OFFICIAL", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Device with USB Magnetic Charging Dock", price: "80.00", revs: 88, badge: "DEVICE ONLY", brand: "JUUL OFFICIAL", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Virginia Tobacco Pods 18mg (Pack of 2)", price: "65.00", revs: 142, badge: "TOP RATED", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Crisp Menthol Pods 18mg Nicotine 2-Pack", price: "65.00", revs: 96, badge: "ICE", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Polar Menthol Pods 18mg Extra Fresh", price: "65.00", revs: 74, badge: "POPULAR", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Ruby Menthol Wild Berry Pods 2-Pack", price: "65.00", revs: 81, badge: "NEW", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Autumn Tobacco Rich Blend Pods 2-Pack", price: "65.00", revs: 58, badge: "", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Tropical Medley Pods 18mg (Pack of 2)", price: "65.00", revs: 43, badge: "NEW", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" }
];


export const newArrivalsProducts: HomeProduct[] = [
  { title: "Lost Mary 35000 Puffs Disposable Vape", price: "40.00", revs: 12, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/LostMary35KAll.jpg?v=1751907873" },
  { title: "Geek Bar 50000 Puffs Disposable Vape", price: "45.00", revs: 18, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/GeekBar50000PuffsDisposableVape.webp?v=1781109060" },
  { title: "HQD Cuvie Slick 6000 Puff Disposable Vape", price: "45.00", revs: 22, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/HQD6kPuffsStrawberryBanana.jpg?v=1751791607" },
  { title: "Pod Salt Go 2500 Puffs Disposable Vape", price: "30.00", revs: 41, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Go_2500_Puffs_Disposable_Vape_Banana_Ice.jpg?v=1783234943" },
  { title: "Tugboat T12000 Puffs Disposable Vape 50MG Rechargeable", price: "35.00", revs: 15, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Tugboat_T12000_Puffs_Disposable_Vape_50mg_salt_nicotine_Black_Ice_Flavor.jpg?v=1778391844" },
  { title: "Waka SoPro 20000 Puffs 50mg in Dubai, UAE", price: "50.00", revs: 29, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaSoPro20000Puffs50mginDubai_UAE.webp?v=1776946302" },
  { title: "Pod Salt Onyx Cloud 25000 Puffs Disposable Vape", price: "40.00", revs: 31, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Onyx_Cloud_25000_Puffs_Disposable_Vape_Blue_Mist_Flavor.jpg?v=1781358608" },
  { title: "Pod Salt Pearl Pro 10000 Puffs Disposable Vape", price: "35.00", revs: 24, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Pearl_Pro_10000_Puffs_Disposable_Vape_device_Berry_Menthol_flavor.jpg?v=1781355904" }
];

export const mostPopularProducts: HomeProduct[] = [
  { title: "Yuoto XXL 2500 Puffs Disposable Vape", price: "20.00", revs: 85, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/117e2871-5a8f-42ab-a108-21939a2e6bc8.jpg?v=1750872314" },
  { title: "IQOS TEREA Uzbekistan", price: "110.00", revs: 43, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IQOS_TEREA_Uzbekistan_Twilight_Pearl_flavor_pack.png?v=1784621433" },
  { title: "JUUL 2 Starter Kit", price: "90.00", revs: 112, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Juul_2_Starter_Kit_packaging_with_device_and_USB_cable.jpg?v=1786199894" },
  { title: "Nasty Juice 3MG Freebase E-Liquid 60ml", price: "30.00", revs: 67, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Nasty_Juice_3mg_e-liquid_bottle_Blackcurrant_Bad_Blood_flavors_device_with_box.jpg?v=1783152654" },
  { title: "Vozol Star 35000 Puffs Disposable Vape", price: "45.00", revs: 76, badge: "TRENDING", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_35000_Puffs_Disposable_Vape_Appricot_Watermelon_Ice_Flavor.jpg?v=1789477966" },
  { title: "AL Fakher Hypermax 15k Puffs", price: "50.00", revs: 91, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/ALFakherHypermax15kPuffs.webp?v=1781161964" },
  { title: "Al Fakher Mega Max 40000 Puffs Disposable Vape", price: "50.00", revs: 98, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/AlFakherMegaMax40000PuffsDisposableVape.webp?v=1781161097" },
  { title: "Geek Bar 50000 Puffs Disposable Vape", price: "45.00", revs: 88, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/GeekBar50000PuffsDisposableVape.webp?v=1781109060" }
];

export interface MatchedFlavorProduct {
  title: string;
  price: string;
  rating: number;
  revs: number;
  img: string;
  badge?: string;
}

export interface FlavorItem {
  id: string;
  title: string;
  category: string;
  tag: string;
  desc: string;
  productCount: number;
  img: string;
  accentColor: string;
  ringColor: string;
  sweetness: number;
  cooling: number;
  throatHit: number;
  topNote: string;
  heartNote: string;
  baseNote: string;
  ratio: string;
  family: "berries" | "menthol" | "tropical" | "dessert";
  matchedProducts: MatchedFlavorProduct[];
}

export const flavorsData: FlavorItem[] = [
  {
    id: "strawberry",
    title: "Strawberry Garden",
    category: "LUSH ORCHARD & BERRIES",
    tag: "SIGNATURE BLEND",
    desc: "Sun-drenched California strawberries picked at peak ripeness, infused with delicate nectar sweetness and subtle velvet vapor.",
    productCount: 42,
    img: "/images/flavors/strawberry.jpg",
    accentColor: "#ef4444",
    ringColor: "ring-rose-500",
    sweetness: 5,
    cooling: 2,
    throatHit: 3,
    topNote: "Sun-ripened Sweet Strawberry",
    heartNote: "Rich Wild Berry Nectar",
    baseNote: "Velvet Cream & Mild Mist",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "VGOD SaltNic e-liquids 25 mg and 50 mg", price: "30.00", rating: 4.9, revs: 88, badge: "TOP SELLER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IcedCherryLime.jpg?v=1753208462" },
      { title: "Vozol Star 35000 Puffs Disposable Vape", price: "45.00", rating: 4.8, revs: 76, badge: "TRENDING", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_35000_Puffs_Disposable_Vape_Appricot_Watermelon_Ice_Flavor.jpg?v=1789477966" }
    ]
  },
  {
    id: "watermelon",
    title: "Watermelon Glacial Ice",
    category: "LUSH ORCHARD & BERRIES",
    tag: "GLOBAL BEST SELLER",
    desc: "Crisp succulent red watermelon wedges layered with crushed arctic glacier menthol for an exhilarating refreshing throat hit.",
    productCount: 48,
    img: "/images/flavors/watermelon.jpg",
    accentColor: "#10b981",
    ringColor: "ring-emerald-500",
    sweetness: 4,
    cooling: 5,
    throatHit: 4,
    topNote: "Crisp Sweet Watermelon Rind",
    heartNote: "Succulent Red Melon Puree",
    baseNote: "Sub-Zero Alpine Glacier Freeze",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Pod Salt Onyx Cloud 25000 Puffs Disposable Vape", price: "40.00", rating: 4.9, revs: 94, badge: "BEST SELLER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Onyx_Cloud_25000_Puffs_Disposable_Vape_Blue_Mist_Flavor.jpg?v=1781358608" },
      { title: "Waka Blade 50K Puffs 50mg in Dubai, UAE", price: "55.00", rating: 5.0, revs: 112, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaBlade50KPuffs50mginDubai_UAE.webp?v=1776947486" }
    ]
  },
  {
    id: "mint",
    title: "Cool Spearmint Frost",
    category: "ARCTIC FROST & MENTHOL",
    tag: "ARCTIC HIT",
    desc: "Fresh garden spearmint leaves crushed over pure crystalline menthol, delivering crisp palate-cleansing coolness on every draw.",
    productCount: 39,
    img: "/images/flavors/mint.jpg",
    accentColor: "#06b6d4",
    ringColor: "ring-cyan-500",
    sweetness: 2,
    cooling: 5,
    throatHit: 5,
    topNote: "Fresh Garden Spearmint Leaf",
    heartNote: "Double Distilled Peppermint Essence",
    baseNote: "Crystal Menthol Chill",
    ratio: "50 VG / 50 PG",
    family: "menthol",
    matchedProducts: [
      { title: "Nasty Juice 3MG Freebase E-Liquid 60ml", price: "30.00", rating: 4.9, revs: 83, badge: "ARCTIC", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Nasty_Juice_3mg_e-liquid_bottle_Blackcurrant_Bad_Blood_flavors_device_with_box.jpg?v=1783152654" },
      { title: "JUUL Slate Device", price: "80.00", rating: 4.9, revs: 112, badge: "RECOMMENDED", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IMG_3894JUUL_Slate_device_and_packaging.jpg?v=1786259181" }
    ]
  },
  {
    id: "peach",
    title: "Juicy Georgia Peach",
    category: "LUSH ORCHARD & BERRIES",
    tag: "POPULAR PICK",
    desc: "Golden velvety Georgia peach nectar layered with delicate white blossom honey and a light soothing vapor exhale.",
    productCount: 34,
    img: "/images/flavors/peach.png",
    accentColor: "#f97316",
    ringColor: "ring-orange-500",
    sweetness: 4,
    cooling: 3,
    throatHit: 3,
    topNote: "Sun-warmed Golden Peach Skin",
    heartNote: "Velvety Peach Nectar & Pulp",
    baseNote: "Wild Blossom Floral Honey",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Pod Salt Pearl Pro 10000 Puffs Disposable Vape", price: "35.00", rating: 4.8, revs: 64, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Pearl_Pro_10000_Puffs_Disposable_Vape_device_Berry_Menthol_flavor.jpg?v=1781355904" },
      { title: "Vozol Star 40000 Puffs Disposable Vape", price: "40.00", rating: 4.8, revs: 71, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_40000_Puffs_Disposable_Vape_devices_3_different_flavor.webp?v=1785160523" }
    ]
  },
  {
    id: "grape",
    title: "Purple Concord Grape",
    category: "LUSH ORCHARD & BERRIES",
    tag: "TRENDING",
    desc: "Deep vineyard Concord grapes bursting with natural tart sweetness, candied skin zest, and sparkling chilled vapor.",
    productCount: 36,
    img: "/images/flavors/grape.png",
    accentColor: "#a855f7",
    ringColor: "ring-purple-500",
    sweetness: 4,
    cooling: 4,
    throatHit: 3,
    topNote: "Dark Concord Grape Skin Zest",
    heartNote: "Rich Purple Grape Jam Nectar",
    baseNote: "Effervescent Chilled Soda Finish",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Pod Salt Go 2500 Puffs Disposable Vape", price: "30.00", rating: 4.9, revs: 91, badge: "CLASSIC", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Go_2500_Puffs_Disposable_Vape_Banana_Ice.jpg?v=1783234943" },
      { title: "AL Fakher Hypermax 15k Puffs", price: "50.00", rating: 4.9, revs: 85, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/ALFakherHypermax15kPuffs.webp?v=1781161964" }
    ]
  },
  {
    id: "blueberry",
    title: "Blueberry Mountain Mist",
    category: "ARCTIC FROST & MENTHOL",
    tag: "TOP RATED",
    desc: "Plump wild forest blueberries chilled with a touch of crushed mountain snow and tart citrus undertones.",
    productCount: 52,
    img: "/images/flavors/blueberry.png",
    accentColor: "#3b82f6",
    ringColor: "ring-blue-500",
    sweetness: 3,
    cooling: 4,
    throatHit: 3,
    topNote: "Fresh Wild Blueberries",
    heartNote: "Subtle Tart Blackberry Juice",
    baseNote: "Crisp Mountain Breeze Ice",
    ratio: "70 VG / 30 PG",
    family: "menthol",
    matchedProducts: [
      { title: "Yuoto XXL 2500 Puffs Disposable Vape", price: "20.00", rating: 4.9, revs: 79, badge: "TOP RATED", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/117e2871-5a8f-42ab-a108-21939a2e6bc8.jpg?v=1750872314" },
      { title: "Geek Bar 50000 Puffs Disposable Vape", price: "45.00", rating: 4.8, revs: 98, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/GeekBar50000PuffsDisposableVape.webp?v=1781109060" }
    ]
  },
  {
    id: "pineapple",
    title: "Golden Hawaiian Pineapple",
    category: "TROPICAL & CITRUS",
    tag: "ISLAND EXOTIC",
    desc: "Tangy sweet Maui golden pineapples dripping with sun-drenched island juice and cool coastal sea spray.",
    productCount: 29,
    img: "/images/flavors/pineapple.png",
    accentColor: "#eab308",
    ringColor: "ring-amber-500",
    sweetness: 4,
    cooling: 4,
    throatHit: 3,
    topNote: "Bright Tangy Pineapple Crown",
    heartNote: "Sun-Ripened Golden Island Core",
    baseNote: "Chilled Coconut Water Mist",
    ratio: "70 VG / 30 PG",
    family: "tropical",
    matchedProducts: [
      { title: "HQD Cuvie Slick 6000 Puff Disposable Vape", price: "45.00", rating: 4.9, revs: 58, badge: "EXOTIC", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/HQD6kPuffsStrawberryBanana.jpg?v=1751791607" },
      { title: "Mazaya 50K Cloud Aura", price: "49.00", rating: 4.7, revs: 63, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Mazaya50KCloudAura.webp?v=1781098994" }
    ]
  },
  {
    id: "lychee",
    title: "Exotic Asian Lychee",
    category: "TROPICAL & CITRUS",
    tag: "RARE ARTISAN",
    desc: "Fragrant translucent imperial lychee fruit with delicate natural rosewater perfume and a silky refreshing finish.",
    productCount: 26,
    img: "/images/flavors/lychee.png",
    accentColor: "#ec4899",
    ringColor: "ring-pink-500",
    sweetness: 4,
    cooling: 3,
    throatHit: 2,
    topNote: "Fresh Lychee Floral Bloom",
    heartNote: "Sweet Translucent Fruit Pulp",
    baseNote: "Delicate Rosewater & Light Frost",
    ratio: "50 VG / 50 PG",
    family: "tropical",
    matchedProducts: [
      { title: "Lost Mary 35000 Puffs Disposable Vape", price: "40.00", rating: 4.9, revs: 52, badge: "RARE GOURMET", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/LostMary35KAll.jpg?v=1751907873" },
      { title: "JUUL 2 Starter Kit", price: "90.00", rating: 4.9, revs: 112, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Juul_2_Starter_Kit_packaging_with_device_and_USB_cable.jpg?v=1786199894" }
    ]
  },
  {
    id: "mixed_berry",
    title: "Forest Berry Medley",
    category: "LUSH ORCHARD & BERRIES",
    tag: "ALL-DAY VAPE",
    desc: "Sophisticated fusion of dark tart blackberries, sweet wild raspberries, and deep red currants balanced with subtle frost.",
    productCount: 45,
    img: "/images/flavors/mixed_berry.png",
    accentColor: "#8b5cf6",
    ringColor: "ring-violet-500",
    sweetness: 4,
    cooling: 4,
    throatHit: 3,
    topNote: "Tangy Ripe Raspberries",
    heartNote: "Rich Forest Blackberries",
    baseNote: "Dark Blackcurrant Spark & Ice",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Waka SoPro 20000 Puffs 50mg in Dubai, UAE", price: "50.00", rating: 4.9, revs: 92, badge: "FAVORITE", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaSoPro20000Puffs50mginDubai_UAE.webp?v=1776946302" },
      { title: "Al Fakher Mega Max 40000 Puffs Disposable Vape", price: "50.00", rating: 4.8, revs: 84, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/AlFakherMegaMax40000PuffsDisposableVape.webp?v=1781161097" }
    ]
  },
  {
    id: "vanilla",
    title: "Madagascan Vanilla Custard",
    category: "ARTISAN CREAM & DESSERT",
    tag: "GOURMET LUXURY",
    desc: "Aged Madagascan vanilla bean pods steeped in warm rich golden egg custard, whipped velvet cream, and toasted caramel drizzle.",
    productCount: 28,
    img: "/images/flavors/vanilla.png",
    accentColor: "#d97706",
    ringColor: "ring-amber-600",
    sweetness: 5,
    cooling: 1,
    throatHit: 4,
    topNote: "Fragrant Madagascan Vanilla Bean",
    heartNote: "Golden Creamy Custard Pudding",
    baseNote: "Toasted Brown Sugar & Butter",
    ratio: "80 VG / 20 PG",
    family: "dessert",
    matchedProducts: [
      { title: "Tugboat T12000 Puffs Disposable Vape 50MG Rechargeable", price: "35.00", rating: 5.0, revs: 67, badge: "AWARD WINNER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Tugboat_T12000_Puffs_Disposable_Vape_50mg_salt_nicotine_Black_Ice_Flavor.jpg?v=1778391844" },
      { title: "OXBAR Tri Fusion 45K Disposable Vape", price: "45.00", rating: 4.8, revs: 98, badge: "RESERVE", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/OXBARTriFusion45KDisposableVape.webp?v=1781421347" }
    ]
  },
  {
    id: "orange",
    title: "Valencia Sparkling Citrus",
    category: "TROPICAL & CITRUS",
    tag: "CITRUS BLISS",
    desc: "Sun-drenched Spanish Valencia oranges cold-pressed over effervescent mineral tonic and chilled shaved ice.",
    productCount: 31,
    img: "/images/flavors/orange.png",
    accentColor: "#ea580c",
    ringColor: "ring-orange-600",
    sweetness: 3,
    cooling: 3,
    throatHit: 3,
    topNote: "Zesty Orange Peel Oils",
    heartNote: "Sweet Valencia Orange Juice",
    baseNote: "Effervescent Chilled Tonic",
    ratio: "70 VG / 30 PG",
    family: "tropical",
    matchedProducts: [
      { title: "ELFBAR BC10000 Puffs Disposable Vape 20mg Nicotine/50 mg nicotine", price: "35.00", rating: 4.8, revs: 55, badge: "REFRESHING", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/ELFBAR_BC10000_Puffs_Disposable_Vape_20mg_Nicotine_with_peach_and_mango_slices.jpg?v=1780560836" },
      { title: "Vozol Star 35000 Puffs Disposable Vape", price: "45.00", rating: 4.7, revs: 49, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_35000_Puffs_Disposable_Vape_Appricot_Watermelon_Ice_Flavor.jpg?v=1789477966" }
    ]
  },
  {
    id: "cheesecake",
    title: "New York Caramel Cheesecake",
    category: "ARTISAN CREAM & DESSERT",
    tag: "CONFECTIONERY RESERVE",
    desc: "Dense velvety cream cheese whipped over buttery honey-graham biscuit crust with sea salt caramel ribbon.",
    productCount: 22,
    img: "/images/flavors/cheesecake.png",
    accentColor: "#b45309",
    ringColor: "ring-amber-700",
    sweetness: 5,
    cooling: 0,
    throatHit: 4,
    topNote: "Buttery Honey-Graham Crust",
    heartNote: "Rich Dense New York Cream Cheese",
    baseNote: "Warm Fleur de Sel Caramel",
    ratio: "80 VG / 20 PG",
    family: "dessert",
    matchedProducts: [
      { title: "VGOD SaltNic e-liquids 25 mg and 50 mg", price: "30.00", rating: 4.9, revs: 43, badge: "GOURMET", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IcedCherryLime.jpg?v=1753208462" },
      { title: "JUUL Slate Device", price: "80.00", rating: 4.9, revs: 112, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IMG_3894JUUL_Slate_device_and_packaging.jpg?v=1786259181" }
    ]
  }
];

export interface BlogPost {
  id: number;
  handle: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  image: string;
  badgeBg: string;
  author: string;
}

export const blogPostsData: BlogPost[] = [
  {
    id: 1,
    handle: "disposable-vs-pod-system-which-is-right-for-you",
    title: "Disposable vs Pod System: Which Is Right for You?",
    category: "BUYING GUIDES",
    readTime: "6 min read",
    date: "October 12, 2026",
    excerpt: "Torn between a grab-and-go disposable and a refillable pod system? We break down cost, flavour, convenience and who each one suits best in the UAE.",
    image: "/images/blog_1.png",
    badgeBg: "bg-emerald-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 2,
    handle: "best-disposable-vapes-uae-2026",
    title: "Best Disposable Vapes in UAE 2026: Top Picks and Buying Guide",
    category: "BUYING GUIDES",
    readTime: "8 min read",
    date: "October 18, 2026",
    excerpt: "We tested the best-selling disposables in the Emirates for flavour, puff count, battery life and value. Here are our top 5 picks for 2026, plus how to choose and how to spot fakes.",
    image: "/images/blog_2.png",
    badgeBg: "bg-amber-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 3,
    handle: "how-to-spot-fake-vapes-in-uae",
    title: "How to Spot Fake Vapes in the UAE (5 Checks)",
    category: "SAFETY",
    readTime: "5 min read",
    date: "October 8, 2026",
    excerpt: "Counterfeit vapes are everywhere in the Emirates. Learn the five quick checks our team uses to verify every product before it reaches your hands.",
    image: "/images/blog_3.png",
    badgeBg: "bg-blue-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 4,
    handle: "nicotine-strength-guide-uae-vapers",
    title: "Nicotine Strength Guide: 20mg vs 50mg Explained",
    category: "EDUCATION",
    readTime: "7 min read",
    date: "October 3, 2026",
    excerpt: "Confused by 2% vs 5%, 20mg vs 50mg? This plain-English guide explains nicotine salts, what each strength feels like, and how to pick yours.",
    image: "/images/hero_slide_1.jpg",
    badgeBg: "bg-purple-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 5,
    handle: "uae-vape-laws-2026-what-you-need-to-know",
    title: "UAE Vape Laws in 2026: What Every Vaper Must Know",
    category: "REGULATIONS",
    readTime: "8 min read",
    date: "September 14, 2026",
    excerpt: "Age limits, where you can vape, import rules, and ESMA certification — the essential legal guide for vapers in the Emirates.",
    image: "/images/hero_slide_3.jpg",
    badgeBg: "bg-rose-600 text-white",
    author: "Vape Mart Team"
  }
];


export   const HERO_SLIDES = [
    {
      title: "Original TEREA Sticks\nReal Tobacco, Zero Ash",
      desc: "If you've already got an IQOS, you don't need a new device - you need sticks you can trust. That's why a lot of vapers treat Vape Mart as the best Terea shop in Dubai: original sticks, in the amber and menthol blends that sell out first, with fast delivery across the UAE.",
      badge: "TEREA in Dubai",
      image: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Terea_Vapes_in_the_UAE_1ccd890a-83bb-416b-9262-d6ff447fd9c5.webp?v=1794245460",
      buttonText: "Shop TEREA Sticks",
      buttonLink: "/collections/terea",
    },
    {
      title: "IQOS ILUMA Devices\nHeat it, don't burn it",
      desc: "New to heated tobacco? It's simple - the device heats the stick instead of burning it, so you get real tobacco taste without ash. Buy your IQOS online from Vape Mart, the best IQOS shop in Dubai for devices and TEREA sticks together.",
      badge: "IQOS in Dubai",
      image: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IQOS_ILUMA_Devices_In_Dubai_11ee32ec-a088-4623-a569-75cc8c5914f8.webp?v=1794245760",
      buttonText: "Shop IQOS",
      buttonLink: "/collections/iqos",
    },
    {
      title: "JUUL Pods That Just Work\nSmall, simple, no fuss",
      desc: "No buttons to learn, no liquid to spill, you just click a pod in and go. Vape Mart is the best JUUL shop in Dubai for authentic starter kits and pods, from Virginia Tobacco and Mint to fruit ice, Juul 1 comes with 3% and 5% and Juul 2 18mg salt nicotine.",
      badge: "JUUL & JUUL 2 in Dubai",
      image: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/JUUL_JUUL_2_in_Dubai_37e88fa5-1654-49d9-bda1-7717d644e4c9.webp?v=1794245758",
      buttonText: "Shop JUUL",
      buttonLink: "/collections/juul",
    },
    {
      title: "Disposable Vapes\nReady to Go, no refilling",
      desc: "Open the pack and you're set. From a compact ELFBAR for the weekend to a big Waka Blade 50K for daily use, you'll find high-performance disposables at Vape Mart, the best vape shop in Dubai for disposable vapes, with cash on delivery across the UAE.",
      badge: "Disposable Vapes in the UAE",
      image: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/disposables_result_d1fa53d0-e3da-4409-a1d3-477e82f71631.webp?v=1794245290",
      buttonText: "Shop Disposables",
      buttonLink: "/collections/disposable-vape",
    },
  ];

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
    title: "Strawberry",
    category: "Ripe Strawberry & Summer Sweet",
    tag: "BERRY CLASSIC",
    desc: "Sun-ripened strawberries, sweet and juicy with a soft candy finish. Tastes like the real fruit, not a syrup.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_strawberry_result.webp?v=1794774391",
    accentColor: "#ef4444",
    ringColor: "ring-rose-500",
    sweetness: 4,
    cooling: 1,
    throatHit: 3,
    topNote: "Fresh Picked Strawberry",
    heartNote: "Ripe Red Berry",
    baseNote: "Soft Sweet Finish",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "VGOD SaltNic e-liquids 25 mg and 50 mg", price: "30.00", rating: 4.9, revs: 88, badge: "TOP SELLER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IcedCherryLime.jpg?v=1753208462" },
      { title: "Vozol Star 35000 Puffs Disposable Vape", price: "45.00", rating: 4.8, revs: 76, badge: "TRENDING", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_35000_Puffs_Disposable_Vape_Appricot_Watermelon_Ice_Flavor.jpg?v=1789477966" }
    ]
  },
  {
    id: "pineapple",
    title: "Pineapple",
    category: "Golden Pineapple & Citrus",
    tag: "TROPICAL HIT",
    desc: "Golden pineapple, bright and tangy with a juicy tropical bite that wakes your taste buds up.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_pineapple_result.webp?v=1794774388",
    accentColor: "#eab308",
    ringColor: "ring-amber-500",
    sweetness: 4,
    cooling: 1,
    throatHit: 3,
    topNote: "Fresh Cut Pineapple",
    heartNote: "Golden Tropical Juice",
    baseNote: "Light Citrus Zest",
    ratio: "70 VG / 30 PG",
    family: "tropical",
    matchedProducts: [
      { title: "HQD Cuvie Slick 6000 Puff Disposable Vape", price: "45.00", rating: 4.9, revs: 58, badge: "EXOTIC", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/HQD6kPuffsStrawberryBanana.jpg?v=1751791607" },
      { title: "Mazaya 50K Cloud Aura", price: "49.00", rating: 4.7, revs: 63, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Mazaya50KCloudAura.webp?v=1781098994" }
    ]
  },
  {
    id: "watermelon",
    title: "Watermelon",
    category: "Watermelon & Cool Menthol",
    tag: "SUMMER ICE",
    desc: "Crisp watermelon, cool and juicy like the first bite on a hot day in Dubai.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_watermelon_result.webp?v=1794774397",
    accentColor: "#10b981",
    ringColor: "ring-emerald-500",
    sweetness: 4,
    cooling: 2,
    throatHit: 3,
    topNote: "Crisp Watermelon",
    heartNote: "Juicy Melon Flesh",
    baseNote: "Cool Summer Finish",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Pod Salt Onyx Cloud 25000 Puffs Disposable Vape", price: "40.00", rating: 4.9, revs: 94, badge: "BEST SELLER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Onyx_Cloud_25000_Puffs_Disposable_Vape_Blue_Mist_Flavor.jpg?v=1781358608" },
      { title: "Waka Blade 50K Puffs 50mg in Dubai, UAE", price: "55.00", rating: 5.0, revs: 112, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaBlade50KPuffs50mginDubai_UAE.webp?v=1776947486" }
    ]
  },
  {
    id: "mixed_berry",
    title: "Berry",
    category: "Wild Berries & Dark Fruit",
    tag: "MIXED BERRY",
    desc: "A mix of dark berries, sweet up front with a tart edge that keeps it from getting boring.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_berry_result.webp?v=1794774365",
    accentColor: "#8b5cf6",
    ringColor: "ring-violet-500",
    sweetness: 3,
    cooling: 1,
    throatHit: 3,
    topNote: "Wild Blueberry",
    heartNote: "Blackberry & Raspberry",
    baseNote: "Tart Berry Finish",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Waka SoPro 20000 Puffs 50mg in Dubai, UAE", price: "50.00", rating: 4.9, revs: 92, badge: "FAVORITE", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaSoPro20000Puffs50mginDubai_UAE.webp?v=1776946302" },
      { title: "Al Fakher Mega Max 40000 Puffs Disposable Vape", price: "50.00", rating: 4.8, revs: 84, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/AlFakherMegaMax40000PuffsDisposableVape.webp?v=1781161097" }
    ]
  },
  {
    id: "lychee",
    title: "Lychee",
    category: "Lychee & Floral Sweet",
    tag: "EXOTIC SWEET",
    desc: "Soft lychee, floral and sweet with a light juicy finish. Different from the usual fruit flavours, in a good way.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_lychee_result.webp?v=1794774375",
    accentColor: "#ec4899",
    ringColor: "ring-pink-500",
    sweetness: 4,
    cooling: 1,
    throatHit: 2,
    topNote: "Fresh Lychee",
    heartNote: "Soft Floral Bloom",
    baseNote: "Light Sweet Finish",
    ratio: "50 VG / 50 PG",
    family: "tropical",
    matchedProducts: [
      { title: "Lost Mary 35000 Puffs Disposable Vape", price: "40.00", rating: 4.9, revs: 52, badge: "RARE GOURMET", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/LostMary35KAll.jpg?v=1751907873" },
      { title: "JUUL 2 Starter Kit", price: "90.00", rating: 4.9, revs: 112, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Juul_2_Starter_Kit_packaging_with_device_and_USB_cable.jpg?v=1786199894" }
    ]
  },
  {
    id: "blue_razz",
    title: "Blue Razz",
    category: "Blue Raspberry & Cool Ice",
    tag: "CANDY ICE",
    desc: "Blue raspberry, sweet and tangy with a cool icy bite. The one people come back for.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_blue_razz_result.webp?v=1794774368",
    accentColor: "#3b82f6",
    ringColor: "ring-blue-500",
    sweetness: 4,
    cooling: 3,
    throatHit: 3,
    topNote: "Blue Raspberry",
    heartNote: "Tangy Berry Candy",
    baseNote: "Cool Ice Finish",
    ratio: "70 VG / 30 PG",
    family: "menthol",
    matchedProducts: [
      { title: "Yuoto XXL 2500 Puffs Disposable Vape", price: "20.00", rating: 4.9, revs: 79, badge: "TOP RATED", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/117e2871-5a8f-42ab-a108-21939a2e6bc8.jpg?v=1750872314" },
      { title: "Geek Bar 50000 Puffs Disposable Vape", price: "45.00", rating: 4.8, revs: 98, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/GeekBar50000PuffsDisposableVape.webp?v=1781109060" }
    ]
  },
  {
    id: "cheesecake",
    title: "Cheesecake",
    category: "Cheesecake & Cream",
    tag: "DESSERT",
    desc: "Creamy cheesecake, rich and smooth with a soft baked biscuit finish. A dessert vape, through and through.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_cheesecake_result.webp?v=1794774371",
    accentColor: "#b45309",
    ringColor: "ring-amber-700",
    sweetness: 5,
    cooling: 0,
    throatHit: 4,
    topNote: "Cream Cheese",
    heartNote: "Baked Biscuit Base",
    baseNote: "Sweet Vanilla Cream",
    ratio: "80 VG / 20 PG",
    family: "dessert",
    matchedProducts: [
      { title: "VGOD SaltNic e-liquids 25 mg and 50 mg", price: "30.00", rating: 4.9, revs: 43, badge: "GOURMET", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IcedCherryLime.jpg?v=1753208462" },
      { title: "JUUL Slate Device", price: "80.00", rating: 4.9, revs: 112, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IMG_3894JUUL_Slate_device_and_packaging.jpg?v=1786259181" }
    ]
  },
  {
    id: "vanilla",
    title: "Vanilla",
    category: "Vanilla & Cream",
    tag: "DESSERT CLASSIC",
    desc: "Smooth vanilla, warm and creamy with a soft sweet finish. Simple, and it works with everything.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_vanilla_result.webp?v=1794774394",
    accentColor: "#d97706",
    ringColor: "ring-amber-600",
    sweetness: 4,
    cooling: 0,
    throatHit: 3,
    topNote: "Madagascar Vanilla",
    heartNote: "Sweet Cream",
    baseNote: "Warm Vanilla Finish",
    ratio: "80 VG / 20 PG",
    family: "dessert",
    matchedProducts: [
      { title: "Tugboat T12000 Puffs Disposable Vape 50MG Rechargeable", price: "35.00", rating: 5.0, revs: 67, badge: "AWARD WINNER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Tugboat_T12000_Puffs_Disposable_Vape_50mg_salt_nicotine_Black_Ice_Flavor.jpg?v=1778391844" },
      { title: "OXBAR Tri Fusion 45K Disposable Vape", price: "45.00", rating: 4.8, revs: 98, badge: "RESERVE", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/OXBARTriFusion45KDisposableVape.webp?v=1781421347" }
    ]
  },
  {
    id: "peach",
    title: "Peach",
    category: "Ripe Peach & Summer",
    tag: "STONE FRUIT",
    desc: "Ripe peach, soft and juicy with a gentle sweetness that never gets too much.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_peach_result.webp?v=1794774385",
    accentColor: "#f97316",
    ringColor: "ring-orange-500",
    sweetness: 4,
    cooling: 1,
    throatHit: 3,
    topNote: "Sun-Ripened Peach",
    heartNote: "Juicy Peach Flesh",
    baseNote: "Soft Sweet Finish",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Pod Salt Pearl Pro 10000 Puffs Disposable Vape", price: "35.00", rating: 4.8, revs: 64, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Pearl_Pro_10000_Puffs_Disposable_Vape_device_Berry_Menthol_flavor.jpg?v=1781355904" },
      { title: "Vozol Star 40000 Puffs Disposable Vape", price: "40.00", rating: 4.8, revs: 71, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_40000_Puffs_Disposable_Vape_devices_3_different_flavor.webp?v=1785160523" }
    ]
  },
  {
    id: "mango",
    title: "Mango",
    category: "Ripe Mango & Tropical",
    tag: "TROPICAL",
    desc: "Ripe mango, thick and juicy with a sunny tropical sweetness. Tastes like the fruit at its best.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_mango_result.webp?v=1794774378",
    accentColor: "#f59e0b",
    ringColor: "ring-amber-500",
    sweetness: 5,
    cooling: 1,
    throatHit: 3,
    topNote: "Alphonso Mango",
    heartNote: "Tropical Mango Pulp",
    baseNote: "Sweet Sunny Finish",
    ratio: "70 VG / 30 PG",
    family: "tropical",
    matchedProducts: [
      { title: "Pod Salt Go 2500 Puffs Disposable Vape", price: "30.00", rating: 4.9, revs: 91, badge: "CLASSIC", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Go_2500_Puffs_Disposable_Vape_Banana_Ice.jpg?v=1783234943" },
      { title: "AL Fakher Hypermax 15k Puffs", price: "50.00", rating: 4.9, revs: 85, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/ALFakherHypermax15kPuffs.webp?v=1781161964" }
    ]
  },
  {
    id: "mint",
    title: "Cool Spearmint Frost",
    category: "Arctic Frost & Menthol",
    tag: "ARCTIC HIT",
    desc: "Fresh garden spearmint leaves crushed over pure crystalline menthol, delivering crisp palate-cleansing coolness on every draw.",
    productCount: 39,
    img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/flavor_mint_menthol_result.webp?v=1794774382",
    accentColor: "#06b6d4",
    ringColor: "ring-cyan-500",
    sweetness: 2,
    cooling: 5,
    throatHit: 5,
    topNote: "Fresh Garden Spearmint Leaf",
    heartNote: "Double Distilled Peppermint",
    baseNote: "Crystal Menthol Chill",
    ratio: "50 VG / 50 PG",
    family: "menthol",
    matchedProducts: [
      { title: "Nasty Juice 3MG Freebase E-Liquid 60ml", price: "30.00", rating: 4.9, revs: 83, badge: "ARCTIC", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Nasty_Juice_3mg_e-liquid_bottle_Blackcurrant_Bad_Blood_flavors_device_with_box.jpg?v=1783152654" },
      { title: "JUUL Slate Device", price: "80.00", rating: 4.9, revs: 112, badge: "RECOMMENDED", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IMG_3894JUUL_Slate_device_and_packaging.jpg?v=1786259181" }
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
    handle: "best-selling-juul-pod-flavors-dubai",
    title: "Best-Selling Juul Pod Flavors in Dubai Right Now",
    category: "BUYING GUIDES",
    readTime: "5 min read",
    date: "November 18, 2026",
    excerpt: "Discover the most popular Juul pod flavors flying off the shelves in Dubai. From classic tobacco to crisp menthol and fruity blends, find out which pods local vapers are loving most right now.",
    image: "/images/blog_juul_flavors.webp",
    badgeBg: "bg-emerald-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 2,
    handle: "ultimate-guide-terea-flavors-dubai",
    title: "The Ultimate Guide to Terea Flavors Available in Dubai",
    category: "FLAVOR GUIDE",
    readTime: "7 min read",
    date: "November 16, 2026",
    excerpt: "Explore the complete lineup of IQOS Terea sticks available across Dubai. Whether you prefer rich, roasted tobacco or a refreshing cooling sensation, this guide breaks down every flavor profile to help you find your perfect match.",
    image: "/images/blog_terea_guide.webp",
    badgeBg: "bg-amber-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 3,
    handle: "iqos-iluma-vs-juul-which-should-you-buy",
    title: "IQOS Iluma vs. JUUL: Which Should You Buy Right Now",
    category: "COMPARISON",
    readTime: "6 min read",
    date: "November 14, 2026",
    excerpt: "Torn between heated tobacco and traditional pod vaping? Compare the IQOS Iluma and JUUL across flavor variety, battery life, convenience, and cost to decide which device fits your lifestyle best.",
    image: "/images/blog_iqos_vs_juul.webp",
    badgeBg: "bg-blue-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 4,
    handle: "disposable-vs-pod-system-which-is-right-for-you",
    title: "Disposable vs Pod System: Which Is Right for You?",
    category: "BUYING GUIDES",
    readTime: "6 min read",
    date: "October 12, 2026",
    excerpt: "Torn between a grab-and-go disposable and a refillable pod system? We break down cost, flavour, convenience and who each one suits best in the UAE.",
    image: "/images/blog_1.png",
    badgeBg: "bg-purple-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 5,
    handle: "best-disposable-vapes-uae-2026",
    title: "Best Disposable Vapes in UAE 2026: Top Picks and Buying Guide",
    category: "BUYING GUIDES",
    readTime: "8 min read",
    date: "October 18, 2026",
    excerpt: "We tested the best-selling disposables in the Emirates for flavour, puff count, battery life and value. Here are our top 5 picks for 2026, plus how to choose and how to spot fakes.",
    image: "/images/blog_2.png",
    badgeBg: "bg-rose-600 text-white",
    author: "Vape Mart Team"
  }
];

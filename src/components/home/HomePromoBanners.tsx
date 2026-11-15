"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer, slideInLeft, slideInRight } from "./animations";
import { cdnWidth } from "@/lib/cdn";

export interface PromoBannerData {
  eyebrow?: string;
  title?: string;
  desc?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
}

interface HomePromoBannersProps {
  banner1?: PromoBannerData;
  banner2?: PromoBannerData;
  order?: number;
}

export function HomePromoBanners({
  banner1 = {},
  banner2 = {},
  order = 2,
}: HomePromoBannersProps) {
  const router = useRouter();

  return (
    <motion.section
      className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8 sm:mt-12 md:mt-16 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
      style={{ order }}
    >
      {/* Banner 1: Kits & Pods */}
      <motion.div
        className="group relative min-h-[250px] sm:min-h-[300px] md:min-h-[320px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-[#064e3b] to-emerald-900 shadow-[0_20px_40px_-15px_rgba(6,78,59,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(6,78,59,0.4)] transition-all duration-500 hover:-translate-y-1 border border-emerald-800"
        variants={slideInLeft}
      >
        <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col justify-center h-full p-6 sm:p-10 md:p-12 w-full sm:w-2/3 pr-20 sm:pr-0">
          <span className="font-cinzel text-emerald-400 font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase mb-1.5 sm:mb-2">
            {banner1.eyebrow || "Exclusive"}
          </span>
          <h2 className="font-luxury text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-2.5 sm:mb-4 drop-shadow-md">
            {banner1.title || "Vape Kits & Pod Systems"}
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm mb-5 sm:mb-8">
            {banner1.desc ||
              "High-performance vape kits in Dubai for daily use. Small pods that fit your pocket, and bigger kits when you want more power and control, all genuine and priced in AED."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => {
              router.prefetch(banner1.buttonLink || "/collections");
            }}
            onClick={() => {
              router.push(banner1.buttonLink || "/collections");
            }}
            className="bg-white text-[#064e3b] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all w-max shadow-lg flex items-center gap-2 pr-4 group-hover:pr-6 duration-300 cursor-pointer relative overflow-hidden group/btn"
          >
            <span className="relative z-10">{banner1.buttonText || "Shop Kits"}</span>
            <ArrowRight
              size={15}
              className="relative z-10 transition-transform duration-300 transform group-hover/btn:translate-x-1"
            />
            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none"></span>
          </motion.button>
        </div>
        {banner1.image ? (
          <img
            src={cdnWidth(banner1.image, 500)}
            alt={banner1.title || "Vape Kits"}
            className="absolute -right-4 -bottom-4 sm:-bottom-8 w-44 sm:w-56 md:w-64 h-auto object-contain transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] opacity-50 sm:opacity-90 md:opacity-100"
          />
        ) : null}
      </motion.div>

      {/* Banner 2: Premium Vapes */}
      <motion.div
        className="group relative min-h-[250px] sm:min-h-[300px] md:min-h-[320px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-[#d97706] to-amber-700 shadow-[0_20px_40px_-15px_rgba(217,119,6,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(217,119,6,0.4)] transition-all duration-500 hover:-translate-y-1 border border-amber-600"
        variants={slideInRight}
      >
        <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col justify-center h-full p-6 sm:p-10 md:p-12 w-full sm:w-2/3 pr-20 sm:pr-0">
          <span className="font-cinzel text-amber-200 font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase mb-1.5 sm:mb-2">
            {banner2.eyebrow || "New Arrival"}
          </span>
          <h2 className="font-luxury text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-2.5 sm:mb-4 drop-shadow-md">
            {banner2.title || "Premium Vape Collection"}
          </h2>
          <p className="text-amber-100/80 text-xs sm:text-sm mb-5 sm:mb-8">
            {banner2.desc ||
              "The newest devices just landed at Vape Mart UAE. If you're after something fresh, strong on flavour and built to last, start here."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => {
              router.prefetch(banner2.buttonLink || "/collections");
            }}
            onClick={() => {
              router.push(banner2.buttonLink || "/collections");
            }}
            className="bg-white text-[#d97706] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-amber-50 transition-all w-max shadow-lg flex items-center gap-2 pr-4 group-hover:pr-6 duration-300 cursor-pointer relative overflow-hidden group/btn"
          >
            <span className="relative z-10">{banner2.buttonText || "Shop Premium"}</span>
            <ArrowRight
              size={15}
              className="relative z-10 transition-transform duration-300 transform group-hover/btn:translate-x-1"
            />
            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none"></span>
          </motion.button>
        </div>
        {banner2.image ? (
          <img
            src={cdnWidth(banner2.image, 500)}
            alt={banner2.title || "Premium Vape"}
            className="absolute -right-4 bottom-0 w-44 sm:w-56 md:w-64 h-auto object-contain transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] opacity-50 sm:opacity-90 md:opacity-100"
          />
        ) : null}
      </motion.div>
    </motion.section>
  );
}

export default HomePromoBanners;


"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight } from "lucide-react";
import { staggerContainer } from "./animations";
import { flavorsData, type FlavorItem } from "@/data/homeData";
import { cdnWidth } from "@/lib/cdn";

interface HomeFlavorArcDialProps {
  order?: number;
  flavors?: FlavorItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function HomeFlavorArcDial({
  order = 6,
  flavors: customFlavors,
  title = "Signature Flavours",
  subtitle = "Turn the dial and find your flavour. If you're not sure where to start, pick the one that sounds like you and go from there.",
  badge,
}: HomeFlavorArcDialProps) {
  const flavors = Array.isArray(customFlavors) && customFlavors.length > 0 ? customFlavors : flavorsData;
  const [activeArcIdx, setActiveArcIdx] = useState<number>(0);
  const [isArcAutoplay, setIsArcAutoplay] = useState<boolean>(true);
  const isArcHovered = useRef<boolean>(false);
  const flavorsSectionRef = useRef<HTMLElement | null>(null);
  const [isFlavorsVisible, setIsFlavorsVisible] = useState<boolean>(true);

  useEffect(() => {
    const el = flavorsSectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsFlavorsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isArcAutoplay || !isFlavorsVisible) return;
    const timer = setInterval(() => {
      if (!isArcHovered.current) {
        setActiveArcIdx((prev) => (prev + 1) % flavors.length);
      }
    }, 1300);
    return () => clearInterval(timer);
  }, [isArcAutoplay, isFlavorsVisible, flavors.length]);

  const currentArcFlavor = flavors[activeArcIdx] || flavors[0];

  return (
    <motion.section
      id="flavors"
      ref={flavorsSectionRef}
      className="relative max-w-[1380px] w-full mx-auto px-4 sm:px-6 my-16 md:my-24 select-none"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={staggerContainer}
      style={{ order }}
    >
      {/* Section Header with Site Royal Emerald & Amber Accents */}
      <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
        <span className="font-cinzel text-xs font-black tracking-[0.25em] text-[#064e3b] bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full uppercase mb-3 shadow-2xs">
          {badge || `TASTE THE EXTRAORDINARY • ${flavors.length} ARTISAN BLENDS`}
        </span>
        <h2 className="font-luxury text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#064e3b] tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-neutral-600 text-sm sm:text-base max-w-xl">
          {subtitle}
        </p>
      </div>

      {/* Luxury Arch Horizon Stage - Warm Ivory & Emerald Satin Pedestal */}
      <div className="relative rounded-[36px] sm:rounded-[48px] bg-gradient-to-b from-[#f8fbf9] via-[#ffffff] to-[#f2f8f5] border-2 border-[#064e3b]/20 shadow-[0_24px_70px_-15px_rgba(6,78,59,0.14)] p-6 sm:p-10 md:p-12 overflow-hidden flex flex-col items-center">
        {/* Top Amber & Emerald Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-emerald-500/10 via-amber-400/5 to-transparent pointer-events-none" />

        {/* Ambient Flavor Accent Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[380px] rounded-full blur-[110px] pointer-events-none transition-all duration-700"
          style={{ background: currentArcFlavor.accentColor, opacity: 0.22 }}
        />

        {/* Navigation Controls */}
        <div className="w-full flex items-center justify-end z-20 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveArcIdx((prev) => (prev - 1 + flavors.length) % flavors.length)}
              aria-label="Previous flavor"
              className="w-9 h-9 rounded-full bg-white border border-[#064e3b]/30 text-[#064e3b] hover:bg-[#064e3b] hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={() => setIsArcAutoplay(!isArcAutoplay)}
              aria-label={isArcAutoplay ? "Pause autoplay" : "Start autoplay"}
              className="px-4 py-1.5 rounded-full bg-white border border-[#064e3b]/30 text-[#064e3b] text-xs font-black hover:bg-emerald-50 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {isArcAutoplay ? <Pause size={12} className="text-[#064e3b]" /> : <Play size={12} className="text-[#064e3b]" />}
              <span className="text-[11px] uppercase tracking-wider">{isArcAutoplay ? "Auto-Rotating" : "Paused"}</span>
            </button>
            <button
              onClick={() => setActiveArcIdx((prev) => (prev + 1) % flavors.length)}
              aria-label="Next flavor"
              className="w-9 h-9 rounded-full bg-white border border-[#064e3b]/30 text-[#064e3b] hover:bg-[#064e3b] hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* The 3D Curved Arc Display Stage */}
        <div 
          className="relative w-full max-w-[960px] h-[280px] sm:h-[320px] md:h-[350px] flex items-center justify-center my-4 overflow-visible"
          style={{ perspective: "1200px" }}
        >
          {/* SVG Horological Arc Track with Emerald & Gold Details */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 960 350">
            <defs>
              <linearGradient id="arcEmeraldGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.1" />
                <stop offset="25%" stopColor="#064e3b" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#064e3b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Primary Outer Solid Arc Track */}
            <path
              d="M 60,270 Q 480,45 900,270"
              fill="none"
              stroke="#064e3b"
              strokeWidth="2.5"
              strokeOpacity="0.25"
            />

            {/* Inner Gold Precision Dotted Dial Track */}
            <path
              d="M 100,275 Q 480,70 860,275"
              fill="none"
              stroke="url(#arcEmeraldGold)"
              strokeWidth="2"
              strokeDasharray="6 8"
            />

            {/* Dial Ticks & Anchor Pivot Dots */}
            <circle cx="480" cy="45" r="4" fill="#d97706" />
            <circle cx="340" cy="80" r="3.5" fill="#064e3b" opacity="0.6" />
            <circle cx="620" cy="80" r="3.5" fill="#064e3b" opacity="0.6" />
            <circle cx="200" cy="150" r="3" fill="#064e3b" opacity="0.4" />
            <circle cx="760" cy="150" r="3" fill="#064e3b" opacity="0.4" />
          </svg>

          {/* 3D Arc Dial Nodes - High Contrast & Continuous Marquee Flow */}
          {flavors.map((flv: FlavorItem, idx: number) => {
            const total = flavors.length;
            let diff = (idx - activeArcIdx) % total;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            if (Math.abs(diff) > 3) return null;

            const isCenter = diff === 0;
            const isAdjacent = Math.abs(diff) === 1;
            const isSecondary = Math.abs(diff) === 2;

            return (
              <motion.div
                key={flv.id}
                onClick={() => setActiveArcIdx(idx)}
                onMouseEnter={() => { isArcHovered.current = true; }}
                onMouseLeave={() => { isArcHovered.current = false; }}
                animate={{
                  x: diff * 155,
                  y: Math.pow(diff, 2) * 20,
                  z: -Math.abs(diff) * 50,
                  rotateY: -diff * 12,
                  scale: isCenter ? 1.35 : isAdjacent ? 1.05 : isSecondary ? 0.88 : 0.70,
                  opacity: isCenter ? 1 : isAdjacent ? 0.95 : isSecondary ? 0.70 : 0,
                }}
                transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
                className={`absolute cursor-pointer transition-transform ${
                  isCenter ? "z-30" : "z-10 hover:opacity-100 hover:scale-110"
                }`}
              >
                {/* Ring Bezel with Brand Color & Accent Outline */}
                <div
                  className={`relative rounded-full p-2 bg-white transition-all duration-300 flex items-center justify-center ${
                    isCenter
                      ? "w-28 h-28 sm:w-36 sm:h-36 shadow-[0_20px_45px_rgba(6,78,59,0.28)] ring-4 ring-[#d97706] border-4 border-[#064e3b]"
                      : isAdjacent
                      ? "w-22 h-22 sm:w-26 sm:h-26 shadow-lg border-2 border-[#064e3b]/40 ring-2 ring-emerald-500/10"
                      : "w-18 h-18 sm:w-22 sm:h-22 shadow-md border-2 border-neutral-300"
                  }`}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden shadow-inner">
                    <Image
                      src={cdnWidth(flv.img, 240)}
                      alt={flv.title}
                      fill
                      sizes="(max-width: 640px) 110px, 150px"
                      className="object-cover"
                      priority={isCenter}
                    />
                  </div>

                  {/* Flavor Badge */}
                  {isCenter ? (
                    <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#064e3b] border-2 border-amber-300/60 shadow-lg text-[11px] font-black tracking-wider uppercase whitespace-nowrap text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{flv.title}</span>
                    </div>
                  ) : (
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white/95 border border-[#064e3b]/30 shadow-xs text-[9px] sm:text-[10px] font-extrabold text-[#064e3b] whitespace-nowrap">
                      {flv.title.split(' ')[0]}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Center Details Showcase Card */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentArcFlavor.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative z-20 w-full max-w-2xl bg-white/98 rounded-3xl border-2 border-[#064e3b]/20 shadow-[0_20px_50px_-10px_rgba(6,78,59,0.12)] p-6 sm:p-8 flex flex-col items-center text-center mt-3 overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#064e3b] via-[#d97706] to-[#064e3b]" />

            <div className="flex items-center gap-2 mb-2 pt-1">
              <span
                className="px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white shadow-xs"
                style={{ backgroundColor: currentArcFlavor.accentColor }}
              >
                {currentArcFlavor.tag}
              </span>
              <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
                {currentArcFlavor.category}
              </span>
            </div>

            <h3 className="font-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#064e3b] tracking-tight leading-tight mb-2">
              {currentArcFlavor.title}
            </h3>

            <p className="text-neutral-700 text-xs sm:text-sm max-w-lg leading-relaxed mb-4 font-medium">
              {currentArcFlavor.desc}
            </p>

            <div className="w-full grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] mb-4">
              <div>
                <span className="text-[9px] font-black tracking-wider uppercase text-[#064e3b] block mb-0.5">TOP NOTE</span>
                <span className="font-extrabold text-neutral-900 line-clamp-1">{currentArcFlavor.topNote}</span>
              </div>
              <div>
                <span className="text-[9px] font-black tracking-wider uppercase text-[#064e3b] block mb-0.5">HEART NOTE</span>
                <span className="font-extrabold text-neutral-900 line-clamp-1">{currentArcFlavor.heartNote}</span>
              </div>
              <div>
                <span className="text-[9px] font-black tracking-wider uppercase text-[#064e3b] block mb-0.5">BASE FINISH</span>
                <span className="font-extrabold text-neutral-900 line-clamp-1">{currentArcFlavor.baseNote}</span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-3.5 text-xs font-bold text-neutral-700">
                <span className="flex items-center gap-1.5">
                  Sweet: <span className="text-amber-600 font-black">{currentArcFlavor.sweetness}/5</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span className="flex items-center gap-1.5">
                  Ice: <span className="text-cyan-700 font-black">{currentArcFlavor.cooling}/5</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span className="text-[#064e3b] font-black">
                  {currentArcFlavor.productCount}+ Blends
                </span>
              </div>

              <motion.a
                href={currentArcFlavor.id ? `/search?q=${encodeURIComponent(currentArcFlavor.title.split(' ')[0])}` : "/collections"}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#064e3b] to-[#043729] hover:from-[#043729] hover:to-[#064e3b] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-950/20 border border-amber-400/40 flex items-center gap-2 cursor-pointer no-underline transition-all"
              >
                <span>Shop {currentArcFlavor.title}</span>
                <ArrowRight size={14} className="text-amber-300" />
              </motion.a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

export default HomeFlavorArcDial;

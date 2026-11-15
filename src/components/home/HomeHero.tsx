"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { HERO_SLIDES } from "@/data/homeData";
import { cdnWidth } from "@/lib/cdn";

interface HomeHeroProps {
  cmsHeroSlides?: Array<{ position?: number | string; imageUrl?: string }>;
  order?: number;
}

export function HomeHero({ cmsHeroSlides = [], order = 1 }: HomeHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const cmsHeroByPos = new Map(
    (cmsHeroSlides || []).map((s) => [Number(s.position) || 0, s.imageUrl || ""])
  );

  const slides = HERO_SLIDES.map((s, i) => {
    const cmsImg = cmsHeroByPos.get(i + 1) || "";
    const img = cmsImg || s.image;
    return { ...s, image: cdnWidth(img, 800) };
  });

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full h-[580px] sm:h-[640px] md:h-[650px] lg:h-[700px] overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#064e3b] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ order }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full bg-teal-500/20 blur-[120px] pointer-events-none" />

      {/* Sliders arrows */}
      <motion.button
        whileHover={{ scale: 1.15, x: -3 }}
        whileTap={{ scale: 0.9 }}
        className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white hover:text-[#064e3b] transition-colors shadow-lg cursor-pointer"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.15, x: 3 }}
        whileTap={{ scale: 0.9 }}
        className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white hover:text-[#064e3b] transition-colors shadow-lg cursor-pointer"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </motion.button>

      {/* Swipe Track for Content and Image */}
      <div className="absolute inset-0 z-20">
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${(currentSlide * 100) / slides.length}%)`,
          }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="h-full flex items-center relative"
              style={{ width: `${100 / slides.length}%` }}
            >
              <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 w-full flex flex-col md:flex-row items-center justify-between pb-12 md:pb-0">
                {/* Content */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-20 pt-4 md:pt-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-emerald-400/15 to-amber-500/15 border border-amber-400/30 mb-3 sm:mb-6 shadow-sm backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="font-cinzel text-amber-300 font-bold text-[10px] sm:text-[11px] tracking-[0.25em] uppercase">
                      {slide.badge}
                    </span>
                  </div>

                  <h1 className="font-luxury text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[68px] font-extrabold text-white leading-[1.12] mb-3 sm:mb-6 tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                    {slide.title.split("\n")[0]}
                    {slide.title.split("\n")[1] && (
                      <span className="block mt-1 sm:mt-2 font-luxury italic font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
                        {slide.title.split("\n")[1]}
                      </span>
                    )}
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-emerald-50/85 leading-relaxed mb-6 sm:mb-10 max-w-sm sm:max-w-lg font-normal tracking-wide line-clamp-3 sm:line-clamp-none">
                    {slide.desc}
                  </p>

                  <motion.a
                    href={slide.buttonLink || "/collections"}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative bg-white text-[#064e3b] px-7 py-3 sm:px-9 sm:py-4 rounded-full font-extrabold text-sm sm:text-base hover:bg-emerald-50 transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_40px_rgba(52,211,153,0.35)] flex items-center gap-2.5 sm:gap-3 overflow-hidden cursor-pointer"
                  >
                    <span className="relative z-10">{slide.buttonText || "Explore Collection"}</span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#064e3b] text-white flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:bg-[#022c22] transition-all">
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none" />
                  </motion.a>
                </div>

                {/* Image Showcase */}
                <div className="w-full md:w-1/2 h-[220px] sm:h-[320px] md:h-[460px] lg:h-[560px] relative z-10 flex items-center justify-center mt-4 md:mt-0 px-2 sm:px-4">
                  <div className="relative w-full max-w-[260px] sm:max-w-[360px] md:max-w-[480px] aspect-square rounded-[24px] sm:rounded-[36px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-emerald-400/20 group/heroImg backdrop-blur-sm bg-black/20">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 640px) 260px, (max-width: 1024px) 360px, 480px"
                      className="object-cover transform group-hover/heroImg:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[24px] sm:rounded-[36px] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom SVG Wave Bottom */}
      <div className="absolute bottom-[-1px] left-0 w-full z-30 text-white pointer-events-none">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-10 sm:h-16 md:h-24 fill-current">
          <path d="M0,0 L0,80 C240,120 480,120 720,80 C960,40 1200,40 1440,80 L1440,120 L0,120 Z" />
        </svg>
      </div>

      {/* Slider Dots */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2 sm:gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`h-2 rounded-full transition-all duration-500 ease-out cursor-pointer ${
              currentSlide === idx ? "w-8 sm:w-10 bg-white" : "w-2 bg-white/40 hover:bg-white/80"
            }`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HomeHero;

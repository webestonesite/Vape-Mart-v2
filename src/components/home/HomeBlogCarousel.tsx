"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pause, Play, ChevronLeft, ChevronRight, ArrowRight, Clock, Calendar } from "lucide-react";
import { staggerContainer, fadeInUp } from "./animations";
import { blogPostsData, type BlogPost } from "@/data/homeData";

interface HomeBlogCarouselProps {
  posts?: BlogPost[];
  order?: number;
}

export function HomeBlogCarousel({ posts, order = 9 }: HomeBlogCarouselProps) {
  const blogPosts = Array.isArray(posts) && posts.length ? posts : blogPostsData;
  const [activeBlogIdx, setActiveBlogIdx] = useState(0);
  const [isBlogAutoplay, setIsBlogAutoplay] = useState(false);
  const isBlogHovered = useRef(false);

  useEffect(() => {
    if (!isBlogAutoplay) return;
    const timer = setInterval(() => {
      if (!isBlogHovered.current) {
        setActiveBlogIdx((prev) => (prev + 1) % blogPosts.length);
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [isBlogAutoplay, blogPosts.length]);

  const nextBlog = useCallback(() => {
    setActiveBlogIdx((prev) => (prev + 1) % blogPosts.length);
  }, [blogPosts.length]);

  const prevBlog = useCallback(() => {
    setActiveBlogIdx((prev) => (prev - 1 + blogPosts.length) % blogPosts.length);
  }, [blogPosts.length]);

  return (
    <motion.section
      className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-20 relative overflow-hidden scroll-mt-28"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      style={{ order }}
    >
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Section Header */}
      <motion.div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6" variants={fadeInUp}>
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-cinzel text-[11px] font-black tracking-[0.25em] text-[#064e3b] uppercase">Blog & Guides • 3D Showcase</span>
          </div>
          <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
            Vape Culture <span className="font-luxury text-[#064e3b]">&</span> Insights
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm md:text-base mt-2 max-w-xl">
            Read clear, practical guides on the devices and flavours here, so you can choose with confidence instead of guessing.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-end shrink-0">
          <button
            onClick={() => setIsBlogAutoplay((prev) => !prev)}
            aria-label={isBlogAutoplay ? "Pause carousel rotation" : "Resume carousel rotation"}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isBlogAutoplay
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-white border-neutral-200 text-neutral-700 hover:bg-emerald-50 hover:border-emerald-200"
            }`}
          >
            {isBlogAutoplay ? <Pause size={14} className="text-emerald-700" /> : <Play size={14} className="text-emerald-700" />}
            <span className="text-[11px] uppercase tracking-wider">{isBlogAutoplay ? "Auto-Rotating" : "Paused"}</span>
          </button>

          <motion.a
            href="/blog"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#064e3b] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/15 hover:bg-[#022c22] transition-colors cursor-pointer group no-underline"
          >
            <span>View All Articles</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
      </motion.div>

      {/* 3D Curved Carousel Stage */}
      <div
        className="relative w-full h-[520px] sm:h-[560px] md:h-[580px] flex items-center justify-center [perspective:1400px] select-none my-2"
        onMouseEnter={() => { isBlogHovered.current = true; }}
        onMouseLeave={() => { isBlogHovered.current = false; }}
      >
        <button
          onClick={prevBlog}
          aria-label="Previous article"
          className="absolute left-2 sm:left-6 md:left-10 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 shadow-xl flex items-center justify-center text-neutral-800 hover:text-emerald-700 hover:scale-110 hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={nextBlog}
          aria-label="Next article"
          className="absolute right-2 sm:right-6 md:right-10 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 shadow-xl flex items-center justify-center text-neutral-800 hover:text-emerald-700 hover:scale-110 hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 3D Stack of Cards */}
        <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
          {blogPosts.map((post: BlogPost, idx: number) => {
            let diff = (idx - activeBlogIdx) % blogPosts.length;
            if (diff < -Math.floor(blogPosts.length / 2)) {
              diff += blogPosts.length;
            } else if (diff > Math.floor(blogPosts.length / 2)) {
              diff -= blogPosts.length;
            }

            const isActive = diff === 0;
            const isPrev = diff === -1;
            const isNext = diff === 1;
            const isVisible = Math.abs(diff) <= 1;

            let translateX = "0%";
            let translateZ = 0;
            let rotateY = 0;
            let scale = 1;
            let opacity = 0;
            let zIndex = 0;

            if (isActive) {
              translateX = "0%";
              translateZ = 0;
              rotateY = 0;
              scale = 1;
              opacity = 1;
              zIndex = 30;
            } else if (isNext) {
              translateX = "70%";
              translateZ = -25;
              rotateY = -15;
              scale = 0.90;
              opacity = 0.85;
              zIndex = 20;
            } else if (isPrev) {
              translateX = "-70%";
              translateZ = -25;
              rotateY = 15;
              scale = 0.90;
              opacity = 0.85;
              zIndex = 20;
            } else {
              translateX = diff < 0 ? "-110%" : "110%";
              translateZ = -80;
              rotateY = 0;
              scale = 0.75;
              opacity = 0;
              zIndex = 0;
            }

            return (
              <div
                key={post.id}
                onClick={() => !isActive && setActiveBlogIdx(idx)}
                className={`absolute w-[86vw] max-w-[340px] sm:max-w-[390px] md:max-w-[430px] h-[470px] sm:h-[510px] md:h-[530px] rounded-[28px] sm:rounded-[32px] bg-white overflow-hidden flex flex-col transform-gpu [backface-visibility:hidden] [-webkit-font-smoothing:antialiased] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  isActive
                    ? "cursor-default border-2 border-emerald-500/70 shadow-[0_20px_50px_rgba(6,78,59,0.18)] ring-4 ring-emerald-500/15"
                    : "cursor-pointer border border-neutral-200/90 shadow-[0_10px_28px_rgba(0,0,0,0.06)] hover:border-emerald-300"
                }`}
                style={{
                  transform: `translate3d(${translateX}, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity: isVisible ? opacity : 0,
                  zIndex,
                  pointerEvents: isVisible ? "auto" : "none",
                  WebkitFontSmoothing: "antialiased",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* Top Image Banner */}
                <div className="relative h-[220px] sm:h-[250px] w-full overflow-hidden bg-neutral-900 shrink-0">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 85vw, 430px"
                    className="object-cover transform hover:scale-105 transition-transform duration-700 ease-out opacity-100"
                    priority={isActive}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-[#064e3b] border border-white/80 shadow-md">
                      {post.category}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/75 text-white border border-white/20 flex items-center gap-1 shadow-sm">
                      <Clock size={11} className="text-amber-400" /> {post.readTime}
                    </span>
                  </div>

                  {/* Meta info overlaid at bottom of image */}
                  <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white/95 text-xs">
                    <span className="flex items-center gap-1.5 font-medium bg-black/50 px-2.5 py-0.5 rounded-md">
                      <Calendar size={12} className="text-emerald-400" /> {post.date}
                    </span>
                    <span className="text-[11px] text-amber-300 font-semibold bg-black/50 px-2.5 py-0.5 rounded-md">
                      By {post.author}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-gradient-to-b from-white to-[#fafcfb]">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span className="text-[10px] font-black tracking-widest uppercase text-emerald-800">
                        {isActive ? "FEATURED ARTICLE" : "RECOMMENDED"}
                      </span>
                    </div>
                    <h3 className="font-luxury font-extrabold text-base sm:text-lg md:text-xl text-neutral-900 mb-2 leading-snug line-clamp-2 hover:text-[#064e3b] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-neutral-400">
                      Article 0{post.id} / 0{blogPosts.length}
                    </span>
                    <a
                      href={post.handle ? `/blog/${post.handle}` : "#"}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-[#064e3b] hover:text-[#022c22] group/btn transition-colors no-underline"
                    >
                      <span>Read Full Guide</span>
                      <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#064e3b] group-hover/btn:bg-[#064e3b] group-hover/btn:text-white transition-all shadow-2xs">
                        <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Interactive Navigation Dots */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {blogPosts.map((post: BlogPost, idx: number) => (
            <button
              key={post.id}
              onClick={() => setActiveBlogIdx(idx)}
              aria-label={`Go to article ${idx + 1}: ${post.title}`}
              className={`transition-all duration-300 rounded-full cursor-pointer flex items-center gap-1.5 ${
                activeBlogIdx === idx
                  ? "w-10 sm:w-14 h-3 bg-[#064e3b] shadow-md shadow-emerald-900/20"
                  : "w-3 h-3 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>
        <span className="text-neutral-400 text-xs font-medium">
          Click side cards or drag arrows to explore • {activeBlogIdx + 1} of {blogPosts.length}
        </span>
      </div>
    </motion.section>
  );
}

export default HomeBlogCarousel;

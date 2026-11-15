"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Shield, Truck, RotateCcw, Star, CheckCircle } from "lucide-react";
import { staggerContainer, fadeInUp } from "./animations";

export interface ReviewItem {
  name: string;
  avatar: string;
  role: string;
  title: string;
  review: string;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    name: "Dubai Customer",
    avatar: "DC",
    role: "Verified Buyer",
    title: "Super fast delivery & 100% authentic",
    review: "Best vape store in Dubai! Delivery arrived within hours, and the scratch-off authenticity code checked out directly on the manufacturer's site."
  },
  {
    name: "Abu Dhabi Customer",
    avatar: "AC",
    role: "Verified Buyer",
    title: "Genuine products guaranteed",
    review: "I've bought knock-offs from random stores before, but Vape Mart only delivers original factory-sealed products. Truly unmatched service."
  },
  {
    name: "Sharjah Customer",
    avatar: "SC",
    role: "Verified Buyer",
    title: "Great flavor selection & support",
    review: "Their premium collection is always in stock with fresh batches. Smooth checkout, great customer care, and unbeatable prices."
  },
  {
    name: "Ajman Customer",
    avatar: "AJ",
    role: "Verified Buyer",
    title: "Always fresh stock & fast WhatsApp response",
    review: "Ordered TEREA and disposable kits multiple times. Delivery always on time and verified original seal. Customer service is 10/10."
  },
  {
    name: "Fujairah Customer",
    avatar: "FC",
    role: "Verified Buyer",
    title: "Best disposable vape deals in UAE",
    review: "Authentic devices with authentic QR codes. Super responsive team, discreet delivery, and prices are better than physical shops."
  },
  {
    name: "Ras Al Khaimah Customer",
    avatar: "RC",
    role: "Verified Buyer",
    title: "Flawless experience every single order",
    review: "Top quality pod devices and pods. Packaging is tamper-proof with cold ice packs. Recommended to all my friends!"
  }
];

function AnimatedCounter({ end, duration = 2500, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const startAnimation = () => {
      setHasAnimated(true);
      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(easeProgress * end));
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      const el = document.getElementById("animated-counters-trigger");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight + 100) {
          startAnimation();
          window.removeEventListener("scroll", handleScroll);
        }
      } else {
        startAnimation();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration, hasAnimated]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

interface HomeTrustReviewsProps {
  testimonials?: ReviewItem[];
  customersCount?: number;
  reviewsCount?: number;
  order?: number;
}

export function HomeTrustReviews({
  testimonials,
  customersCount = 160000,
  reviewsCount = 1200,
  order = 8,
}: HomeTrustReviewsProps) {
  const displayReviews = Array.isArray(testimonials) && testimonials.length ? testimonials : DEFAULT_REVIEWS;

  return (
    <motion.section
      id="animated-counters-trigger"
      className="relative overflow-hidden bg-[#064e3b] text-white py-12 sm:py-16 md:py-20 mb-0 border-t border-emerald-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      style={{ order }}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[130px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600 rounded-full blur-[130px] opacity-20 translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        {/* Header */}
        <motion.div className="flex flex-col items-center text-center max-w-2xl mb-8 sm:mb-10 px-2" variants={fadeInUp}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 mb-3 sm:mb-4 shadow-sm backdrop-blur-md">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="font-cinzel text-[10px] sm:text-[11px] font-black tracking-[0.25em] text-emerald-300 uppercase">
              100% Authorized & Certified
            </span>
          </div>
          <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2.5 sm:mb-3 tracking-tight text-white drop-shadow-sm">
            Official Authorized Premium Retailer
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm md:text-base leading-relaxed">
            Vape Mart works directly with global brands, so you get 100% genuine hardware, verifiable security codes, and tamper-proof packaging. No fakes, no guesswork, just original products you can trust, from an authentic vape shop in Dubai.
          </p>
        </motion.div>

        {/* Social Proof Stats Header */}
        <motion.div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10" variants={fadeInUp}>
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="flex -space-x-2.5">
              {["JD", "SM", "AK", "MR"].map((initials, idx) => (
                <div key={idx} className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 border-2 border-[#064e3b] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {initials}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-bold text-base">
                Trusted by <span className="text-emerald-400 font-extrabold"><AnimatedCounter end={customersCount} suffix="+" /></span> Customers
              </p>
              <p className="text-emerald-200/70 text-xs">Verified UAE & GCC buyers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-sm">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={15} fill="#fbbf24" color="#fbbf24" />
              ))}
            </div>
            <span className="text-white font-black text-base">4.9 / 5</span>
            <span className="text-emerald-200/70 text-xs">({reviewsCount ? reviewsCount.toLocaleString() : "1,200"}+ reviews)</span>
          </div>
        </motion.div>

        {/* Continuous Infinite Marquee Reviews Carousel */}
        <div className="w-full overflow-hidden relative mb-8 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] py-2">
          <div className="reviews-marquee-track">
            {[...displayReviews, ...displayReviews].map((rev, i) => (
              <div
                key={i}
                className="w-[300px] sm:w-[360px] md:w-[390px] shrink-0 bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-lg flex flex-col justify-between select-none"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-sm text-white shadow-inner border border-white/20">
                        {rev.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{rev.name}</h4>
                        <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle size={11} /> {rev.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star key={starIdx} size={12} fill="#fbbf24" color="#fbbf24" />
                      ))}
                    </div>
                  </div>
                  <h5 className="font-semibold text-white/95 text-sm mb-1.5">{rev.title}</h5>
                  <p className="text-emerald-100/75 text-xs leading-relaxed italic">
                    &quot;{rev.review}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Trust Badges Strip */}
        <motion.div
          variants={fadeInUp}
          className="w-full flex flex-wrap justify-around items-center gap-4 py-4 px-6 bg-black/25 backdrop-blur-md rounded-2xl border border-white/10 text-emerald-100/90 text-xs md:text-sm font-semibold shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            <span>100% Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-emerald-400" />
            <span>Fast UAE Express Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-emerald-400" />
            <span>30-Day Money Back</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>Original Brands Guaranteed</span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default HomeTrustReviews;


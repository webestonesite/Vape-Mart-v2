"use client";

import React from "react";
import { motion } from "framer-motion";
import { Truck, Headset, RotateCcw, ShieldCheck, CreditCard, Zap, Clock, Star } from "lucide-react";
import { staggerContainer, fadeInScale } from "./animations";

export interface FeatureItem {
  icon?: any;
  title: string;
  desc: string;
}

const DEFAULT_ICONS: Record<string, any> = {
  Truck,
  Headset,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  Zap,
  Clock,
  Star,
};

const DEFAULT_FEATURES: FeatureItem[] = [
  { icon: Truck, title: "Free Shipping", desc: "Terms & Conditions applied for free shipping and delivery" },
  { icon: Headset, title: "24x7 Support", desc: "Round-the-Clock Assistance, Anytime You Need It" },
  { icon: RotateCcw, title: "1 Week Return", desc: "Your Satisfaction is Our Priority: Return Any Product Within 1 week" },
  { icon: ShieldCheck, title: "100% Payment Secure", desc: "Your Transactions are Safe with Top-Grade Security" },
];

interface HomeFeaturesProps {
  features?: Array<{ icon?: any; title: string; desc: string }>;
  order?: number;
}

export function HomeFeatures({ features, order = 4 }: HomeFeaturesProps) {
  const displayFeatures = Array.isArray(features) && features.length
    ? features.map((f) => ({
        icon: typeof f.icon === "string" ? DEFAULT_ICONS[f.icon] || ShieldCheck : f.icon || ShieldCheck,
        title: f.title || "",
        desc: f.desc || "",
      }))
    : DEFAULT_FEATURES;

  return (
    <motion.section
      className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12 mb-8 sm:mb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
      style={{ order }}
    >
      <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#022c22] rounded-[24px] sm:rounded-[40px] shadow-[0_20px_40px_rgba(6,78,59,0.2)] p-6 sm:p-10 relative overflow-hidden border border-emerald-900/50">
        {/* Background glowing effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10 relative z-10">
          {displayFeatures.map((feature, idx) => {
            const IconComp = feature.icon;
            return (
              <motion.div
                key={idx}
                className="flex flex-col items-center text-center px-4 pt-6 sm:pt-0 group cursor-pointer"
                variants={fadeInScale}
                whileHover={{ y: -6, scale: 1.03 }}
              >
                <div className="w-13 h-13 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-amber-400 group-hover:border-amber-400 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] transform group-hover:-translate-y-2">
                  <IconComp size={24} className="sm:hidden text-emerald-400 group-hover:text-[#064e3b] transition-colors duration-500" strokeWidth={1.5} />
                  <IconComp size={28} className="hidden sm:block text-emerald-400 group-hover:text-[#064e3b] transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-2 sm:mb-3 tracking-wide">{feature.title}</h4>
                <p className="text-emerald-100/60 text-xs sm:text-[13px] leading-relaxed max-w-[250px]">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

export default HomeFeatures;


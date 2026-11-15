"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer, fadeInUp, fadeInScale } from "./animations";

export interface CategoryTile {
  title: string;
  subtitle: string;
  num: string;
  img: string;
  color: string;
  tag: string;
  collection: string;
}

interface HomeCategoriesProps {
  categoryTiles: CategoryTile[];
  order?: number;
}

export function HomeCategories({ categoryTiles, order = 3 }: HomeCategoriesProps) {
  const tileHref = (collection?: string) => {
    if (!collection) return "/collections";
    if (collection === "frontpage") return "/collections/all";
    return `/collections/${collection}`;
  };

  return (
    <motion.section
      className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      style={{ order }}
    >
      {/* Centered Category Header */}
      <motion.div className="flex flex-col items-center mb-10 sm:mb-16 text-center px-2" variants={fadeInUp}>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-[2px] bg-[#064e3b] rounded-full"></span>
          <span className="font-cinzel text-xs font-bold tracking-[0.25em] text-[#064e3b] uppercase">COLLECTION</span>
          <span className="w-6 h-[2px] bg-[#064e3b] rounded-full"></span>
        </div>
        <h2 className="font-luxury text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 mb-3 sm:mb-4 tracking-tight">
          Shop by Category
        </h2>
        <div className="flex items-center gap-4 mb-4 sm:mb-6">
          <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#064e3b]"></div>
          <div className="w-2 h-2 rotate-45 bg-[#064e3b]"></div>
          <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#064e3b]"></div>
        </div>
        <p className="text-neutral-500 max-w-2xl text-xs sm:text-[15px] leading-relaxed">
          Not sure where to start? Just pick what you use and you&apos;re straight to genuine stock in Dubai, priced in AED, with fast delivery across the UAE.
        </p>
      </motion.div>

      {/* Categories Grid (2-Column on Mobile, 3 on Tablet, 6 on Desktop) */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 px-1 sm:px-0"
        variants={staggerContainer}
      >
        {categoryTiles.map((cat, idx) => (
          <Link key={idx} href={tileHref(cat.collection)} aria-label={`Shop ${cat.title}`} className="block">
            <motion.div
              variants={fadeInScale}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.3 } }}
              className="group relative h-[210px] sm:h-[280px] md:h-[340px] rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(6,78,59,0.25)] transition-all duration-500 border border-neutral-200/60 flex flex-col justify-between p-3 sm:p-5"
            >
              <div className="absolute inset-0 bg-neutral-900">
                {cat.img ? (
                  <Image
                    src={cat.img}
                    alt={cat.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-95"
                  />
                ) : null}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-black/40 to-black/20 transition-opacity duration-500`}
                ></div>
              </div>

              <div className="relative z-10 flex justify-between items-start w-full">
                <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[8px] sm:text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase">
                  {cat.tag}
                </span>
                <span className="text-white/60 font-black text-lg sm:text-2xl">{cat.num}</span>
              </div>

              <div className="relative z-10 flex flex-col items-start transform transition-transform duration-300 group-hover:-translate-y-1">
                <span className="font-cinzel text-amber-400 font-bold text-[8px] sm:text-[10px] tracking-[0.15em] mb-0.5 sm:mb-1 drop-shadow-md">
                  {cat.subtitle}
                </span>
                <h3 className="font-luxury text-white text-sm sm:text-lg md:text-xl font-bold mb-2 drop-shadow-md line-clamp-1">
                  {cat.title}
                </h3>
                <div className="bg-white/15 backdrop-blur-md border border-white/25 text-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-[10px] sm:text-xs group-hover:bg-white group-hover:text-[#064e3b] transition-all flex items-center gap-1 shadow-sm">
                  <span>Shop</span>
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.section>
  );
}

export default HomeCategories;


"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { staggerContainer, slideInLeft, fadeInScale } from "./animations";

export interface FeaturedBrandProduct {
  title: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  img?: string;
}

const DEFAULT_FB_PRODUCTS: FeaturedBrandProduct[] = [
  { title: "AL Fakher Hypermax 15k Puffs", price: "50.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
  { title: "Al Fakher Mega Max 40000 Puffs Disposable Vape", price: "50.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
  { title: "Waka Blade 50K Puffs 50mg in Dubai, UAE", price: "55.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
  { title: "ELFBAR BC10000 Puffs Disposable Vape", price: "35.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
  { title: "Waka SoPro 20000 Puffs 50mg in Dubai, UAE", price: "50.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
  { title: "KIEF King 35000 Puffs Disposable Vape", price: "45.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
];

interface HomeFeaturedBrandProps {
  title?: string;
  products?: FeaturedBrandProduct[];
  order?: number;
}

export function HomeFeaturedBrand({
  title = "Your Vibe. Your Flavor.",
  products,
  order = 5,
}: HomeFeaturedBrandProps) {
  const displayProducts = Array.isArray(products) && products.length ? products : DEFAULT_FB_PRODUCTS;

  return (
    <motion.section
      className="featured-brand-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      style={{ order }}
    >
      <div className="fb-container">
        <motion.div className="fb-left" variants={slideInLeft}>
          <div className="fb-badge font-cinzel tracking-[0.25em]">FEATURED</div>
          <div className="fb-logo-wrapper">
            <Image src="/vape-mart-text-logo.png" alt="Vape Mart Brand Logo" fill sizes="170px" className="object-contain p-2" priority />
          </div>
          <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-[#064e3b] mb-6">{title}</h3>
          <motion.button
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            className="fb-explore-btn cursor-pointer relative overflow-hidden group/exp shadow-md hover:shadow-lg"
          >
            <span className="relative z-10 flex items-center gap-1.5 font-bold">
              Explore <ArrowUpRight size={16} className="group-hover/exp:translate-x-0.5 group-hover/exp:-translate-y-0.5 transition-transform" />
            </span>
            <span className="absolute inset-0 -translate-x-full group-hover/exp:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
          </motion.button>
        </motion.div>

        <div className="fb-right">
          <motion.div className="fb-grid" variants={staggerContainer}>
            {displayProducts.map((prod, idx) => (
              <motion.div
                className="fb-product-card"
                key={idx}
                variants={fadeInScale}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.25 } }}
              >
                <div className="fb-img-wrapper">
                  <div className="fb-podium"></div>
                  <Image src={prod.img || "/images/cat_disposables.png"} alt={prod.title} fill style={{ objectFit: 'contain', padding: '5px', zIndex: 2 }} />
                </div>
                <div className="fb-info">
                  {prod.discount && <div className="fb-discount">{prod.discount}</div>}
                  <h4 className="fb-title">{prod.title}</h4>
                  <div className="fb-price">
                    <span className="current">AED {prod.price}</span>
                    {prod.oldPrice && <span className="old">AED {prod.oldPrice}</span>}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="fb-add-btn cursor-pointer shadow-md hover:shadow-emerald-900/30"
                >
                  <Plus size={16} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default HomeFeaturedBrand;


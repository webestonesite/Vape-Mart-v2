"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, ArrowRight } from "lucide-react";
import { staggerContainer, fadeInUp, slideInLeft } from "./animations";

export interface FaqItem {
  q: string;
  a: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  { q: "What products does Vape Mart offer?", a: "We offer a wide range of premium disposable vapes, JUUL and IQOS TEREA products, and e-liquids from top global brands." },
  { q: "Are your vape products authentic?", a: "Yes! All our products are 100% authentic and sourced directly from official manufacturers. We guarantee original brands." },
  { q: "Do you offer same-day delivery in Dubai?", a: "Absolutely. We provide fast same-day delivery across Dubai for all orders placed before our daily cutoff time." },
  { q: "What payment methods do you accept?", a: "We accept all major Credit/Debit cards, Apple Pay, and offer Cash on Delivery (COD) for your convenience." },
  { q: "Can I refill a disposable vape?", a: "No, disposable vapes are designed for single-use. Attempting to refill them can be dangerous and damage the device." }
];

interface HomeFaqProps {
  faqs?: FaqItem[];
  order?: number;
}

export function HomeFaq({ faqs, order = 7 }: HomeFaqProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const displayFaqs = Array.isArray(faqs) && faqs.length ? faqs : DEFAULT_FAQS;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <motion.section
      className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      style={{ order }}
    >
      <motion.div className="flex flex-col items-center mb-10 sm:mb-16 text-center px-2" variants={fadeInUp}>
        <span className="font-cinzel inline-block px-4 py-1.5 rounded-full bg-[#064e3b]/10 text-[#064e3b] font-bold text-xs tracking-[0.25em] uppercase mb-3 sm:mb-4">
          GOT QUESTIONS?
        </span>
        <h2 className="font-luxury text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 mb-3 sm:mb-6 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-neutral-500 max-w-2xl text-sm sm:text-[17px]">
          Everything you need to know about our products and services.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-20">
        <motion.div
          variants={slideInLeft}
          className="w-full lg:w-1/3 flex flex-col items-start bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] border border-neutral-200/60 shadow-sm h-max"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#064e3b] flex items-center justify-center mb-6 sm:mb-8 shadow-lg shadow-emerald-900/20">
            <HelpCircle size={26} color="#fff" />
          </div>
          <h3 className="font-luxury text-xl sm:text-2xl font-bold text-neutral-900 mb-3 sm:mb-4">
            Still have questions?
          </h3>
          <p className="text-neutral-500 text-sm mb-6 sm:mb-8 leading-relaxed">
            Can&apos;t find the answer you&apos;re looking for? Message us and we&apos;ll help you pick the right device, flavour and strength.
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="w-full py-3.5 sm:py-4 rounded-full bg-[#064e3b] text-white font-bold text-sm sm:text-base hover:bg-[#022c22] hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-transparent cursor-pointer shadow-md shadow-emerald-900/10 relative overflow-hidden group/faq no-underline"
          >
            <span className="relative z-10">Contact Support</span>
            <ArrowRight size={16} className="relative z-10 group-hover/faq:translate-x-1.5 transition-transform" />
            <span className="absolute inset-0 -translate-x-full group-hover/faq:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
          </motion.a>
        </motion.div>

        <motion.div className="w-full lg:w-2/3 flex flex-col gap-3 sm:gap-4" variants={staggerContainer}>
          {displayFaqs.map((faq, idx) => (
            <motion.div
              variants={fadeInUp}
              className={`border border-neutral-200/80 rounded-2xl overflow-hidden transition-all duration-300 ${
                openFaq === idx ? "bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-transparent" : "bg-transparent hover:bg-neutral-50 cursor-pointer"
              }`}
              key={idx}
              onClick={() => toggleFaq(idx)}
            >
              <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <span className={`font-black text-lg sm:text-xl transition-colors duration-300 ${openFaq === idx ? "text-[#064e3b]" : "text-neutral-300"}`}>
                    0{idx + 1}
                  </span>
                  <h4 className={`font-semibold text-sm sm:text-base md:text-lg transition-colors duration-300 ${openFaq === idx ? "text-[#064e3b]" : "text-neutral-700"}`}>
                    {faq.q}
                  </h4>
                </div>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${openFaq === idx ? "bg-[#064e3b] text-white" : "bg-neutral-100 text-neutral-400"} shrink-0`}>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
                </div>
              </div>
              <div
                className={`px-4 sm:px-6 pl-10 sm:pl-16 text-neutral-500 text-xs sm:text-sm leading-relaxed overflow-hidden transition-all duration-500 ease-in-out`}
                style={{ maxHeight: openFaq === idx ? "500px" : "0", opacity: openFaq === idx ? 1 : 0, paddingBottom: openFaq === idx ? "1.25rem" : "0" }}
              >
                {faq.a}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default HomeFaq;


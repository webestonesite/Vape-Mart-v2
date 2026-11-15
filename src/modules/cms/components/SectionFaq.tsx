"use client";

import React, { useState } from "react";
import { SectionFaqDTO } from "../cms.types";
import { ShopifyRichText } from "@/shared/components/ShopifyRichText";
import { ChevronDown } from "lucide-react";

export function SectionFaq({ section }: { section: SectionFaqDTO }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="my-16 mx-auto max-w-4xl px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-foreground mb-8">
        {section.heading}
      </h2>

      <div className="flex flex-col gap-3">
        {section.items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex w-full items-center justify-between p-5 text-left font-semibold text-foreground hover:text-primary transition-colors"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-zinc-300 border-t border-white/5">
                  <ShopifyRichText json={item.answerJson} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}


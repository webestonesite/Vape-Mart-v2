import React from "react";
import { SectionPromoDTO } from "../cms.types";
import { SafeImage } from "@/shared/components/SafeImage";
import { SmartLink } from "@/shared/components/SmartLink";
import { ShopifyRichText } from "@/shared/components/ShopifyRichText";
import { ArrowRight } from "lucide-react";

export function SectionPromo({ section }: { section: SectionPromoDTO }) {
  const isImageRight = section.imagePosition === "Right";

  return (
    <section className="my-16 mx-auto max-w-7xl px-4 sm:px-6">
      <div className={`flex flex-col lg:flex-row items-center gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 sm:p-12 ${isImageRight ? "lg:flex-row-reverse" : ""}`}>
        {/* Visual Image */}
        {section.imageUrl && (
          <div className="relative aspect-video lg:aspect-square w-full lg:w-1/2 overflow-hidden rounded-2xl bg-white/5">
            <SafeImage
              src={section.imageUrl}
              alt={section.heading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col items-start justify-center">
          {section.badgeText && (
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider mb-4 border border-primary/30">
              {section.badgeText}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {section.heading}
          </h2>
          {section.descriptionJson && (
            <div className="mt-4 text-zinc-300">
              <ShopifyRichText json={section.descriptionJson} />
            </div>
          )}
          {section.buttonLabel && (
            <div className="mt-6">
              <SmartLink
                destinationFields={section.destinationFields}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                {section.buttonLabel}
                <ArrowRight className="h-4 w-4" />
              </SmartLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


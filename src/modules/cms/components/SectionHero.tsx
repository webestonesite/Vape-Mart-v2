import React from "react";
import { SectionHeroDTO } from "../cms.types";
import { SafeImage } from "@/shared/components/SafeImage";
import { SmartLink } from "@/shared/components/SmartLink";
import { ArrowRight } from "lucide-react";

export function SectionHero({ section }: { section: SectionHeroDTO }) {
  const isCentered = section.textAlignment === "Center";

  return (
    <section className="relative min-h-[500px] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-zinc-950 to-black my-6">
      {section.desktopImageUrl && (
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={section.desktopImageUrl}
            alt={section.heading}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
      )}

      <div className={`relative z-10 mx-auto max-w-7xl px-6 py-20 flex flex-col justify-center min-h-[500px] ${isCentered ? "items-center text-center" : "items-start text-left"}`}>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
          {section.heading}
        </h1>
        {section.subHeading && (
          <p className="mt-4 text-base md:text-lg text-zinc-300 max-w-2xl leading-relaxed">
            {section.subHeading}
          </p>
        )}
        {section.buttonLabel && (
          <div className="mt-8">
            <SmartLink
              destinationFields={section.destinationFields}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              {section.buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </SmartLink>
          </div>
        )}
      </div>
    </section>
  );
}


import React from "react";
import { SectionDTO } from "../cms.types";
import { SectionErrorBoundary } from "@/components/common/SectionErrorBoundary";
import { SectionHero } from "./SectionHero";
import { SectionProducts } from "./SectionProducts";
import { SectionPromo } from "./SectionPromo";
import { SectionCategories } from "./SectionCategories";
import { SectionFaq } from "./SectionFaq";

interface SectionRendererProps {
  sections: SectionDTO[];
  productsByCollection?: Record<string, any[]>;
}

export function SectionRenderer({ sections, productsByCollection = {} }: SectionRendererProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="flex flex-col w-full">
      {sections.map((section) => {
        const key = section.id || `${section.type}-${Math.random()}`;

        return (
          <SectionErrorBoundary key={key} sectionName={section.type}>
            {(() => {
              switch (section.type) {
                case "section_hero":
                  return <SectionHero section={section} />;
                case "section_products":
                  return (
                    <SectionProducts
                      section={section}
                      products={productsByCollection[section.collectionHandle || ""] || []}
                    />
                  );
                case "section_promo":
                  return <SectionPromo section={section} />;
                case "section_categories":
                  return <SectionCategories section={section} />;
                case "section_faq":
                  return <SectionFaq section={section} />;
                default:
                  return null;
              }
            })()}
          </SectionErrorBoundary>
        );
      })}
    </div>
  );
}

export default SectionRenderer;


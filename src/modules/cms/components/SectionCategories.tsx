import React from "react";
import { SectionCategoriesDTO } from "../cms.types";
import { SafeImage } from "@/shared/components/SafeImage";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SectionCategories({ section }: { section: SectionCategoriesDTO }) {
  return (
    <section className="my-16 mx-auto max-w-7xl px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">
        {section.heading}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {section.categories.map((cat, idx) => (
          <Link
            key={cat.handle || idx}
            href={`/collections/${cat.handle}`}
            className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 aspect-[4/3] transition-all hover:border-primary/50"
          >
            {cat.imageUrl && (
              <SafeImage
                src={cat.imageUrl}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="font-semibold text-white group-hover:text-primary transition-colors">
                {cat.title}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-primary group-hover:text-black">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


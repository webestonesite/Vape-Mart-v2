"use client";

import React, { useState } from "react";
import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

const DEFAULT_SVG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' fill='%23111827'%3E%3Crect width='400' height='400' fill='%231f2937'/%3E%3Cpath d='M160 160h80v80h-80z' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='14'%3EVape Mart%3C/text%3E%3C/svg%3E";

/**
 * Safe Image Component
 * Ensures image errors never display broken image icons or crash layout.
 * Automatically falls back to clean SVG placeholder on 404 or missing URLs.
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_SVG_PLACEHOLDER,
  className,
  ...rest
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // If no source or broken URL
  const validSrc = !src || hasError ? fallbackSrc : src;

  return (
    <Image
      src={validSrc}
      alt={alt || "Vape Mart UAE Product Image"}
      className={className}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}

export default SafeImage;


import React from "react";
import Link from "next/link";

export interface LinkDestinationFields {
  link_collection?: { reference?: { handle?: string } | null } | null;
  link_product?: { reference?: { handle?: string; slug?: string } | null } | null;
  link_page?: { reference?: { handle?: string } | null } | null;
  custom_url?: { value?: string } | null;
}

export function resolveSmartHref(fields?: LinkDestinationFields | null, defaultHref?: string): string | null {
  if (!fields && defaultHref) return defaultHref;
  if (!fields) return null;

  if (fields.link_collection?.reference?.handle) {
    return `/collections/${fields.link_collection.reference.handle}`;
  }
  if (fields.link_product?.reference?.handle || fields.link_product?.reference?.slug) {
    const handle = fields.link_product.reference.handle || fields.link_product.reference.slug;
    return `/product/${handle}`;
  }
  if (fields.link_page?.reference?.handle) {
    return `/pages/${fields.link_page.reference.handle}`;
  }
  if (fields.custom_url?.value) {
    return fields.custom_url.value;
  }

  return defaultHref || null;
}

interface SmartLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  destinationFields?: LinkDestinationFields | null;
  children: React.ReactNode;
  className?: string;
}

/**
 * Polymorphic Link Resolver
 * Resolves Next.js routes, external URLs, telephone/WhatsApp, and Shopify Metaobject reference targets.
 */
export function SmartLink({
  href,
  destinationFields,
  children,
  className,
  ...rest
}: SmartLinkProps) {
  const targetHref = resolveSmartHref(destinationFields, href);

  if (!targetHref) {
    return <span className={className}>{children}</span>;
  }

  const isExternal =
    targetHref.startsWith("http://") ||
    targetHref.startsWith("https://") ||
    targetHref.startsWith("//") ||
    targetHref.startsWith("tel:") ||
    targetHref.startsWith("mailto:") ||
    targetHref.startsWith("https://wa.me/");

  if (isExternal) {
    return (
      <a
        href={targetHref}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={targetHref} className={className} {...rest}>
      {children}
    </Link>
  );
}

export default SmartLink;


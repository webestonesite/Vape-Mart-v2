import React from "react";
import Link from "next/link";

interface RichTextNode {
  type: string;
  value?: string;
  level?: number;
  listType?: "unordered" | "ordered";
  url?: string;
  title?: string;
  target?: string;
  bold?: boolean;
  italic?: boolean;
  children?: RichTextNode[];
}

interface ShopifyRichTextProps {
  json: string | Record<string, unknown> | null | undefined;
  className?: string;
}

function renderNode(node: RichTextNode, index: number): React.ReactNode {
  if (!node) return null;

  if (node.type === "text") {
    let content: React.ReactNode = node.value || "";
    if (node.bold) content = <strong>{content}</strong>;
    if (node.italic) content = <em>{content}</em>;
    return <React.Fragment key={index}>{content}</React.Fragment>;
  }

  const children = node.children?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "root":
      return <React.Fragment key={index}>{children}</React.Fragment>;

    case "paragraph":
      return (
        <p key={index} className="mb-3 leading-relaxed last:mb-0">
          {children}
        </p>
      );

    case "heading": {
      const level = Math.min(Math.max(node.level || 2, 1), 6);
      const headingClass = "font-bold my-3 text-foreground";
      if (level === 1) return <h1 key={index} className={headingClass}>{children}</h1>;
      if (level === 2) return <h2 key={index} className={headingClass}>{children}</h2>;
      if (level === 3) return <h3 key={index} className={headingClass}>{children}</h3>;
      if (level === 4) return <h4 key={index} className={headingClass}>{children}</h4>;
      if (level === 5) return <h5 key={index} className={headingClass}>{children}</h5>;
      return <h6 key={index} className={headingClass}>{children}</h6>;
    }

    case "list":
      if (node.listType === "ordered") {
        return (
          <ol key={index} className="list-decimal pl-5 my-3 space-y-1">
            {children}
          </ol>
        );
      }
      return (
        <ul key={index} className="list-disc pl-5 my-3 space-y-1">
          {children}
        </ul>
      );

    case "list-item":
      return <li key={index}>{children}</li>;

    case "link": {
      const url = node.url || "#";
      const isExternal = url.startsWith("http://") || url.startsWith("https://");
      if (isExternal) {
        return (
          <a
            key={index}
            href={url}
            target={node.target || "_blank"}
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {children}
          </a>
        );
      }
      return (
        <Link key={index} href={url} className="text-primary hover:underline">
          {children}
        </Link>
      );
    }

    default:
      return <span key={index}>{children}</span>;
  }
}

/**
 * Safe Recursive Shopify Rich Text AST Renderer
 * Safely parses Shopify JSON Rich Text with fallback for legacy plain text/HTML.
 */
export function ShopifyRichText({ json, className = "" }: ShopifyRichTextProps) {
  if (!json) return null;

  let parsed: RichTextNode | null = null;

  if (typeof json === "string") {
    try {
      parsed = JSON.parse(json) as RichTextNode;
    } catch {
      // Fallback for non-JSON text
      return <div className={className}>{json}</div>;
    }
  } else if (typeof json === "object") {
    parsed = json as unknown as RichTextNode;
  }

  if (!parsed) return null;

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {renderNode(parsed, 0)}
    </div>
  );
}

export default ShopifyRichText;

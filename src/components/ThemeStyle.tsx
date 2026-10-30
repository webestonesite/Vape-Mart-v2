import { fetchShopSettings } from "@/lib/shopify";

/**
 * ThemeStyle — applies the panel-chosen brand colour preset + fonts.
 *
 * How it works: Tailwind v4 utilities reference theme variables
 * (bg-emerald-900 -> var(--color-emerald-900)), so redefining those
 * variables re-colours every emerald surface at once — no component
 * edits needed. The storefront also uses literal brand hexes
 * (#064e3b / #022c22 / ...) in arbitrary-value classes, so those are
 * mapped to the same variables. Gold (amber) is the store's signature
 * accent and stays untouched in every preset.
 *
 * When the panel holds the defaults (emerald + Playfair + system body
 * font) this renders nothing, so the live site is byte-for-byte
 * unchanged until the owner picks something.
 */

const PRESETS: Record<string, Record<string, string>> = {
  emerald: {
    "50": "#ecfdf5",
    "100": "#d1fae5",
    "200": "#a7f3d0",
    "400": "#34d399",
    "500": "#10b981",
    "600": "#059669",
    "700": "#047857",
    "800": "#065f46",
    "900": "#064e3b",
    "950": "#022c22",
  },
  sapphire: {
    "50": "#eff6ff",
    "100": "#dbeafe",
    "200": "#bfdbfe",
    "400": "#60a5fa",
    "500": "#3b82f6",
    "600": "#2563eb",
    "700": "#1d4ed8",
    "800": "#1e40af",
    "900": "#1e3a8a",
    "950": "#172554",
  },
  ruby: {
    "50": "#fff1f2",
    "100": "#ffe4e6",
    "200": "#fecdd3",
    "400": "#fb7185",
    "500": "#f43f5e",
    "600": "#e11d48",
    "700": "#be123c",
    "800": "#9f1239",
    "900": "#881337",
    "950": "#4c0519",
  },
};

const HEADING_STACKS: Record<string, string> = {
  cinzel: "'Cinzel', serif",
  outfit: "var(--font-outfit), 'Outfit', sans-serif",
};

const BODY_STACKS: Record<string, string> = {
  inter: "var(--font-inter), 'Inter', sans-serif",
  outfit: "var(--font-outfit), 'Outfit', sans-serif",
  poppins: "'Poppins', sans-serif",
};

// Literal brand hex -> emerald shade it stands for.
const HEX_MAP: [string, string][] = [
  ["064e3b", "900"],
  ["022c22", "950"],
  ["043e2e", "900"],
  ["065f46", "800"],
  ["043729", "900"],
];

function esc(hex: string): string {
  return `\\[\\#${hex}\\]`;
}

export default async function ThemeStyle() {
  const settings = await fetchShopSettings();
  const preset = settings.theme?.colors?.preset || "emerald";
  const heading = settings.theme?.fonts?.heading || "playfair";
  const body = settings.theme?.fonts?.body || "system";

  const palette = PRESETS[preset];
  const isDefault =
    preset === "emerald" && heading === "playfair" && body === "system";
  if (isDefault || !palette) return null;

  const lines: string[] = [];
  const vars = Object.entries(palette)
    .map(([shade, value]) => `--color-emerald-${shade}: ${value} !important;`)
    .join(" ");
  lines.push(`:root { ${vars} }`);

  // globals.css custom properties that paint buttons, badges and heroes.
  lines.push(
    `:root { --primary-color: ${palette["900"]} !important; --text-muted: ${palette["100"]} !important; --hero-bg: linear-gradient(135deg, ${palette["900"]} 0%, ${palette["600"]} 100%) !important; }`,
  );

  // Literal-hex arbitrary classes used across the storefront.
  for (const [hex, shade] of HEX_MAP) {
    const v = `var(--color-emerald-${shade})`;
    lines.push(`.text-${esc(hex)} { color: ${v} !important; }`);
    lines.push(`.bg-${esc(hex)} { background-color: ${v} !important; }`);
    lines.push(`.border-${esc(hex)} { border-color: ${v} !important; }`);
    lines.push(`.from-${esc(hex)} { --tw-gradient-from: ${v} !important; }`);
    lines.push(`.via-${esc(hex)} { --tw-gradient-via: ${v} !important; }`);
    lines.push(`.to-${esc(hex)} { --tw-gradient-to: ${v} !important; }`);
  }
  // Opacity variants of those classes found in the codebase.
  lines.push(
    `.bg-${esc("064e3b")}\\/10 { background-color: color-mix(in oklab, var(--color-emerald-900) 10%, transparent) !important; }`,
    `.bg-${esc("064e3b")}\\/95 { background-color: color-mix(in oklab, var(--color-emerald-900) 95%, transparent) !important; }`,
    `.border-${esc("064e3b")}\\/20 { border-color: color-mix(in oklab, var(--color-emerald-900) 20%, transparent) !important; }`,
    `.border-${esc("064e3b")}\\/30 { border-color: color-mix(in oklab, var(--color-emerald-900) 30%, transparent) !important; }`,
    `.border-${esc("064e3b")}\\/40 { border-color: color-mix(in oklab, var(--color-emerald-900) 40%, transparent) !important; }`,
    `.from-${esc("022c22")}\\/60 { --tw-gradient-from: color-mix(in oklab, var(--color-emerald-950) 60%, transparent) !important; }`,
    `.via-${esc("022c22")}\\/40 { --tw-gradient-via: color-mix(in oklab, var(--color-emerald-950) 40%, transparent) !important; }`,
  );

  // Headings render through var(--font-playfair) in globals.css; the
  // next/font variable lives on <body>, so override it there.
  if (HEADING_STACKS[heading]) {
    lines.push(
      `body { --font-playfair: ${HEADING_STACKS[heading]} !important; }`,
    );
  }
  if (BODY_STACKS[body]) {
    lines.push(`body { font-family: ${BODY_STACKS[body]} !important; }`);
  }

  return <style dangerouslySetInnerHTML={{ __html: lines.join("\n") }} />;
}

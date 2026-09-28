import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Vape Mart | Premium E-Cigarettes & E-Liquids",
  description: "Discover premium vapes, exclusive e-liquids, and next-gen hardware. Designed for those who demand the best.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${cinzel.variable}`}>
        {children}
      </body>
    </html>
  );
}

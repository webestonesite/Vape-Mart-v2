import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Vape Mart | Premium E-Cigarettes & E-Liquids",
  description: "Discover premium vapes, exclusive e-liquids, and next-gen hardware. Designed for those who demand the best.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Vape Mart",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/vape-mart-logo.jpg", sizes: "1024x1024", type: "image/jpeg" }],
    apple: [{ url: "/images/logo.png", sizes: "1024x1024", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#064e3b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}

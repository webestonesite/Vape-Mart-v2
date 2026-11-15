import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Playfair_Display, Cinzel, Poppins } from "next/font/google";
import ThemeStyle from "@/components/ThemeStyle";
import { CartProvider } from "@/modules/cart/CartProvider";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
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
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vape Mart UAE | Premium E-Cigarettes & E-Liquids",
  description: "Discover premium vapes, exclusive e-liquids, and next-gen hardware across Dubai, Abu Dhabi, and UAE with 2-3 hours express dispatch.",
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
        <ThemeStyle />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${cinzel.variable} ${poppins.variable} min-h-screen bg-background text-foreground antialiased`}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

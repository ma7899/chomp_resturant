import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

/**
 * Body / content font — Vazirmatn (variable axis, 100–900).
 * Loaded via `next/font/google` so it is self-hosted at build time,
 * preloaded, and inlined as `font-display: swap` to avoid CLS.
 *
 * `adjustFontFallback: "Arial"` injects a metrics-matched fallback so
 * the layout does not shift when the web font finishes loading.
 */
const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazir",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Tahoma",
    "Geeza Pro",
    "Arial",
    "sans-serif",
  ],
});

/**
 * Display / heading font — Peyda.
 *
 * Peyda is a commercial Persian display family by Fontiran and is NOT
 * distributed via Google Fonts or npm. To enable it:
 *
 *   1. Drop the woff2 files into `public/fonts/peyda/`:
 *        Peyda-Regular.woff2, Peyda-Medium.woff2,
 *        Peyda-SemiBold.woff2, Peyda-Bold.woff2, Peyda-Black.woff2
 *   2. Uncomment the `localFont` block below.
 *   3. Add `${peyda.variable}` to the `<html>` className.
 *
 * Until then the design system gracefully degrades to Vazirmatn at
 * heavier weights via the CSS variable cascade defined in tailwind.config.
 *
 * Example:
 *
 *   import localFont from "next/font/local";
 *   const peyda = localFont({
 *     src: [
 *       { path: "../public/fonts/peyda/Peyda-Regular.woff2",  weight: "400", style: "normal" },
 *       { path: "../public/fonts/peyda/Peyda-Medium.woff2",   weight: "500", style: "normal" },
 *       { path: "../public/fonts/peyda/Peyda-SemiBold.woff2", weight: "600", style: "normal" },
 *       { path: "../public/fonts/peyda/Peyda-Bold.woff2",     weight: "700", style: "normal" },
 *       { path: "../public/fonts/peyda/Peyda-Black.woff2",    weight: "900", style: "normal" },
 *     ],
 *     variable: "--font-peyda",
 *     display: "swap",
 *     preload: true,
 *     fallback: ["system-ui", "Tahoma", "Arial", "sans-serif"],
 *   });
 */

export const metadata: Metadata = {
  metadataBase: new URL("https://chomp-sandwich.example"),
  title: {
    default: "چامپ | Chomp Sandwich — ساندویچ میکس با ذائقه‌ی شما",
    template: "%s | چامپ",
  },
  description:
    "چامپ؛ تجربه‌ای متفاوت از ساندویچ میکس با امکان شخصی‌سازی کامل. ساندویچ خودت رو قدم به قدم بساز و سفارش بده.",
  keywords: [
    "ساندویچ",
    "چاپ",
    "Chomp",
    "رست بیف",
    "بوقلمون",
    "بیکن",
    "ساندویچ میکس",
    "سفارش آنلاین",
    "سفارش ساندویچ",
  ],
  openGraph: {
    title: "چامپ | Chomp Sandwich",
    description: "ساندویچ میکس با شخصی‌سازی کامل — مثل ساب‌وی، اما به سبک چاپ.",
    type: "website",
    locale: "fa_IR",
    siteName: "Chomp Sandwich",
  },
  twitter: {
    card: "summary_large_image",
    title: "چامپ",
    description: "ساندویچ میکس با شخصی‌سازی کامل.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f56a16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazir.variable}
      suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[var(--background)] font-sans antialiased text-ink-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}

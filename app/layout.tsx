import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazir",
});

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
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="min-h-screen flex flex-col bg-[var(--background)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}

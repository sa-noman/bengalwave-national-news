import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bengal Wave | বাংলা নিউজ", template: "%s | Bengal Wave" },
  description: "Bengal Wave বাংলা ডিজিটাল নিউজপোর্টালের উন্নয়নাধীন সংস্করণ।",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#073f34" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><body><SiteHeader/>{children}<SiteFooter/></body></html>;
}

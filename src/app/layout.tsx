import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { MarketingTracking } from "@/components/analytics/MarketingTracking";
import { getSiteSettings } from "@/actions/public";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Paulin N'ZIAN - Personal Shopper | Achetez moins cher en Europe",
    template: "%s | Paulin N'ZIAN Personal Shopper",
  },
  description:
    "Personal Shopper pour vos achats sur SHEIN, Fashion Nova, Zara, Amazon, Apple, Samsung et vos boutiques préférées. Tarifs transparents, zéro frais caché et réexpédition de vos colis.",
  keywords: ["personal shopper", "SHEIN", "Abidjan", "achat europe", "réexpédition", "côte d'ivoire"],
  authors: [{ name: "Paulin N'ZIAN" }],
  creator: "Paulin N'ZIAN",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://paulinnzian.com",
    siteName: "MR SHEIN - Personal Shopper",
    title: "Paulin N'ZIAN - Personal Shopper | Achetez moins cher en Europe",
    description: "Personal Shopper pour vos achats en Europe. Réexpédition vers Abidjan et destinations africaines.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paulin N'ZIAN - Personal Shopper",
    description: "Achetez moins cher sur vos boutiques préférées. Zéro frais caché, zéro commission.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FF6500",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans">
        <LayoutWrapper
          facebookUrl={settings.facebook_url || "https://www.facebook.com/profile.php?id=61570727913162"}
          instagramUrl={settings.instagram_url || "https://www.instagram.com/paulinnzianofficiel"}
          whatsappUrl={settings.whatsapp_link || "https://wa.me/33637036839"}
          whatsappNumber={settings.whatsapp_number || "+33 6 37 03 68 39"}
          phoneCi={settings.phone_ci || "+225 07 77 06 13 30"}
          addressParis={settings.address_paris || "Paris 18ème arrondissement"}
          addressAbidjan={settings.address_abidjan || "Cocody Faya, Abidjan"}
          siteName={settings.site_name || "Paulin N'ZIAN"}
          siteSlogan={settings.site_slogan || "Votre Personal Shopper pour vos achats en Europe."}
          heroTitle={settings.hero_title || ""}
          heroSubtitle={settings.hero_subtitle || ""}
        >
          {children}
        </LayoutWrapper>
        <Toaster richColors position="top-right" />
        <MarketingTracking
          facebookPixelId={settings.facebook_pixel_id}
          googleAdsId={settings.google_ads_id}
          googleAnalyticsId={settings.google_analytics_id}
          tiktokPixelId={settings.tiktok_pixel_id}
        />
      </body>
    </html>
  );
}

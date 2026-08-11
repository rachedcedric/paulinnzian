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

const defaultDescription = "Personal Shopper pour vos achats sur SHEIN, Fashion Nova, Zara, Amazon, Apple, Samsung et vos boutiques préférées. Tarifs transparents, zéro frais caché et réexpédition de vos colis.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.site_name || "Paulin N'ZIAN - Personal Shopper";
  const description = settings.meta_description || defaultDescription;
  const title = `${siteName} | Achetez moins cher en Europe`;

  return {
    title: { default: title, template: `%s | ${siteName}` },
    description,
    keywords: ["personal shopper", "SHEIN", "Abidjan", "achat europe", "réexpédition", "côte d'ivoire"],
    authors: [{ name: siteName }],
    creator: siteName,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: "https://paulinnzian.com",
      siteName,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title: siteName, description },
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
}

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
          tiktokUrl={settings.tiktok_url || "https://www.tiktok.com/@paulinnzianofficiel"}
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

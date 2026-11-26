import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { MarketingTracking } from "@/components/analytics/MarketingTracking";
import { SiteStats } from "@/components/analytics/SiteStats";
import { getSiteSettings } from "@/actions/public";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"],
  style: ["italic", "normal"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["500", "600", "700"],
});

const defaultDescription =
  "Personal Shopper entre Paris et Abidjan : achetez sur SHEIN, Zara, H&M, Nike, Amazon et toutes vos boutiques préférées en Europe au même taux, 1 € = 670 FCFA. Réception à Paris, livraison sécurisée à Abidjan et Dakar.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.site_name || "Paulin N'ZIAN - Personal Shopper";
  const description = settings.meta_description || defaultDescription;
  const title = `${siteName} | Personal Shopper entre Paris & Abidjan`;

  return {
    title: { default: title, template: `%s | ${siteName}` },
    description,
    keywords: [
      "personal shopper Abidjan",
      "personal shopper Côte d'Ivoire",
      "personal shopper Paris Abidjan",
      "achats en ligne Côte d'Ivoire",
      "commander SHEIN Abidjan",
      "commander Zara Abidjan",
      "shopping Europe Côte d'Ivoire",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    alternates: { canonical: "https://paulinnzian.com" },
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
  themeColor: "#090B10",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const announcementText = settings.announcement_text || "";

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} ${caveat.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col font-sans">
        <LayoutWrapper
          facebookUrl={settings.facebook_url || "https://www.facebook.com/profile.php?id=61570727913162"}
          instagramUrl={settings.instagram_url || "https://www.instagram.com/paulinnzianofficiel"}
          tiktokUrl={settings.tiktok_url || "https://www.tiktok.com/@paulinnzianofficiel"}
          whatsappUrl={settings.whatsapp_link || "https://wa.me/33637036839"}
          whatsappNumber={settings.whatsapp_number || "+33 6 37 03 68 39"}
          whatsappChannelUrl={settings.whatsapp_channel_url || "https://whatsapp.com/channel/0029VbDg7mxBfxo0wYkvON0c"}
          whatsappGroupUrl={
            settings.whatsapp_group_url || "https://chat.whatsapp.com/HiYx6A1zEkZ9YseXXxgV71?s=cl&p=i&mlu=4&ilr=4&iam=2"
          }
          phoneCi={settings.phone_ci || "+225 07 77 06 13 30"}
          addressParis={settings.address_paris || "Paris 18ème arrondissement"}
          addressAbidjan={settings.address_abidjan || "Cocody Faya, Abidjan"}
          siteName={settings.site_name || "Paulin N'ZIAN"}
          siteSlogan={settings.site_slogan || "Votre Personal Shopper pour vos achats en Europe."}
          heroEyebrow={settings.hero_eyebrow || "Votre expert des achats en Europe"}
          heroTitle={settings.hero_title_before || "Votre"}
          heroTitleHighlight={settings.hero_title_highlight || "Personal Shopper"}
          heroTitleAfter={settings.hero_title_after || "entre Paris & Abidjan"}
          heroTagline={settings.hero_tagline || "Je m'occupe de tout, vous recevez en toute tranquillité !"}
          heroSubtitle={
            settings.hero_subtitle_text ||
            "Achetez sur toutes vos boutiques préférées en Europe, je valide vos commandes et je vous les fais livrer à Abidjan (et Dakar) en toute sécurité."
          }
          heroCtaPrimary={settings.hero_cta_primary || "Commander sur WhatsApp"}
          heroCtaSecondary={settings.hero_cta_secondary || "Faire un devis d'achat"}
          heroImage={settings.hero_image ? "/api/site-assets/hero" : ""}
          announcementEnabled={settings.announcement_enabled === "true"}
          announcementText={announcementText}
          announcementLink={settings.announcement_link || ""}
        >
          {children}
        </LayoutWrapper>
        <Toaster richColors position="top-right" />
        <SiteStats />
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

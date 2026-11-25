"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingButtons } from "./FloatingButtons";
import { AnnouncementBar } from "./AnnouncementBar";
import { SiteConfigProvider } from "./SiteConfigContext";
import { cn } from "@/lib/utils";

interface LayoutWrapperProps {
  children: React.ReactNode;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  whatsappUrl: string;
  whatsappNumber: string;
  whatsappChannelUrl: string;
  whatsappGroupUrl: string;
  phoneCi: string;
  addressParis: string;
  addressAbidjan: string;
  siteName: string;
  siteSlogan: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroTitleAfter: string;
  heroTagline: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroImage: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
}

export function LayoutWrapper({ children, facebookUrl, instagramUrl, tiktokUrl, ...siteConfig }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const showAnnouncement = !isAdmin && siteConfig.announcementEnabled && siteConfig.announcementText.trim().length > 0;

  return (
    <SiteConfigProvider value={siteConfig}>
      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <Header />}
      <main className={cn("flex-1", showAnnouncement && "pt-9")}>{children}</main>
      {!isAdmin && <Footer facebookUrl={facebookUrl} instagramUrl={instagramUrl} tiktokUrl={tiktokUrl} />}
      {!isAdmin && <FloatingButtons />}
    </SiteConfigProvider>
  );
}

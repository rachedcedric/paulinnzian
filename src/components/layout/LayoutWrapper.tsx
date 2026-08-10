"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingButtons } from "./FloatingButtons";
import { SiteConfigProvider } from "./SiteConfigContext";

interface LayoutWrapperProps {
  children: React.ReactNode;
  facebookUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
  whatsappNumber: string;
  phoneCi: string;
  addressParis: string;
  addressAbidjan: string;
  siteName: string;
  siteSlogan: string;
  heroTitle: string;
  heroSubtitle: string;
}

export function LayoutWrapper({ children, facebookUrl, instagramUrl, ...siteConfig }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <SiteConfigProvider value={siteConfig}>
      {!isAdmin && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer facebookUrl={facebookUrl} instagramUrl={instagramUrl} />}
      {!isAdmin && <FloatingButtons />}
    </SiteConfigProvider>
  );
}

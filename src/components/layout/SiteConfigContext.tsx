"use client";

import { createContext, useContext } from "react";

interface SiteConfig {
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

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SiteConfig;
}) {
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  const config = useContext(SiteConfigContext);
  if (!config) throw new Error("useSiteConfig must be used within SiteConfigProvider");
  return config;
}

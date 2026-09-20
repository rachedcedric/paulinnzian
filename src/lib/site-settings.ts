import { prisma } from "@/lib/db";

type SiteSettings = Record<string, string>;

export const HERO_IMAGE_PATH = "/api/site-assets/hero";

const globalForSiteSettings = globalThis as unknown as {
  siteSettingsPromise: Promise<SiteSettings> | undefined;
  siteSettingsExpiresAt: number | undefined;
};

export function getCachedSiteSettings() {
  const now = Date.now();
  if (
    globalForSiteSettings.siteSettingsPromise &&
    (globalForSiteSettings.siteSettingsExpiresAt ?? 0) > now
  ) {
    return globalForSiteSettings.siteSettingsPromise;
  }

  const settingsPromise = Promise.all([
    prisma.siteSetting.findMany({
      where: { key: { not: "hero_image" } },
      select: { key: true, value: true },
    }),
    prisma.siteSetting.findFirst({
      where: { key: "hero_image", value: { not: "" } },
      select: { id: true },
    }),
  ]).then(([settings, heroImage]): SiteSettings => {
    const result: SiteSettings = Object.fromEntries(settings.map(({ key, value }) => [key, value]));
    if (heroImage) result.hero_image = HERO_IMAGE_PATH;
    return result;
  });

  globalForSiteSettings.siteSettingsPromise = settingsPromise;
  globalForSiteSettings.siteSettingsExpiresAt = now + 5 * 60 * 1000;

  settingsPromise.catch(() => {
    if (globalForSiteSettings.siteSettingsPromise === settingsPromise) {
      invalidateSiteSettingsCache();
    }
  });

  return settingsPromise;
}

export function invalidateSiteSettingsCache() {
  globalForSiteSettings.siteSettingsPromise = undefined;
  globalForSiteSettings.siteSettingsExpiresAt = 0;
}
import { prisma } from "@/lib/db";

type SiteSettings = Record<string, string>;

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

  const settingsPromise = prisma.siteSetting.findMany().then((settings) =>
    Object.fromEntries(settings.map(({ key, value }) => [key, value]))
  );

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
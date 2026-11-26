// Anonymous audience classification: where a visit came from, from the entry referrer and landing query only.

export const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  "google-ads": "Google (pub)",
  facebook: "Facebook",
  "facebook-ads": "Facebook (pub)",
  instagram: "Instagram",
  "instagram-ads": "Instagram (pub)",
  tiktok: "TikTok",
  "tiktok-ads": "TikTok (pub)",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
  snapchat: "Snapchat",
  direct: "Accès direct",
  other: "Autres sites",
};

const REFERRER_DOMAINS: [string, string][] = [
  ["facebook", "facebook.com"], ["facebook", "fb.com"], ["facebook", "fb.me"], ["facebook", "messenger.com"],
  ["instagram", "instagram.com"], ["tiktok", "tiktok.com"], ["whatsapp", "whatsapp.com"], ["whatsapp", "wa.me"],
  ["youtube", "youtube.com"], ["youtube", "youtu.be"], ["snapchat", "snapchat.com"],
];

// Android apps send "android-app://<package>" as the referrer.
const ANDROID_APPS: [string, string][] = [
  ["google", "com.google."], ["facebook", "com.facebook."], ["instagram", "com.instagram."],
  ["tiktok", "com.zhiliaoapp.musically"], ["tiktok", "com.ss.android.ugc"], ["whatsapp", "com.whatsapp"],
];

const UTM_ALIASES: Record<string, string> = {
  fb: "facebook", "facebook.com": "facebook", meta: "facebook", ig: "instagram", insta: "instagram",
  "instagram.com": "instagram", tt: "tiktok", "tiktok.com": "tiktok", wa: "whatsapp", "google.com": "google",
};

const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paid_social", "paid-social", "ads", "ad", "pub"]);
const PAID_CAPABLE = new Set(["google", "facebook", "instagram", "tiktok"]);

export interface VisitOrigin {
  source: string;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

function clean(value: string | null, max: number) {
  const trimmed = value?.trim().toLowerCase().slice(0, max);
  return trimmed || null;
}

function slug(value: string) {
  return value.replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "other";
}

function matchesDomain(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

export function classifyVisit(referrer: string, landingQuery: string, ownHost: string): VisitOrigin {
  const params = new URLSearchParams(landingQuery.startsWith("?") ? landingQuery.slice(1) : landingQuery);
  const utmSource = clean(params.get("utm_source"), 100);
  const utmMedium = clean(params.get("utm_medium"), 100);
  const utmCampaign = clean(params.get("utm_campaign"), 150);

  let referrerHost: string | null = null;
  let fromReferrer = "direct";
  try {
    const url = new URL(referrer);
    if (url.protocol === "android-app:") {
      const app = url.hostname.toLowerCase();
      fromReferrer = ANDROID_APPS.find(([, prefix]) => app.startsWith(prefix))?.[0] ?? "other";
      referrerHost = app.slice(0, 255);
    } else if (url.protocol === "http:" || url.protocol === "https:") {
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      if (host !== ownHost.toLowerCase().replace(/^www\./, "")) {
        referrerHost = host.slice(0, 255);
        fromReferrer = /(^|\.)google\.[a-z.]+$/.test(host)
          ? "google"
          : REFERRER_DOMAINS.find(([, domain]) => matchesDomain(host, domain))?.[0] ?? "other";
      }
    }
  } catch {
    // Empty or malformed referrer: a direct visit.
  }

  let source = fromReferrer;
  if (utmSource) source = UTM_ALIASES[utmSource] ?? slug(utmSource);
  else if (params.has("gclid")) source = "google-ads";
  else if (params.has("ttclid")) source = "tiktok-ads";
  else if (params.has("fbclid") && fromReferrer === "direct") source = "facebook";

  if (utmMedium && PAID_MEDIUMS.has(utmMedium) && PAID_CAPABLE.has(source)) source = `${source}-ads`;
  return { source, referrerHost, utmSource, utmMedium, utmCampaign };
}

export function deviceFromUserAgent(userAgent: string) {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(userAgent)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function isBot(userAgent: string) {
  return !userAgent || /bot|crawl|spider|slurp|facebookexternalhit|whatsapp\/|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|axios|node-fetch|go-http/i.test(userAgent);
}

export function isWhatsAppHost(host: string | null) {
  return host != null && (matchesDomain(host, "wa.me") || matchesDomain(host, "whatsapp.com"));
}

export function sourceLabel(source: string) {
  return SOURCE_LABELS[source] ?? source;
}

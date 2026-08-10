"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Props {
  facebookPixelId?: string;
  googleAdsId?: string;
  googleAnalyticsId?: string;
  tiktokPixelId?: string;
}

const META_ID = /^\d{5,30}$/;
const GOOGLE_ADS_ID = /^AW-\d+$/;
const GOOGLE_ANALYTICS_ID = /^(G|GT)-[A-Z0-9-]+$/;
const TIKTOK_ID = /^[A-Z0-9]{10,30}$/;
export const COOKIE_CONSENT_KEY = "paulinnzian-cookie-consent";
export const COOKIE_CONSENT_EVENT = "cookie-consent-change";

export function MarketingTracking({
  facebookPixelId,
  googleAdsId,
  googleAnalyticsId,
  tiktokPixelId,
}: Props) {
  const pathname = usePathname();
  const firstPage = useRef(true);
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [choiceMade, setChoiceMade] = useState(false);
  const meta = META_ID.test(facebookPixelId ?? "") ? facebookPixelId : undefined;
  const ads = GOOGLE_ADS_ID.test(googleAdsId ?? "") ? googleAdsId : undefined;
  const analytics = GOOGLE_ANALYTICS_ID.test(googleAnalyticsId ?? "") ? googleAnalyticsId : undefined;
  const tiktok = TIKTOK_ID.test(tiktokPixelId ?? "") ? tiktokPixelId : undefined;
  const googleId = analytics ?? ads;
  const hasMarketing = Boolean(googleId || meta || tiktok);
  const trackingEnabled = consent === "accepted" && !pathname.startsWith("/admin");

  useEffect(() => {
    const updateConsent = () => {
      const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      setConsent(storedConsent === "accepted" || storedConsent === "rejected" ? storedConsent : null);
      setChoiceMade(storedConsent === "accepted" || storedConsent === "rejected");
    };

    updateConsent();
    window.addEventListener(COOKIE_CONSENT_EVENT, updateConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, updateConsent);
  }, []);

  const saveConsent = (value: "accepted" | "rejected") => {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setConsent(value);
    setChoiceMade(true);
  };

  useEffect(() => {
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }

    const trackingWindow = window as Window & {
      fbq?: (...args: unknown[]) => void;
      gtag?: (...args: unknown[]) => void;
      ttq?: { page?: () => void };
    };

    if (trackingEnabled) {
      if (meta) trackingWindow.fbq?.("track", "PageView");
      if (analytics) trackingWindow.gtag?.("config", analytics, { page_path: pathname });
      if (tiktok) trackingWindow.ttq?.page?.();
    }
  }, [analytics, meta, pathname, tiktok, trackingEnabled]);

  return (
    <>
      {trackingEnabled && googleId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleId}`} strategy="afterInteractive" />
          <Script id="google-marketing" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${analytics ? `gtag('config',${JSON.stringify(analytics)});` : ""}${ads ? `gtag('config',${JSON.stringify(ads)});` : ""}`}
          </Script>
        </>
      )}

      {trackingEnabled && meta && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(meta)});fbq('track','PageView');`}
        </Script>
      )}

      {trackingEnabled && tiktok && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js',o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var a=d.createElement('script');a.type='text/javascript';a.async=!0;a.src=r+'?sdkid='+e+'&lib='+t;var s=d.getElementsByTagName('script')[0];s.parentNode.insertBefore(a,s)};ttq.load(${JSON.stringify(tiktok)});ttq.page()}(window,document,'ttq');`}
        </Script>
      )}

      {hasMarketing && !pathname.startsWith("/admin") && !choiceMade && (
        <div
          role="dialog"
          aria-label="Choix des cookies"
          aria-live="polite"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-lg border border-gray-700 bg-black p-5 text-white shadow-2xl sm:flex sm:items-center sm:gap-6"
        >
          <p className="text-sm leading-relaxed text-gray-300 sm:flex-1">
            Nous utilisons des cookies de mesure et de publicité uniquement avec votre accord. Le refus ne limite aucune fonction du site. {" "}
            <Link href="/cookies" className="font-semibold text-[#FF6500] hover:underline">En savoir plus</Link>
          </p>
          <div className="mt-4 flex gap-3 sm:mt-0">
            <button type="button" onClick={() => saveConsent("rejected")} className="flex-1 rounded-lg border border-gray-500 px-4 py-2 text-sm font-semibold hover:bg-gray-900 sm:flex-none">
              Refuser
            </button>
            <button type="button" onClick={() => saveConsent("accepted")} className="flex-1 rounded-lg bg-[#FF6500] px-4 py-2 text-sm font-semibold hover:bg-[#e65b00] sm:flex-none">
              Accepter
            </button>
          </div>
        </div>
      )}
    </>
  );
}
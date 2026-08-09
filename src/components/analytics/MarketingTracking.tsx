"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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

export function MarketingTracking({
  facebookPixelId,
  googleAdsId,
  googleAnalyticsId,
  tiktokPixelId,
}: Props) {
  const pathname = usePathname();
  const firstPage = useRef(true);
  const meta = META_ID.test(facebookPixelId ?? "") ? facebookPixelId : undefined;
  const ads = GOOGLE_ADS_ID.test(googleAdsId ?? "") ? googleAdsId : undefined;
  const analytics = GOOGLE_ANALYTICS_ID.test(googleAnalyticsId ?? "") ? googleAnalyticsId : undefined;
  const tiktok = TIKTOK_ID.test(tiktokPixelId ?? "") ? tiktokPixelId : undefined;
  const googleId = analytics ?? ads;

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

    if (meta) trackingWindow.fbq?.("track", "PageView");
    if (analytics) trackingWindow.gtag?.("config", analytics, { page_path: pathname });
    if (tiktok) trackingWindow.ttq?.page?.();
  }, [analytics, meta, pathname, tiktok]);

  return (
    <>
      {googleId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleId}`} strategy="afterInteractive" />
          <Script id="google-marketing" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${analytics ? `gtag('config',${JSON.stringify(analytics)});` : ""}${ads ? `gtag('config',${JSON.stringify(ads)});` : ""}`}
          </Script>
        </>
      )}

      {meta && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(meta)});fbq('track','PageView');`}
        </Script>
      )}

      {tiktok && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js',o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var a=d.createElement('script');a.type='text/javascript';a.async=!0;a.src=r+'?sdkid='+e+'&lib='+t;var s=d.getElementsByTagName('script')[0];s.parentNode.insertBefore(a,s)};ttq.load(${JSON.stringify(tiktok)});ttq.page()}(window,document,'ttq');`}
        </Script>
      )}
    </>
  );
}
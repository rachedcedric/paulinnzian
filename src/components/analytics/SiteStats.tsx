"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Per-tab memory of how the visit started (referrer + landing query), so later pages and clicks keep their source.
const ENTRY_KEY = "pn-visit-entry";

interface Entry {
  r: string;
  q: string;
}

function readEntry(): Entry | null {
  try {
    const raw = sessionStorage.getItem(ENTRY_KEY);
    return raw ? (JSON.parse(raw) as Entry) : null;
  } catch {
    return null;
  }
}

function send(type: "visit" | "page" | "click", path: string, entry: Entry, href?: string) {
  const body = JSON.stringify({ t: type, p: path.slice(0, 300), r: entry.r, q: entry.q, ...(href ? { h: href.slice(0, 1_000) } : {}) });
  if (!navigator.sendBeacon?.("/api/stats", body)) {
    fetch("/api/stats", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

/** Anonymous first-party audience measurement: no cookie, no identifier, admin pages excluded. */
export function SiteStats() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let entry = readEntry();
    const type = entry ? "page" : "visit";
    if (!entry) {
      entry = { r: document.referrer.slice(0, 1_000), q: window.location.search.slice(0, 1_000) };
      try {
        sessionStorage.setItem(ENTRY_KEY, JSON.stringify(entry));
      } catch {
        // Storage blocked: every page then counts as a visit.
      }
    }
    send(type, pathname, entry);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || window.location.pathname.startsWith("/admin")) return;
      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      if (url.host === window.location.host || (url.protocol !== "https:" && url.protocol !== "http:")) return;
      send("click", window.location.pathname, readEntry() ?? { r: "", q: "" }, url.href);

      // Conversion for ad platforms; these globals exist only after the visitor accepted marketing cookies.
      if (/(^|\.)(wa\.me|whatsapp\.com)$/.test(url.hostname)) {
        const w = window as Window & {
          fbq?: (...args: unknown[]) => void;
          gtag?: (...args: unknown[]) => void;
          ttq?: { track?: (...args: unknown[]) => void };
        };
        w.fbq?.("track", "Contact");
        w.gtag?.("event", "generate_lead", { method: "whatsapp" });
        w.ttq?.track?.("Contact");
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

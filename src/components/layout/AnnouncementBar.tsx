"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { useSiteConfig } from "./SiteConfigContext";

// Static on purpose: a looping marquee is moving content with no pause control (WCAG 2.2.2).
export function AnnouncementBar() {
  const { announcementEnabled, announcementText, announcementLink } = useSiteConfig();

  if (!announcementEnabled || !announcementText.trim()) return null;

  const message = announcementText.trim();
  const isInternalLink = announcementLink.startsWith("/");
  const linkClass = "min-w-0 max-w-full underline-offset-4 hover:underline";
  const content = (
    <span className="flex min-w-0 items-center justify-center gap-2 px-4">
      <Plane className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
      <span className="truncate" title={message}>{message}</span>
    </span>
  );

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 z-[60] flex h-9 items-center justify-center bg-ink text-xs font-semibold uppercase tracking-wide text-white [--focus-ring:var(--gold)] sm:text-sm"
    >
      {announcementLink.trim() ? (
        isInternalLink ? (
          <Link href={announcementLink} className={linkClass}>
            {content}
          </Link>
        ) : (
          <a href={announcementLink} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {content}
          </a>
        )
      ) : (
        content
      )}
    </div>
  );
}

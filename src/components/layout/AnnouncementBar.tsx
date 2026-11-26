"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { useSiteConfig } from "./SiteConfigContext";

const REPEAT_COUNT = 6;

// The owner's "bande défilante": it scrolls, pauses on hover or focus, and stands still under reduced motion (globals.css).
export function AnnouncementBar() {
  const { announcementEnabled, announcementText, announcementLink } = useSiteConfig();

  if (!announcementEnabled || !announcementText.trim()) return null;

  const message = announcementText.trim();
  const isInternalLink = announcementLink.startsWith("/");
  const content = (
    <div className="flex items-center whitespace-nowrap animate-marquee">
      {[0, 1].map((half) => (
        <div key={half} className="flex items-center" aria-hidden={half === 1}>
          {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
            <span key={i} className="flex items-center gap-2 px-6" aria-hidden={i > 0 || undefined}>
              <Plane className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
              {message}
            </span>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 z-[60] flex h-9 items-center overflow-hidden bg-ink text-xs font-semibold uppercase tracking-wide text-white [--focus-ring:var(--gold)] sm:text-sm"
    >
      {announcementLink.trim() ? (
        isInternalLink ? (
          <Link href={announcementLink} className="w-full hover:opacity-90 transition-opacity">
            {content}
          </Link>
        ) : (
          <a href={announcementLink} target="_blank" rel="noopener noreferrer" className="w-full hover:opacity-90 transition-opacity">
            {content}
          </a>
        )
      ) : (
        content
      )}
    </div>
  );
}

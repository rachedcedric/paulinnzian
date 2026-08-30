"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { useSiteConfig } from "./SiteConfigContext";

const REPEAT_COUNT = 6;

export function AnnouncementBar() {
  const { announcementEnabled, announcementText, announcementLink } = useSiteConfig();

  if (!announcementEnabled || !announcementText.trim()) return null;

  const message = announcementText.trim().toUpperCase();
  const isInternalLink = announcementLink.startsWith("/");
  const content = (
    <div className="flex items-center whitespace-nowrap animate-marquee">
      {[0, 1].map((half) => (
        <div key={half} className="flex items-center" aria-hidden={half === 1}>
          {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
            <span key={i} className="flex items-center gap-2 px-6 text-xs sm:text-sm font-semibold tracking-wide">
              <Plane className="w-3.5 h-3.5 shrink-0 text-[#D99A12]" />
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
      className="fixed top-0 left-0 right-0 z-[60] h-9 bg-[#090B10] text-white overflow-hidden flex items-center"
    >
      {announcementLink.trim() ? (
        isInternalLink ? (
          <Link href={announcementLink} className="w-full hover:opacity-90 transition-opacity">
            {content}
          </Link>
        ) : (
          <a
            href={announcementLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full hover:opacity-90 transition-opacity"
          >
            {content}
          </a>
        )
      ) : (
        content
      )}
    </div>
  );
}

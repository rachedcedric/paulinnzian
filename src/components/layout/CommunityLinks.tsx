"use client";

import { Megaphone, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "./SiteConfigContext";

/** WhatsApp channel + group links (editable in Admin → Paramètres). Meant for dark backgrounds. */
export function CommunityLinks({ className }: { className?: string }) {
  const { whatsappChannelUrl, whatsappGroupUrl } = useSiteConfig();
  const links = [
    { href: whatsappChannelUrl, label: "Suivre la chaîne WhatsApp", icon: Megaphone },
    { href: whatsappGroupUrl, label: "Rejoindre le groupe WhatsApp", icon: Users },
  ];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#25D366] px-4 py-2.5 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
        >
          <Icon className="w-4 h-4" aria-hidden />
          {label}
        </a>
      ))}
    </div>
  );
}

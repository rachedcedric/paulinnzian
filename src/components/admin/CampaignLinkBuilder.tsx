"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "google", label: "Google" },
];

// "pub" marks paid traffic: the stats page then shows the channel as "(pub)".
const PLACEMENTS = [
  { value: "statut", label: "Statut" },
  { value: "groupe", label: "Groupe" },
  { value: "chaine", label: "Chaîne" },
  { value: "post", label: "Publication" },
  { value: "story", label: "Story" },
  { value: "bio", label: "Lien en bio" },
  { value: "pub", label: "Publicité payante" },
];

const PAGES = ["/", "/promos", "/tarifs", "/devis-achat", "/boutiques", "/comment-ca-marche"];
const select = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D99A12]";

function slug(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export function CampaignLinkBuilder({ baseUrl }: { baseUrl: string }) {
  const [page, setPage] = useState("/");
  const [channel, setChannel] = useState("whatsapp");
  const [placement, setPlacement] = useState("statut");
  const [campaign, setCampaign] = useState("");

  const params = new URLSearchParams({ utm_source: channel, utm_medium: placement });
  if (slug(campaign)) params.set("utm_campaign", slug(campaign));
  const link = `${baseUrl}${page}?${params}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Lien copié");
    } catch {
      toast.error("Copie impossible : sélectionnez le lien à la main");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="utm-page" className="mb-1 block text-xs font-semibold">Page</label>
          <select id="utm-page" value={page} onChange={(e) => setPage(e.target.value)} className={select}>
            {PAGES.map((path) => <option key={path} value={path}>{path === "/" ? "Accueil" : path}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="utm-channel" className="mb-1 block text-xs font-semibold">Où vous le partagez</label>
          <select id="utm-channel" value={channel} onChange={(e) => setChannel(e.target.value)} className={select}>
            {CHANNELS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="utm-placement" className="mb-1 block text-xs font-semibold">Emplacement</label>
          <select id="utm-placement" value={placement} onChange={(e) => setPlacement(e.target.value)} className={select}>
            {PLACEMENTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="utm-campaign" className="mb-1 block text-xs font-semibold">Nom de la campagne</label>
          <input id="utm-campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Ex : promo noël" className={select} />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <output aria-label="Lien de campagne" className="min-w-0 flex-1 break-all rounded-xl bg-gray-50 px-3 py-2.5 font-mono text-xs text-gray-800">
          {link}
        </output>
        <button type="button" onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D99A12] px-4 py-2.5 text-sm font-semibold text-white">
          <Copy className="h-4 w-4" aria-hidden /> Copier
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BarChart3, ImageIcon, Megaphone, Save, X } from "lucide-react";
import { updateSiteSettings } from "@/actions/admin";

const generalFields = [
  { key: "site_name", label: "Nom commercial" },
  { key: "site_slogan", label: "Slogan" },
  { key: "whatsapp_number", label: "WhatsApp (numéro)" },
  { key: "whatsapp_link", label: "WhatsApp (lien)" },
  { key: "whatsapp_channel_url", label: "Chaîne WhatsApp (lien)" },
  { key: "whatsapp_group_url", label: "Groupe WhatsApp (lien)" },
  { key: "phone_ci", label: "Téléphone CI" },
  { key: "address_paris", label: "Adresse Paris" },
  { key: "address_abidjan", label: "Adresse Abidjan" },
  { key: "facebook_url", label: "Facebook URL" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "tiktok_url", label: "TikTok URL" },
  { key: "meta_description", label: "Meta description SEO" },
];

const trackingFields = [
  { key: "facebook_pixel_id", label: "Meta / Facebook Pixel ID", placeholder: "Ex : 123456789012345" },
  { key: "google_ads_id", label: "Google Ads ID", placeholder: "Ex : AW-123456789" },
  { key: "google_analytics_id", label: "Google Analytics ID", placeholder: "Ex : G-XXXXXXXXXX" },
  { key: "tiktok_pixel_id", label: "TikTok Pixel ID", placeholder: "Ex : CXXXXXXXXXXXXXXXXX" },
];

export function ParametresAdmin({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  function handleHeroImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings((prev) => ({ ...prev, hero_image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateSiteSettings(settings);
    setSaving(false);
    if (result.success) {
      toast.success("Paramètres enregistrés");
    } else {
      toast.error("Erreur");
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-black">Paramètres</h1>
        <p className="text-gray-500 text-sm">Gérez les informations du site.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mb-6">
        <div className="space-y-4">
          {generalFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-black mb-1">{field.label}</label>
              {field.key === "meta_description" ? (
                <textarea
                  value={settings[field.key] || ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none resize-none"
                />
              ) : (
                <input
                  value={settings[field.key] || ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex items-center gap-2 bg-[#D99A12] hover:bg-[#C8912D] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          <Save className="w-5 h-5" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#D99A12]/10 text-[#D99A12] flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-black">Section Hero (page d&apos;accueil)</h2>
            <p className="text-xs text-gray-500">Texte et image affichés en haut de la page d&apos;accueil.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Image</label>
            <p className="text-xs text-gray-400 mb-2">
              Laissez vide pour garder l&apos;illustration Paris par défaut.
            </p>
            {settings.hero_image && (
              <div className="relative mb-3 w-full max-w-sm aspect-[16/10] rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.hero_image} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, hero_image: "" }))}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#D99A12] hover:bg-[#D99A12]/10 transition-colors text-sm font-semibold text-gray-600">
              <ImageIcon className="w-4 h-4" />
              {settings.hero_image ? "Changer l'image" : "Importer une image"}
              <input type="file" accept="image/*" onChange={handleHeroImageChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Accroche (au-dessus du titre)</label>
            <input
              value={settings.hero_eyebrow || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, hero_eyebrow: e.target.value }))}
              placeholder="Votre expert des achats en Europe"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Titre (avant)</label>
              <input
                value={settings.hero_title_before || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, hero_title_before: e.target.value }))}
                placeholder="Votre"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Titre (mis en avant, doré)</label>
              <input
                value={settings.hero_title_highlight || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, hero_title_highlight: e.target.value }))}
                placeholder="Personal Shopper"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Titre (après)</label>
              <input
                value={settings.hero_title_after || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, hero_title_after: e.target.value }))}
                placeholder="entre Paris & Abidjan"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Phrase manuscrite</label>
            <input
              value={settings.hero_tagline || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, hero_tagline: e.target.value }))}
              placeholder="Je m'occupe de tout, vous recevez en toute tranquillité !"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Sous-titre / description</label>
            <textarea
              value={settings.hero_subtitle_text || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, hero_subtitle_text: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">CTA principal (WhatsApp)</label>
              <input
                value={settings.hero_cta_primary || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, hero_cta_primary: e.target.value }))}
                placeholder="Commander sur WhatsApp"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">CTA secondaire (devis)</label>
              <input
                value={settings.hero_cta_secondary || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, hero_cta_secondary: e.target.value }))}
                placeholder="Faire un devis d'achat"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex items-center gap-2 bg-[#D99A12] hover:bg-[#C8912D] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          <Save className="w-5 h-5" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#D99A12]/10 text-[#D99A12] flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-black">Bande d&apos;annonce</h2>
            <p className="text-xs text-gray-500">
              Message défilant affiché en haut du site, au-dessus du menu.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-black">
            <input
              type="checkbox"
              checked={settings.announcement_enabled === "true"}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, announcement_enabled: e.target.checked ? "true" : "false" }))
              }
              className="w-4 h-4 accent-[#D99A12]"
            />
            Afficher la bande d&apos;annonce
          </label>
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Message</label>
            <input
              value={settings.announcement_text || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, announcement_text: e.target.value }))}
              placeholder="Ex : Prochain départ Paris - Abidjan"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Lien (optionnel) <span className="font-normal text-gray-400">— page ou URL au clic</span>
            </label>
            <input
              value={settings.announcement_link || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, announcement_link: e.target.value }))}
              placeholder="/devis-achat"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex items-center gap-2 bg-[#D99A12] hover:bg-[#C8912D] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          <Save className="w-5 h-5" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#D99A12]/10 text-[#D99A12] flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-black">Tracking marketing</h2>
            <p className="text-xs text-gray-500">Laissez un champ vide pour désactiver la plateforme.</p>
          </div>
        </div>

        <div className="space-y-4">
          {trackingFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-black mb-1">{field.label}</label>
              <input
                value={settings[field.key] || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value.trim() }))}
                placeholder={field.placeholder}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D99A12] focus:outline-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex items-center gap-2 bg-[#D99A12] hover:bg-[#C8912D] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          <Save className="w-5 h-5" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

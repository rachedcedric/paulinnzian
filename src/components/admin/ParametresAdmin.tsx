"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { updateSiteSettings } from "@/actions/admin";

const settingFields = [
  { key: "site_name", label: "Nom commercial" },
  { key: "site_slogan", label: "Slogan" },
  { key: "whatsapp_number", label: "WhatsApp (numéro)" },
  { key: "whatsapp_link", label: "WhatsApp (lien)" },
  { key: "phone_ci", label: "Téléphone CI" },
  { key: "address_paris", label: "Adresse Paris" },
  { key: "address_abidjan", label: "Adresse Abidjan" },
  { key: "facebook_url", label: "Facebook URL" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "hero_title", label: "Titre Hero" },
  { key: "hero_subtitle", label: "Sous-titre Hero" },
  { key: "meta_description", label: "Meta description SEO" },
];

export function ParametresAdmin({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

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

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
        <div className="space-y-4">
          {settingFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-black mb-1">{field.label}</label>
              {field.key === "meta_description" || field.key === "hero_subtitle" ? (
                <textarea
                  value={settings[field.key] || ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none resize-none"
                />
              ) : (
                <input
                  value={settings[field.key] || ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex items-center gap-2 bg-[#FF6500] hover:bg-[#e55a00] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          <Save className="w-5 h-5" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

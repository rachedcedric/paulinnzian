"use client";

import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY } from "@/components/analytics/MarketingTracking";

export function CookieSettingsButton() {
  const reopenSettings = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
  };

  return (
    <button type="button" onClick={reopenSettings} className="rounded-lg bg-black px-5 py-3 font-bold text-white hover:bg-[#FF6500]">
      Modifier mon choix
    </button>
  );
}
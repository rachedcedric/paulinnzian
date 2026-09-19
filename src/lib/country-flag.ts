const FLAGS: Record<string, string> = {
  "cote d'ivoire": "🇨🇮",
  "côte d'ivoire": "🇨🇮",
  "cote d’ivoire": "🇨🇮",
  "côte d’ivoire": "🇨🇮",
  france: "🇫🇷",
  senegal: "🇸🇳",
  sénégal: "🇸🇳",
  mali: "🇲🇱",
  "burkina faso": "🇧🇫",
  cameroun: "🇨🇲",
  guinee: "🇬🇳",
  guinée: "🇬🇳",
  benin: "🇧🇯",
  bénin: "🇧🇯",
  togo: "🇹🇬",
  gabon: "🇬🇦",
  congo: "🇨🇬",
  rdc: "🇨🇩",
  maroc: "🇲🇦",
  niger: "🇳🇪",
};

/** Flag emoji for a country name as typed in the admin; neutral globe when unknown. */
export function countryFlag(country: string | null | undefined) {
  if (!country) return "🌍";
  return FLAGS[country.trim().toLowerCase()] ?? "🌍";
}

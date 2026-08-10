import type { Metadata } from "next";
import { CookieSettingsButton } from "@/components/legal/CookieSettingsButton";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Politique relative aux cookies" };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies" introduction="Vous gardez le contrôle sur les outils de mesure et de publicité utilisés par le site.">
      <section>
        <h2>Cookies indispensables</h2>
        <p>Le site utilise les mécanismes strictement nécessaires à la sécurité, à la connexion des administrateurs et à la mémorisation de votre choix de consentement. Ils ne peuvent pas être désactivés depuis le bandeau.</p>
      </section>
      <section>
        <h2>Mesure et publicité</h2>
        <p>Après acceptation, des outils Google, Meta et TikTok peuvent mesurer les visites et l'efficacité des campagnes. Ils peuvent déposer ou lire leurs propres identifiants. Aucun de ces scripts n'est chargé lorsque vous refusez.</p>
      </section>
      <section>
        <h2>Modifier votre choix</h2>
        <p className="mb-5">Vous pouvez rouvrir le bandeau à tout moment. Un nouveau choix remplacera le précédent pour les prochaines visites.</p>
        <CookieSettingsButton />
      </section>
    </LegalPage>
  );
}
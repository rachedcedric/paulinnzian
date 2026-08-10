import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité" introduction="Comment vos données sont utilisées et protégées lorsque vous utilisez le service.">
      <section>
        <h2>Données collectées</h2>
        <ul>
          <li>Formulaire de contact : nom, téléphone, email facultatif, sujet et message.</li>
          <li>Gestion des commandes : coordonnées client, boutique, montant, colis, destination et suivi.</li>
          <li>Sécurité : identifiants techniques hachés et compteurs temporaires contre les abus.</li>
          <li>Mesure d'audience et publicité : uniquement après votre consentement.</li>
        </ul>
      </section>
      <section>
        <h2>Finalités et conservation</h2>
        <p>Ces données servent à répondre aux demandes, exécuter et suivre les commandes, administrer le service et prévenir les abus. Elles sont conservées pendant la durée nécessaire à ces finalités et aux obligations légales applicables. Les compteurs de sécurité publics expirent après dix minutes.</p>
      </section>
      <section>
        <h2>Destinataires et prestataires</h2>
        <p>Les données sont accessibles aux administrateurs autorisés. L'hébergement applicatif est assuré par Vercel et la base de données par Neon. Les échanges ouverts vers WhatsApp ou les réseaux sociaux relèvent aussi des politiques de ces services.</p>
      </section>
      <section>
        <h2>Vos droits</h2>
        <p>Vous pouvez demander l'accès, la rectification ou l'effacement de vos données, ainsi que vous opposer à certains traitements, depuis la <Link href="/contact">page de contact</Link>. Une vérification d'identité peut être demandée pour protéger vos informations.</p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>Consultez la <Link href="/cookies">politique relative aux cookies</Link> pour modifier votre choix à tout moment.</p>
      </section>
    </LegalPage>
  );
}
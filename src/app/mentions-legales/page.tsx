import type { Metadata } from "next";
import { getSiteSettings } from "@/actions/public";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Mentions légales" };
export const dynamic = "force-dynamic";

export default async function LegalNoticePage() {
  const settings = await getSiteSettings();
  const whatsappUrl = settings.whatsapp_link || "https://wa.me/33637036839";

  return (
    <LegalPage title="Mentions légales" introduction="Informations relatives à l'éditeur et au fonctionnement de ce site.">
      <section>
        <h2>Éditeur du site</h2>
        <p>Le site est édité par {settings.site_name || "Paulin N'ZIAN"}, Personal Shopper.</p>
        <p>Adresse à Paris : {settings.address_paris || "Paris 18ème arrondissement"}</p>
        <p>Adresse à Abidjan : {settings.address_abidjan || "Cocody Faya, Abidjan"}</p>
        <p>Contact : <a href={whatsappUrl}>{settings.whatsapp_number || "+33 6 37 03 68 39"}</a></p>
        <p>Directeur de la publication : Paulin N'ZIAN.</p>
      </section>
      <section>
        <h2>Hébergement</h2>
        <p>Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.</p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>Les textes, visuels, logos et éléments du site sont protégés. Toute reproduction ou utilisation non autorisée est interdite, sous réserve des droits détenus par leurs propriétaires respectifs.</p>
      </section>
      <section>
        <h2>Responsabilité</h2>
        <p>Les informations et tarifs sont présentés avec soin mais peuvent évoluer. Les boutiques tierces restent responsables de leurs produits, disponibilités et conditions de vente.</p>
      </section>
    </LegalPage>
  );
}
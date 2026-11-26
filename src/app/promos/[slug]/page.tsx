import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { getSiteSettings, getStorePromos } from "@/actions/public";
import { DEVIS_FCFA_PER_EUR } from "@/lib/devis";
import { getWhatsAppLink } from "@/lib/utils";

export const revalidate = 300;

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://paulinnzian.com";
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const fcfa = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStorePromos((await params).slug);
  if (!store) return {};
  return {
    title: `Promos ${store.name}`,
    description: `Les articles ${store.name} en promo sélectionnés par Paulin N'ZIAN, livrés à Abidjan et Dakar.`,
    alternates: { canonical: `${baseUrl}/promos/${store.slug}` },
  };
}

export default async function StorePromosPage({ params }: Props) {
  const { slug } = await params;
  const [store, settings] = await Promise.all([getStorePromos(slug), getSiteSettings()]);
  if (!store) notFound();
  const whatsapp = settings.whatsapp_link || "https://wa.me/33637036839";

  return (
    <div className="pt-20 min-h-screen bg-white">
      <header className="bg-black px-4 py-14 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D99A12]">Bons plans sélectionnés</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            PROMOS <span className="text-[#D99A12]">{store.name.toUpperCase()}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Les articles en promo que je repère pour vous sur {store.name}. Achetez directement, ou envoyez-moi
            l&apos;article : je commande et je vous fais livrer à Abidjan ou Dakar.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/promos" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#B57F0B]">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Toutes les promos
        </Link>
        <p className="mb-8 rounded-xl border border-[#D99A12]/30 bg-[#FFF8E7] px-4 py-3 text-sm text-gray-700">
          Liens affiliés : si vous achetez via ces liens, je reçois une petite commission, sans aucun surcoût pour vous.
          Les prix et les stocks peuvent changer sur {store.name}.
        </p>

        {store.promoProducts.length === 0 ? (
          <p className="py-16 text-center text-gray-500">Pas de promo {store.name} pour le moment. Revenez bientôt !</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {store.promoProducts.map((product) => {
              const discount =
                product.price != null && product.oldPrice != null && product.oldPrice > product.price
                  ? Math.round((1 - product.price / product.oldPrice) * 100)
                  : null;
              const order = getWhatsAppLink(
                whatsapp,
                `Bonjour Paulin, je veux commander cet article ${store.name} : ${product.title} ${product.affiliateUrl}`,
              );
              return (
                <li key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="relative aspect-square bg-gray-50">
                    <Image
                      src={`/api/promo-images/${product.id}?v=${product.updatedAt.getTime()}`}
                      alt={product.title}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover"
                    />
                    {discount != null && discount > 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white">
                        −{discount} %
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <h2 className="line-clamp-2 text-sm font-semibold text-gray-900">{product.title}</h2>
                    {product.price != null && (
                      <>
                        <p className="mt-2">
                          <span className="text-lg font-black text-gray-900">{euros.format(product.price)}</span>
                          {product.oldPrice != null && (
                            <span className="ml-2 text-sm text-gray-500 line-through">{euros.format(product.oldPrice)}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          soit ≈ {fcfa.format(product.price * DEVIS_FCFA_PER_EUR)} FCFA, hors transport
                        </p>
                      </>
                    )}
                    <div className="mt-auto flex flex-col gap-2 pt-3">
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#D99A12] px-3 py-2.5 text-sm font-bold text-black hover:bg-[#c48a0f]"
                      >
                        Voir l&apos;offre <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                      <a
                        href={order}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:border-[#D99A12]"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden /> Commander via moi
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <section className="mt-12 rounded-2xl bg-black p-6 text-center text-white sm:p-10">
          <h2 className="text-2xl font-black sm:text-3xl">Vous êtes à Abidjan ou Dakar ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-300">
            Envoyez-moi le lien de n&apos;importe quel article : j&apos;achète pour vous en Europe au taux de 1 € ={" "}
            {DEVIS_FCFA_PER_EUR} FCFA et je vous le fais livrer.
          </p>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D99A12] px-6 py-3 font-bold text-black hover:bg-[#c48a0f]"
          >
            <MessageCircle className="h-5 w-5" aria-hidden /> Commander sur WhatsApp
          </a>
        </section>
      </div>
    </div>
  );
}

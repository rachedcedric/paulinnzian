import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPromoStores } from "@/actions/public";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Promos Temu, Shein et bons plans",
  description: "Les articles en promo repérés par Paulin N'ZIAN sur Temu, Shein et vos boutiques préférées, livrés à Abidjan et Dakar.",
  alternates: { canonical: "/promos" },
};

export default async function PromosPage() {
  const stores = await getPromoStores();

  return (
    <div className="pt-20 min-h-screen bg-white">
      <header className="bg-black px-4 py-14 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-black sm:text-5xl">
            LES <span className="text-[#D99A12]">BONS PLANS</span> DU MOMENT
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Je repère les meilleures promos pour vous faire économiser. Choisissez une boutique.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {stores.length === 0 ? (
          <p className="py-16 text-center text-gray-500">
            Pas de promo pour le moment.{" "}
            <Link href="/boutiques" className="font-semibold text-[#B57F0B] hover:underline">Voir les boutiques</Link>
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {stores.map((store) => (
              <li key={store.id}>
                <Link
                  href={`/promos/${store.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-5 shadow-sm transition hover:border-[#D99A12] hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                      {store.logo ? (
                        <Image src={store.logo} alt="" width={56} height={56} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xl font-black text-[#B57F0B]">{store.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Promos {store.name}</h2>
                      <p className="text-sm text-gray-500">
                        {store._count.promoProducts} article{store._count.promoProducts > 1 ? "s" : ""} en promo
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-5 w-5 text-[#B57F0B] transition group-hover:translate-x-1" aria-hidden />
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {store.promoProducts.map((product) => (
                      <div key={product.id} className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                        <Image
                          src={`/api/promo-images/${product.id}?v=${product.updatedAt.getTime()}`}
                          alt={product.title}
                          fill
                          unoptimized
                          sizes="120px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

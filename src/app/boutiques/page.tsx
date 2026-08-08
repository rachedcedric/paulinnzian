import type { Metadata } from "next";
import { StoresClient } from "./StoresClient";
import { getStores } from "@/actions/public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boutiques en ligne",
  description: "Découvrez toutes les boutiques européennes sur lesquelles nous effectuons vos achats.",
};

export default async function BoutiquesPage() {
  const stores = await getStores();
  return <StoresClient initialStores={stores} />;
}

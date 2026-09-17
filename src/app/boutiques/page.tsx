import type { Metadata } from "next";
import { StoresClient } from "./StoresClient";
import { getStores } from "@/actions/public";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Boutiques en ligne",
  description: "Découvrez toutes les boutiques européennes sur lesquelles nous effectuons vos achats.",
};

export default async function BoutiquesPage() {
  const stores = await getStores();
  return <StoresClient initialStores={stores} />;
}

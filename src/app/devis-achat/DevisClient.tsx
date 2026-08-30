"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Calculator, MessageCircle, Pencil, Store as StoreIcon } from "lucide-react";
import { devisFormSchema, type DevisFormInput } from "@/lib/validations";
import { computeDevis, formatEur, formatFcfa, DEVIS_FCFA_PER_EUR } from "@/lib/devis";
import { getWhatsAppLink } from "@/lib/utils";
import { useSiteConfig } from "@/components/layout/SiteConfigContext";

const emptyLine = { store: "", cartAmount: "" as unknown as number, shippingFee: "" as unknown as number };

function parseLivePreview(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : 0;
  const n = parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function DevisClient() {
  const { whatsappUrl } = useSiteConfig();
  const [hasCalculated, setHasCalculated] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DevisFormInput>({
    resolver: zodResolver(devisFormSchema),
    defaultValues: { lines: [emptyLine] },
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const watchedLines = useWatch({ control, name: "lines" });

  const livePreview = computeDevis(
    (watchedLines ?? []).map((line) => ({
      store: line?.store,
      cartAmount: parseLivePreview(line?.cartAmount),
      shippingFee: parseLivePreview(line?.shippingFee),
    }))
  );

  function onSubmit() {
    setHasCalculated(true);
    requestAnimationFrame(() => {
      document.getElementById("devis-resultat")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleModify() {
    setHasCalculated(false);
    document.getElementById("devis-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const whatsappMessage = [
    "Bonjour, je souhaite commander mon panier (devis simulé sur paulinnzian.com) :",
    ...livePreview.lines.map(
      (line) => `- ${line.store} : ${formatEur(line.totalEur)} → ${formatFcfa(line.totalFcfa)}`
    ),
    `Total panier : ${formatEur(livePreview.totalEur)} (${formatFcfa(livePreview.totalFcfa)})`,
    `Taux appliqué : 1 € = ${DEVIS_FCFA_PER_EUR} FCFA`,
    "Merci de me confirmer la commande.",
  ].join("\n");

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              DEVIS <span className="text-[#D99A12]">D'ACHAT</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Connaissez instantanément le montant en FCFA de vos paniers, tous sites confondus.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Form card */}
        <motion.form
          id="devis-form"
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5F5F5] rounded-3xl p-5 sm:p-8 scroll-mt-24"
        >
          <h2 className="text-xl sm:text-2xl font-black text-black mb-6">
            Renseignez le montant total par site
          </h2>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const lineErrors = errors.lines?.[index];
              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-transparent focus-within:border-[#D99A12] transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr_1fr_1fr_auto] gap-3 md:items-end">
                    {/* Boutique */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        Boutique / Site
                      </label>
                      <input
                        {...register(`lines.${index}.store` as const)}
                        placeholder="SHEIN, Zara, Amazon..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D99A12] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Devise (verrouillée EUR) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        Devise
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-semibold text-sm">
                        EUR (€)
                      </div>
                    </div>

                    {/* Montant panier */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        Montant du panier
                      </label>
                      <input
                        {...register(`lines.${index}.cartAmount` as const)}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="120,50"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D99A12] focus:border-transparent transition-all"
                      />
                      {lineErrors?.cartAmount && (
                        <p className="text-red-500 text-xs mt-1">{lineErrors.cartAmount.message}</p>
                      )}
                    </div>

                    {/* Frais de livraison */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        Frais de livraison <span className="font-normal text-gray-400">(facultatif)</span>
                      </label>
                      <input
                        {...register(`lines.${index}.shippingFee` as const)}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="4,99"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D99A12] focus:border-transparent transition-all"
                      />
                      {lineErrors?.shippingFee && (
                        <p className="text-red-500 text-xs mt-1">{lineErrors.shippingFee.message}</p>
                      )}
                    </div>

                    {/* Supprimer */}
                    <div className="flex md:justify-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        aria-label="Supprimer ce site"
                        className="w-full md:w-11 h-11 flex items-center justify-center gap-2 rounded-xl text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="md:hidden text-sm font-semibold">Supprimer</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Ajouter un site */}
          <button
            type="button"
            onClick={() => append(emptyLine)}
            className="mt-5 w-full sm:w-auto flex items-center justify-center gap-2 bg-black hover:bg-[#D99A12] text-white font-bold px-6 py-4 rounded-full transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter un site
          </button>

          {/* Calculer */}
          <button
            type="submit"
            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#D99A12] hover:bg-[#C8912D] text-white font-black px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
          >
            <Calculator className="w-5 h-5" />
            Calculer mon devis
          </button>
        </motion.form>

        {/* Résultat */}
        <AnimatePresence>
          {hasCalculated && (
            <motion.div
              id="devis-resultat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-black rounded-3xl p-5 sm:p-8 text-white scroll-mt-24"
            >
              <h2 className="text-xl sm:text-2xl font-black mb-6">Votre devis d'achat</h2>

              {/* Détail par boutique */}
              <div className="space-y-2 mb-6">
                {livePreview.lines.map((line, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 bg-white/5 rounded-xl px-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-200 truncate">
                      <StoreIcon className="w-4 h-4 text-[#D99A12] shrink-0" />
                      {line.store}
                    </span>
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      {formatEur(line.totalEur)} <span className="text-[#D99A12]">→</span>{" "}
                      <span className="text-white font-bold">{formatFcfa(line.totalFcfa)}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Sous-totaux */}
              <div className="space-y-2 text-sm text-gray-300 border-t border-white/10 pt-5">
                <div className="flex justify-between">
                  <span>Montant total des articles</span>
                  <span className="font-semibold text-white">{formatEur(livePreview.totalArticlesEur)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison boutiques</span>
                  <span className="font-semibold text-white">{formatEur(livePreview.totalShippingEur)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total panier</span>
                  <span className="font-semibold text-white">{formatEur(livePreview.totalEur)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux appliqué</span>
                  <span className="font-semibold text-white">1 € = {DEVIS_FCFA_PER_EUR} FCFA</span>
                </div>
              </div>

              {/* Total à payer */}
              <div className="mt-6 bg-[#D99A12] rounded-2xl p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-white/80 mb-2">
                  Montant total à payer
                </p>
                <p className="text-3xl sm:text-4xl font-black text-white">
                  {formatFcfa(livePreview.totalFcfa)}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleModify}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white text-white font-bold px-6 py-4 rounded-full transition-all"
                >
                  <Pencil className="w-4 h-4" />
                  Modifier mon devis
                </button>
                <a
                  href={getWhatsAppLink(whatsappUrl, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20c058] text-white font-bold px-6 py-4 rounded-full transition-all hover:shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  Commander avec Paulin N'ZIAN
                </a>
              </div>

              {/* Mentions */}
              <div className="mt-6 pt-5 border-t border-white/10 text-xs text-gray-400 space-y-1">
                <p>Taux appliqué : 1 EUR = {DEVIS_FCFA_PER_EUR} FCFA</p>
                <p>
                  Cette simulation est fournie à titre indicatif. Le montant final peut évoluer
                  uniquement si le montant du panier est modifié avant la validation de la commande.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

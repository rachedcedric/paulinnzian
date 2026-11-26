"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { createPromoProduct, deletePromoProduct, updatePromoProduct } from "@/actions/admin";

export interface PromoRow {
  id: string;
  storeId: string;
  title: string;
  affiliateUrl: string;
  price: number | null;
  oldPrice: number | null;
  isActive: boolean;
  displayOrder: number;
  updatedAt: Date;
  store: { name: string };
}

interface Props {
  products: PromoRow[];
  stores: { id: string; name: string }[];
}

const MAX_IMAGE_SIDE = 900;
const input = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D99A12]";
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

// Product photos are shrunk in the browser so each one stays around 100 KB in the database.
async function resizeImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponible");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL("image/webp", 0.82);
  // Safari cannot encode WebP and silently returns PNG: fall back to JPEG.
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85);
}

function toPrice(value: string) {
  return value.trim() === "" ? null : Number(value.replace(",", "."));
}

export function PromosAdmin({ products, stores }: Props) {
  const router = useRouter();
  const [storeFilter, setStoreFilter] = useState("all");
  const [editing, setEditing] = useState<PromoRow | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    storeId: "", title: "", affiliateUrl: "", price: "", oldPrice: "", displayOrder: "0", isActive: true,
  });

  const visible = useMemo(
    () => (storeFilter === "all" ? products : products.filter((product) => product.storeId === storeFilter)),
    [products, storeFilter],
  );

  function openForm(product: PromoRow | null) {
    setEditing(product);
    setImage(null);
    setForm({
      storeId: product?.storeId ?? (storeFilter !== "all" ? storeFilter : stores[0]?.id ?? ""),
      title: product?.title ?? "",
      affiliateUrl: product?.affiliateUrl ?? "",
      price: product?.price != null ? String(product.price) : "",
      oldPrice: product?.oldPrice != null ? String(product.oldPrice) : "",
      displayOrder: String(product?.displayOrder ?? 0),
      isActive: product?.isActive ?? true,
    });
    setOpen(true);
  }

  async function handleImage(file: File | undefined) {
    if (!file) return;
    try {
      setImage(await resizeImage(file));
    } catch {
      toast.error("Image illisible");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing && !image) {
      toast.error("Ajoutez une image");
      return;
    }
    setSaving(true);
    const payload = {
      storeId: form.storeId,
      title: form.title,
      affiliateUrl: form.affiliateUrl,
      price: toPrice(form.price),
      oldPrice: toPrice(form.oldPrice),
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
      ...(image ? { image } : {}),
    };
    const result = editing ? await updatePromoProduct(editing.id, payload) : await createPromoProduct(payload);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error || "Erreur");
      return;
    }
    toast.success(editing ? "Article modifié" : "Article ajouté");
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(product: PromoRow) {
    if (!confirm(`Supprimer « ${product.title} » ?`)) return;
    const result = await deletePromoProduct(product.id);
    if (result.success) {
      toast.success("Article supprimé");
      router.refresh();
    } else {
      toast.error("error" in result ? result.error : "Erreur");
    }
  }

  const preview = image ?? (editing ? `/api/promo-images/${editing.id}?v=${new Date(editing.updatedAt).getTime()}` : null);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Promos</h1>
          <p className="text-sm text-gray-500">
            Articles affichés sur la page Promos de chaque boutique (liens d&apos;affiliation).
          </p>
        </div>
        <button
          type="button"
          onClick={() => openForm(null)}
          disabled={stores.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-[#D99A12] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus className="h-5 w-5" aria-hidden /> Ajouter un article
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par boutique">
        {[{ id: "all", name: "Toutes" }, ...stores].map((store) => (
          <button
            key={store.id}
            type="button"
            onClick={() => setStoreFilter(store.id)}
            aria-pressed={storeFilter === store.id}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              storeFilter === store.id ? "bg-[#D99A12] text-white" : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            {store.name}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-gray-500">
          Aucun article. Cliquez sur « Ajouter un article » pour créer votre première promo.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {visible.map((product) => (
            <li key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative aspect-square bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail from our own image route */}
                <img
                  src={`/api/promo-images/${product.id}?v=${new Date(product.updatedAt).getTime()}`}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
                {!product.isActive && (
                  <span className="absolute left-2 top-2 rounded-full bg-gray-900/80 px-2 py-0.5 text-xs font-semibold text-white">
                    Masqué
                  </span>
                )}
              </div>
              <div className="space-y-1 p-3">
                <p className="text-xs font-semibold uppercase text-[#B57F0B]">{product.store.name}</p>
                <p className="line-clamp-2 text-sm font-semibold text-gray-900">{product.title}</p>
                <p className="text-sm">
                  {product.price != null ? euros.format(product.price) : "Prix non indiqué"}
                  {product.oldPrice != null && (
                    <span className="ml-2 text-gray-500 line-through">{euros.format(product.oldPrice)}</span>
                  )}
                </p>
                <div className="flex items-center gap-1 pt-1">
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    aria-label={`Ouvrir le lien de ${product.title}`}
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                  <button
                    type="button"
                    onClick={() => openForm(product)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    aria-label={`Modifier ${product.title}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    className="ml-auto rounded-lg p-2 text-red-500 hover:bg-red-50"
                    aria-label={`Supprimer ${product.title}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="promo-form-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="promo-form-title" className="font-black">{editing ? "Modifier l'article" : "Ajouter un article"}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="promo-store" className="mb-1 block text-xs font-semibold">Boutique *</label>
                <select id="promo-store" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} className={input} required>
                  {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="promo-title" className="mb-1 block text-xs font-semibold">Nom de l&apos;article *</label>
                <input id="promo-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} required className={input} placeholder="Ex : Robe longue fleurie" />
              </div>
              <div>
                <label htmlFor="promo-image" className="mb-1 block text-xs font-semibold">Image {editing ? "(laisser vide pour garder l'actuelle)" : "*"}</label>
                <input id="promo-image" type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0])} className="block w-full text-sm" />
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element -- local preview of a data URI or our own route
                  <img src={preview} alt="Aperçu" className="mt-2 h-32 w-32 rounded-xl object-cover" />
                )}
              </div>
              <div>
                <label htmlFor="promo-link" className="mb-1 block text-xs font-semibold">Lien d&apos;affiliation *</label>
                <input id="promo-link" type="url" value={form.affiliateUrl} onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })} required className={input} placeholder="https://temu.to/…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="promo-price" className="mb-1 block text-xs font-semibold">Prix promo (€)</label>
                  <input id="promo-price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={input} />
                </div>
                <div>
                  <label htmlFor="promo-old-price" className="mb-1 block text-xs font-semibold">Ancien prix (€)</label>
                  <input id="promo-old-price" type="number" step="0.01" min="0" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className={input} />
                </div>
              </div>
              <div className="grid grid-cols-2 items-end gap-4">
                <div>
                  <label htmlFor="promo-order" className="mb-1 block text-xs font-semibold">Ordre d&apos;affichage</label>
                  <input id="promo-order" type="number" min="0" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} className={input} />
                </div>
                <label className="flex items-center gap-2 pb-2.5 text-sm font-semibold">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-[#D99A12]" />
                  Visible sur le site
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#D99A12] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {saving ? "..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

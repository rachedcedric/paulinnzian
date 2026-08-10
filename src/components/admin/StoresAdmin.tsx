"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Upload } from "lucide-react";
import { createStore, updateStore, deleteStore, toggleStoreActive } from "@/actions/admin";
import { storeSchema, type StoreFormData } from "@/lib/validations";
import type { Store } from "@/types";
import { STORE_CATEGORIES } from "@/types";
import Image from "next/image";

export function StoresAdmin({ initialStores }: { initialStores: Store[] }) {
  const [stores, setStores] = useState(initialStores);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    setValue,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<StoreFormData>({ resolver: zodResolver(storeSchema) as any });

  const logoValue = useWatch({ control, name: "logo" });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier que c'est une image
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Lire le fichier et créer une prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      setValue("logo", base64);
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(data: StoreFormData) {
    const result = editingStore
      ? await updateStore(editingStore.id, data)
      : await createStore(data);

    if (result.success) {
      toast.success(editingStore ? "Boutique modifiée" : "Boutique ajoutée");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Confirmer la suppression ?")) return;
    const result = await deleteStore(id);
    if (result.success) {
      toast.success("Boutique supprimée");
      setStores((prev) => prev.filter((s) => s.id !== id));
    } else {
      toast.error("Erreur");
    }
  }

  async function handleToggle(store: Store) {
    const result = await toggleStoreActive(store.id, !store.isActive);
    if (result.success) {
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, isActive: !s.isActive } : s))
      );
      toast.success(!store.isActive ? "Boutique activée" : "Boutique désactivée");
    }
  }

  function openEdit(store: Store) {
    setEditingStore(store);
    setLogoPreview(store.logo || "");
    reset({
      name: store.name,
      slug: store.slug,
      logo: store.logo || "",
      websiteUrl: store.websiteUrl,
      category: store.category,
      description: store.description || "",
      displayOrder: store.displayOrder,
      isActive: store.isActive,
    });
    setShowForm(true);
  }

  function openCreate() {
    setEditingStore(null);
    setLogoPreview("");
    reset({
      name: "",
      slug: "",
      logo: "",
      websiteUrl: "",
      category: "Mode",
      description: "",
      displayOrder: 0,
      isActive: true,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setLogoPreview("");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-black">Boutiques</h1>
          <p className="text-gray-500 text-sm">{stores.length} boutique(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#FF6500] hover:bg-[#e55a00] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-black">
                {editingStore ? "Modifier" : "Ajouter"} une boutique
              </h2>
              <button onClick={closeForm}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nom *</label>
                  <input
                    {...register("name")}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Slug *</label>
                  <input
                    {...register("slug")}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2">Logo</label>
                <div className="flex flex-col gap-3">
                  {logoPreview && (
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#FF6500] hover:bg-orange-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600">
                      Sélectionner une image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  {logoValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview("");
                        setValue("logo", "");
                      }}
                      className="text-sm text-red-500 hover:text-red-700 font-semibold"
                    >
                      Supprimer le logo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  URL officielle *
                </label>
                <input
                  {...register("websiteUrl")}
                  type="url"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
                />
                {errors.websiteUrl && (
                  <p className="text-red-500 text-xs mt-1">{errors.websiteUrl.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Catégorie *</label>
                  <select
                    {...register("category")}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
                  >
                    {STORE_CATEGORIES.filter((c) => c !== "Tous").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Ordre</label>
                  <input
                    {...register("displayOrder")}
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  {...register("description")}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  {...register("isActive")}
                  type="checkbox"
                  id="store-active"
                  className="w-4 h-4 accent-[#FF6500]"
                />
                <label htmlFor="store-active" className="text-sm font-semibold">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#FF6500] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stores Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500">
                  Logo
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">
                  Nom
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">
                  Catégorie
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">
                  Statut
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {store.logo ? (
                      <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={store.logo}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">
                        {store.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{store.name}</td>
                  <td className="px-4 py-3 text-gray-600">{store.category}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(store)}
                      className="text-gray-400 hover:text-[#FF6500]"
                    >
                      {store.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(store)}
                      className="text-blue-500 hover:text-blue-700 mr-3"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(store.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

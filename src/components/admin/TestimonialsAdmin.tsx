"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, X, Eye, EyeOff } from "lucide-react";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "@/actions/admin";
import { testimonialSchema, type TestimonialFormData } from "@/lib/validations";
import type { Testimonial } from "@/types";

export function TestimonialsAdmin({ initialData }: { initialData: Testimonial[] }) {
  const [items, setItems] = useState(initialData);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TestimonialFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(testimonialSchema) as any,
  });

  async function onSubmit(data: TestimonialFormData) {
    const result = editing
      ? await updateTestimonial(editing.id, data)
      : await createTestimonial(data);
    if (result.success) {
      toast.success(editing ? "Modifié" : "Ajouté");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    const result = await deleteTestimonial(id);
    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Supprimé");
    }
  }

  function openEdit(item: Testimonial) {
    setEditing(item);
    reset({ name: item.name, photo: item.photo || "", rating: item.rating, comment: item.comment, isPublished: item.isPublished, displayOrder: item.displayOrder });
    setShowForm(true);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-black">Témoignages</h1>
        <button onClick={() => { setEditing(null); reset({ name: "", rating: 5, comment: "", isPublished: true, displayOrder: 0 }); setShowForm(true); }} className="flex items-center gap-2 bg-[#FF6500] text-white px-5 py-2.5 rounded-xl font-semibold">
          <Plus className="w-5 h-5" />Ajouter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black">{editing ? "Modifier" : "Ajouter"} un témoignage</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><label className="block text-sm font-semibold mb-1">Nom *</label>
                <input {...register("name")} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold mb-1">Note (1-5) *</label>
                <input {...register("rating")} type="number" min={1} max={5} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold mb-1">Commentaire *</label>
                <textarea {...register("comment")} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none resize-none" /></div>
              <div><label className="block text-sm font-semibold mb-1">Ordre</label>
                <input {...register("displayOrder")} type="number" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none" /></div>
              <div className="flex items-center gap-2">
                <input {...register("isPublished")} type="checkbox" id="pub" className="w-4 h-4 accent-[#FF6500]" />
                <label htmlFor="pub" className="text-sm font-semibold">Publié</label>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#FF6500] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {isSubmitting ? "..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-1">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#FF6500] fill-current" />
                ))}
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.isPublished ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                {item.isPublished ? "Publié" : "Masqué"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 italic">"{item.comment}"</p>
            <p className="font-bold text-black text-sm">{item.name}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-500" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

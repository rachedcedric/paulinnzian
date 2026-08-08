"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { submitContactForm } from "@/actions/public";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useState } from "react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setIsSubmitting(true);
    const result = await submitContactForm(data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Message envoyé ! Je vous réponds très vite.");
      reset();
    } else {
      toast.error(result.error || "Erreur lors de l'envoi");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h3 className="text-xl font-bold text-black mb-6">Envoyer un message</h3>

      <div>
        <label htmlFor="contact-name" className="block text-sm font-semibold text-black mb-2">
          Nom *
        </label>
        <input
          id="contact-name"
          {...register("name")}
          placeholder="Votre nom complet"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6500] focus:border-transparent transition-all"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-phone" className="block text-sm font-semibold text-black mb-2">
          Téléphone *
        </label>
        <input
          id="contact-phone"
          {...register("phone")}
          type="tel"
          placeholder="+225 07 XX XX XX XX"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6500] focus:border-transparent transition-all"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-semibold text-black mb-2">
          Email <span className="text-gray-400 font-normal">(facultatif)</span>
        </label>
        <input
          id="contact-email"
          {...register("email")}
          type="email"
          placeholder="votre@email.com"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6500] focus:border-transparent transition-all"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-semibold text-black mb-2">
          Sujet *
        </label>
        <input
          id="contact-subject"
          {...register("subject")}
          placeholder="L'objet de votre message"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6500] focus:border-transparent transition-all"
        />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-semibold text-black mb-2">
          Message *
        </label>
        <textarea
          id="contact-message"
          {...register("message")}
          rows={5}
          placeholder="Décrivez votre demande..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6500] focus:border-transparent transition-all resize-none"
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#FF6500] hover:bg-[#e55a00] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all"
      >
        <Send className="w-5 h-5" />
        {isSubmitting ? "Envoi en cours..." : "Envoyer"}
      </button>
    </form>
  );
}

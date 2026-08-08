import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  subject: z.string().min(2, "Le sujet est requis"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

export const storeSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  logo: z.string().optional(),
  websiteUrl: z.string().url("URL invalide"),
  category: z.string().min(1, "La catégorie est requise"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const orderSchema = z.object({
  trackingNumber: z.string().min(1, "Le numéro de suivi est requis"),
  customerName: z.string().min(2, "Le nom est requis"),
  customerPhone: z.string().min(8, "Numéro de téléphone invalide"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  storeName: z.string().optional(),
  storeOrderNumber: z.string().optional(),
  amount: z.coerce.number().positive().optional(),
  packageCount: z.coerce.number().int().positive().optional(),
  weight: z.coerce.number().positive().optional(),
  destinationCity: z.string().min(1, "La ville est requise"),
  destinationCountry: z.string().min(1, "Le pays est requis"),
  internalNotes: z.string().optional(),
  status: z.enum(["PENDING", "PURCHASED", "RECEIVED_PARIS", "SHIPPED_DESTINATION", "ARRIVED_DESTINATION", "DELIVERED", "CANCELLED"]),
  orderDate: z.string().optional(),
});

export const trackingEventSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "PURCHASED", "RECEIVED_PARIS", "SHIPPED_DESTINATION", "ARRIVED_DESTINATION", "DELIVERED", "CANCELLED"]),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  location: z.string().optional(),
  eventDate: z.string().min(1, "La date est requise"),
  displayOrder: z.coerce.number().int().default(0),
});

export const testimonialSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  photo: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  comment: z.string().min(10, "Le commentaire est requis"),
  isPublished: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
});

export const faqSchema = z.object({
  question: z.string().min(5, "La question est requise"),
  answer: z.string().min(10, "La réponse est requise"),
  isPublished: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type StoreFormData = z.infer<typeof storeSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type TrackingEventFormData = z.infer<typeof trackingEventSchema>;
export type TestimonialFormData = z.infer<typeof testimonialSchema>;
export type FAQFormData = z.infer<typeof faqSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

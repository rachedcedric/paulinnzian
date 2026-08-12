import { z } from "zod";

export const entityIdSchema = z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);
export const trackingLookupSchema = z.string().trim().min(3).max(100).regex(/^[\p{L}\p{N}._-]+$/u).transform((value) => value.toUpperCase());

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  phone: z.string().trim().min(8, "Numéro de téléphone invalide").max(30),
  email: z.string().trim().email("Email invalide").max(254).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Le sujet est requis").max(150),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères").max(5_000),
});

export const storeSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  logo: z.string().max(7_000_000).optional(),
  websiteUrl: z.string().trim().url("URL invalide").max(2_048),
  category: z.string().trim().min(1, "La catégorie est requise").max(80),
  description: z.string().trim().max(1_000).optional(),
  displayOrder: z.coerce.number().int().min(0).max(10_000).default(0),
  isActive: z.boolean().default(true),
});

export const orderSchema = z.object({
  trackingNumber: z.string().trim().min(3, "Le numéro de suivi est requis").max(100).transform((value) => value.toUpperCase()),
  customerName: z.string().trim().min(2, "Le nom est requis").max(100),
  customerPhone: z.string().trim().min(8, "Numéro de téléphone invalide").max(30),
  customerEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
  storeName: z.string().trim().max(100).optional(),
  storeOrderNumber: z.string().trim().max(100).optional(),
  amount: z.coerce.number().finite().positive().max(1_000_000_000).optional(),
  packageCount: z.coerce.number().int().positive().max(10_000).optional(),
  weight: z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z.coerce.number().finite().positive().max(100_000).optional(),
  ),
  destinationCity: z.string().trim().min(1, "La ville est requise").max(100),
  destinationCountry: z.string().trim().min(1, "Le pays est requis").max(100),
  internalNotes: z.string().trim().max(5_000).optional(),
  status: z.enum(["PENDING", "PURCHASED", "RECEIVED_PARIS", "SHIPPED_DESTINATION", "ARRIVED_DESTINATION", "DELIVERED", "CANCELLED"]),
  orderDate: z.iso.date().optional().or(z.literal("")),
});

export const trackingEventSchema = z.object({
  orderId: entityIdSchema,
  status: z.enum(["PENDING", "PURCHASED", "RECEIVED_PARIS", "SHIPPED_DESTINATION", "ARRIVED_DESTINATION", "DELIVERED", "CANCELLED"]),
  title: z.string().trim().min(1, "Le titre est requis").max(150),
  description: z.string().trim().max(1_000).optional(),
  location: z.string().trim().max(150).optional(),
  eventDate: z.preprocess(
    (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T12:00:00`
      : value,
    z.iso.datetime({ local: true }),
  ),
  displayOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis").max(100),
  photo: z.string().trim().url("URL invalide").max(2_048).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  comment: z.string().trim().min(10, "Le commentaire est requis").max(2_000),
  isPublished: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const faqSchema = z.object({
  question: z.string().trim().min(5, "La question est requise").max(300),
  answer: z.string().trim().min(10, "La réponse est requise").max(5_000),
  isPublished: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const exchangeRateUpdateSchema = z.object({
  id: entityIdSchema,
  rate: z.number().finite().positive().max(1_000_000),
  description: z.string().trim().max(1_000).optional(),
});

export const shippingRateUpdateSchema = z.object({
  id: entityIdSchema,
  price: z.number().finite().nonnegative().max(1_000_000_000).optional(),
  percentage: z.number().finite().min(0).max(100).optional(),
  estimatedDelivery: z.string().trim().max(100).optional(),
  description: z.string().trim().max(1_000).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type StoreFormData = z.infer<typeof storeSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type TrackingEventFormData = z.infer<typeof trackingEventSchema>;
export type TestimonialFormData = z.infer<typeof testimonialSchema>;
export type FAQFormData = z.infer<typeof faqSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

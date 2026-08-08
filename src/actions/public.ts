"use server";

import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function submitContactForm(formData: unknown) {
  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de l'envoi" };
  }
}

export async function getStores(category?: string, search?: string) {
  try {
    return await prisma.store.findMany({
      where: {
        isActive: true,
        ...(category && category !== "Tous" ? { category } : {}),
        ...(search
          ? { name: { contains: search, mode: "insensitive" } }
          : {}),
      },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getExchangeRates() {
  try {
    return await prisma.exchangeRate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getShippingRates() {
  try {
    return await prisma.shippingRate.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getTestimonials() {
  try {
    return await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getFAQs() {
  try {
    return await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSetting.findMany();
    return Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));
  } catch {
    return {};
  }
}

// Rate-limited tracking lookup
const trackingAttempts = new Map<string, { count: number; resetAt: number }>();

export async function trackOrder(trackingNumber: string) {
  if (!trackingNumber || trackingNumber.length < 3) {
    return { success: false, error: "Numéro de suivi invalide" };
  }

  // Simple in-memory rate limiting (5 attempts per 10 minutes per tracking number)
  const key = trackingNumber.trim().toUpperCase();
  const now = Date.now();
  const attempt = trackingAttempts.get(key);

  if (attempt) {
    if (now < attempt.resetAt) {
      if (attempt.count >= 5) {
        return { success: false, error: "Trop de tentatives. Réessayez dans quelques minutes." };
      }
      attempt.count++;
    } else {
      trackingAttempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }
  } else {
    trackingAttempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
  }

  const order = await prisma.order.findUnique({
    where: { trackingNumber: key },
    select: {
      trackingNumber: true,
      customerName: true,
      destinationCity: true,
      destinationCountry: true,
      status: true,
      orderDate: true,
      updatedAt: true,
      trackingEvents: {
        select: {
          id: true,
          status: true,
          title: true,
          description: true,
          location: true,
          eventDate: true,
          displayOrder: true,
        },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!order) {
    return { success: false, error: "Aucune commande trouvée avec ce numéro" };
  }

  return { success: true, order };
}

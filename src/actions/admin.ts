"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  storeSchema,
  orderSchema,
  trackingEventSchema,
  testimonialSchema,
  faqSchema,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  return session;
}

// ─── STORES ───────────────────────────────────────────────────────────────────
export async function createStore(data: unknown) {
  await requireAuth();
  const parsed = storeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  try {
    const store = await prisma.store.create({ data: parsed.data });
    revalidatePath("/boutiques");
    revalidatePath("/admin/boutiques");
    return { success: true, store };
  } catch {
    return { success: false, error: "Ce slug existe déjà" };
  }
}

export async function updateStore(id: string, data: unknown) {
  await requireAuth();
  const parsed = storeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  try {
    const store = await prisma.store.update({ where: { id }, data: parsed.data });
    revalidatePath("/boutiques");
    revalidatePath("/admin/boutiques");
    return { success: true, store };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteStore(id: string) {
  await requireAuth();
  await prisma.store.delete({ where: { id } });
  revalidatePath("/boutiques");
  revalidatePath("/admin/boutiques");
  return { success: true };
}

export async function toggleStoreActive(id: string, isActive: boolean) {
  await requireAuth();
  await prisma.store.update({ where: { id }, data: { isActive } });
  revalidatePath("/boutiques");
  revalidatePath("/admin/boutiques");
  return { success: true };
}

// ─── EXCHANGE RATES ───────────────────────────────────────────────────────────
export async function updateExchangeRate(id: string, rate: number, description?: string) {
  await requireAuth();
  await prisma.exchangeRate.update({
    where: { id },
    data: { rate, ...(description ? { description } : {}), updatedAt: new Date() },
  });
  revalidatePath("/tarifs");
  revalidatePath("/admin/tarifs");
  return { success: true };
}

// ─── SHIPPING RATES ───────────────────────────────────────────────────────────
export async function updateShippingRate(
  id: string,
  data: { price?: number; percentage?: number; estimatedDelivery?: string; description?: string }
) {
  await requireAuth();
  await prisma.shippingRate.update({ where: { id }, data });
  revalidatePath("/tarifs");
  revalidatePath("/admin/tarifs");
  return { success: true };
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export async function createOrder(data: unknown) {
  await requireAuth();
  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides", details: parsed.error.flatten() };

  const existing = await prisma.order.findUnique({
    where: { trackingNumber: parsed.data.trackingNumber },
  });
  if (existing) return { success: false, error: "Ce numéro de suivi existe déjà" };

  try {
    const { orderDate, ...rest } = parsed.data;
    const order = await prisma.order.create({
      data: {
        ...rest,
        customerEmail: rest.customerEmail || null,
        storeName: rest.storeName || null,
        storeOrderNumber: rest.storeOrderNumber || null,
        internalNotes: rest.internalNotes || null,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
      },
    });
    revalidatePath("/admin/commandes");
    return { success: true, order };
  } catch {
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateOrder(id: string, data: unknown) {
  await requireAuth();
  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  try {
    const { orderDate, ...rest } = parsed.data;
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...rest,
        customerEmail: rest.customerEmail || null,
        storeName: rest.storeName || null,
        storeOrderNumber: rest.storeOrderNumber || null,
        internalNotes: rest.internalNotes || null,
        ...(orderDate ? { orderDate: new Date(orderDate) } : {}),
      },
    });
    revalidatePath("/admin/commandes");
    return { success: true, order };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteOrder(id: string) {
  await requireAuth();
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/commandes");
  return { success: true };
}

export async function addTrackingEvent(data: unknown) {
  await requireAuth();
  const parsed = trackingEventSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  try {
    const event = await prisma.trackingEvent.create({
      data: {
        ...parsed.data,
        eventDate: new Date(parsed.data.eventDate),
      },
    });
    // update order status
    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: { status: parsed.data.status },
    });
    revalidatePath("/suivi");
    revalidatePath("/admin/commandes");
    return { success: true, event };
  } catch {
    return { success: false, error: "Erreur lors de l'ajout" };
  }
}

export async function deleteTrackingEvent(id: string) {
  await requireAuth();
  await prisma.trackingEvent.delete({ where: { id } });
  revalidatePath("/admin/commandes");
  return { success: true };
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
export async function createTestimonial(data: unknown) {
  await requireAuth();
  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const testimonial = await prisma.testimonial.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/temoignages");
  return { success: true, testimonial };
}

export async function updateTestimonial(id: string, data: unknown) {
  await requireAuth();
  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const testimonial = await prisma.testimonial.update({ where: { id }, data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/temoignages");
  return { success: true, testimonial };
}

export async function deleteTestimonial(id: string) {
  await requireAuth();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/temoignages");
  return { success: true };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export async function createFAQ(data: unknown) {
  await requireAuth();
  const parsed = faqSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const faq = await prisma.fAQ.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/faq");
  return { success: true, faq };
}

export async function updateFAQ(id: string, data: unknown) {
  await requireAuth();
  const parsed = faqSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const faq = await prisma.fAQ.update({ where: { id }, data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/faq");
  return { success: true, faq };
}

export async function deleteFAQ(id: string) {
  await requireAuth();
  await prisma.fAQ.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/faq");
  return { success: true };
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export async function markMessageRead(id: string) {
  await requireAuth();
  await prisma.contactMessage.update({ where: { id }, data: { status: "READ" } });
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function deleteMessage(id: string) {
  await requireAuth();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  return { success: true };
}

// ─── SITE SETTINGS ────────────────────────────────────────────────────────────
export async function updateSiteSettings(data: Record<string, string>) {
  await requireAuth();

  for (const [key, value] of Object.entries(data)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin/parametres");
  return { success: true };
}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
export async function createAdminUser(data: { email: string; password: string; name: string; role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" }) {
  await requireAuth();
  const hashedPassword = await bcrypt.hash(data.password, 12);

  try {
    const user = await prisma.adminUser.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, email: true, name: true, role: true },
    });
    return { success: true, user };
  } catch {
    return { success: false, error: "Cet email est déjà utilisé" };
  }
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  await requireAuth();

  const now = new Date();
  const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 6);  startOfWeek.setHours(0,0,0,0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const revenueWhere = (from: Date) => ({
    status: { notIn: ["CANCELLED" as const] },
    createdAt: { gte: from },
    amount: { not: null },
  });

  const weightWhere = (from?: Date) => ({
    weight: { not: null },
    status: { notIn: ["CANCELLED" as const] },
    ...(from ? { createdAt: { gte: from } } : {}),
  });

  // ceil(weight) × 9800 — toute fraction de kg compte comme 1 kg
  const sumWeight = (rows: { weight: number | null }[]) =>
    rows.reduce((s, o) => s + (o.weight ? Math.ceil(o.weight) * 9800 : 0), 0);

  const sumAmount = (r: { _sum: { amount: number | null } }) => r._sum.amount ?? 0;

  const [
    totalOrders, activeOrders, deliveredOrders, activeStores, unreadMessages, publishedTestimonials,
    totalRevenue,
    revenueDay, revenueWeek, revenueMonth, revenueYear,
    wAll, wDay, wWeek, wMonth, wYear,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.store.count({ where: { isActive: true } }),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.testimonial.count({ where: { isPublished: true } }),
    prisma.order.aggregate({ _sum: { amount: true }, where: { status: { notIn: ["CANCELLED"] }, amount: { not: null } } }).then(sumAmount),
    prisma.order.aggregate({ _sum: { amount: true }, where: revenueWhere(startOfDay) }).then(sumAmount),
    prisma.order.aggregate({ _sum: { amount: true }, where: revenueWhere(startOfWeek) }).then(sumAmount),
    prisma.order.aggregate({ _sum: { amount: true }, where: revenueWhere(startOfMonth) }).then(sumAmount),
    prisma.order.aggregate({ _sum: { amount: true }, where: revenueWhere(startOfYear) }).then(sumAmount),
    prisma.order.findMany({ where: weightWhere(),               select: { weight: true } }).then(sumWeight),
    prisma.order.findMany({ where: weightWhere(startOfDay),     select: { weight: true } }).then(sumWeight),
    prisma.order.findMany({ where: weightWhere(startOfWeek),    select: { weight: true } }).then(sumWeight),
    prisma.order.findMany({ where: weightWhere(startOfMonth),   select: { weight: true } }).then(sumWeight),
    prisma.order.findMany({ where: weightWhere(startOfYear),    select: { weight: true } }).then(sumWeight),
  ]);

  const weightRevenue      = { total: wAll, day: wDay, week: wWeek, month: wMonth, year: wYear };

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      trackingNumber: true,
      customerName: true,
      destinationCity: true,
      status: true,
      createdAt: true,
    },
  });

  const recentMessages = await prisma.contactMessage.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, subject: true, status: true, createdAt: true },
  });

  return {
    totalOrders,
    activeOrders,
    deliveredOrders,
    activeStores,
    unreadMessages,
    publishedTestimonials,
    totalRevenue,
    revenueDay,
    revenueWeek,
    revenueMonth,
    revenueYear,
    weightRevenue,
    recentOrders,
    recentMessages,
  };
}

// ─── ADMIN GETTERS ────────────────────────────────────────────────────────────
export async function adminGetOrders(filters?: {
  search?: string;
  status?: string;
  destination?: string;
}) {
  await requireAuth();
  return prisma.order.findMany({
    where: {
      ...(filters?.search
        ? {
            OR: [
              { trackingNumber: { contains: filters.search, mode: "insensitive" } },
              { customerName: { contains: filters.search, mode: "insensitive" } },
              { customerPhone: { contains: filters.search, mode: "insensitive" } },
              { storeOrderNumber: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters?.status ? { status: filters.status as z.infer<typeof orderSchema>["status"] } : {}),
      ...(filters?.destination ? { destinationCity: { contains: filters.destination, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { trackingEvents: { orderBy: { displayOrder: "asc" } } },
  });
}

export async function adminGetOrder(id: string) {
  await requireAuth();
  return prisma.order.findUnique({
    where: { id },
    include: { trackingEvents: { orderBy: { displayOrder: "asc" } } },
  });
}

export async function adminGetStores() {
  await requireAuth();
  return prisma.store.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function adminGetExchangeRates() {
  await requireAuth();
  return prisma.exchangeRate.findMany({ orderBy: { createdAt: "asc" } });
}

export async function adminGetShippingRates() {
  await requireAuth();
  return prisma.shippingRate.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function adminGetTestimonials() {
  await requireAuth();
  return prisma.testimonial.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function adminGetFAQs() {
  await requireAuth();
  return prisma.fAQ.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function adminGetMessages() {
  await requireAuth();
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function adminGetSettings() {
  await requireAuth();
  const settings = await prisma.siteSetting.findMany();
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

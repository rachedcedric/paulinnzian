"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  storeSchema,
  orderSchema,
  trackingEventSchema,
  testimonialSchema,
  faqSchema,
  entityIdSchema,
  exchangeRateUpdateSchema,
  shippingRateUpdateSchema,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  hasAdminRole,
  MANAGER_ROLES,
  SUPER_ADMIN_ROLES,
  VIEWER_ROLES,
  type AdminRole,
} from "@/lib/admin-permissions";

async function requireRole(allowedRoles: readonly AdminRole[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  const user = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || !hasAdminRole(user.role, allowedRoles)) throw new Error("Accès interdit");
  return session;
}

const requireViewer = () => requireRole(VIEWER_ROLES);
const requireManager = () => requireRole(MANAGER_ROLES);
const requireSuperAdmin = () => requireRole(SUPER_ADMIN_ROLES);

const SITE_SETTING_KEYS = new Set([
  "site_name", "site_slogan", "whatsapp_number", "whatsapp_link", "phone_ci",
  "address_paris", "address_abidjan", "facebook_url", "instagram_url", "hero_title",
  "hero_subtitle", "meta_description", "facebook_pixel_id", "google_ads_id",
  "google_analytics_id", "tiktok_pixel_id",
]);
const SETTING_URL_HOSTS: Record<string, readonly string[]> = {
  whatsapp_link: ["wa.me", "api.whatsapp.com"],
  facebook_url: ["facebook.com", "www.facebook.com"],
  instagram_url: ["instagram.com", "www.instagram.com"],
};

function validateSiteSettings(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const entries = Object.entries(data);
  if (entries.length > SITE_SETTING_KEYS.size) return null;

  const settings: Record<string, string> = {};
  for (const [key, rawValue] of entries) {
    if (!SITE_SETTING_KEYS.has(key) || typeof rawValue !== "string" || rawValue.length > 1_000) return null;
    const value = rawValue.trim();
    const allowedHosts = SETTING_URL_HOSTS[key];
    if (value && allowedHosts) {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" || !allowedHosts.includes(url.hostname)) return null;
      } catch {
        return null;
      }
    }
    settings[key] = value;
  }
  return settings;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidEntityId(id: string) {
  return entityIdSchema.safeParse(id).success;
}

const invalidIdResult = { success: false as const, error: "Identifiant invalide" };

// ─── STORES ───────────────────────────────────────────────────────────────────
export async function createStore(data: unknown) {
  await requireManager();
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
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
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
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  await prisma.store.delete({ where: { id } });
  revalidatePath("/boutiques");
  revalidatePath("/admin/boutiques");
  return { success: true };
}

export async function toggleStoreActive(id: string, isActive: boolean) {
  await requireManager();
  if (!isValidEntityId(id) || typeof isActive !== "boolean") return { success: false, error: "Données invalides" };
  await prisma.store.update({ where: { id }, data: { isActive } });
  revalidatePath("/boutiques");
  revalidatePath("/admin/boutiques");
  return { success: true };
}

// ─── EXCHANGE RATES ───────────────────────────────────────────────────────────
export async function updateExchangeRate(id: string, rate: number, description?: string) {
  await requireSuperAdmin();
  const parsed = exchangeRateUpdateSchema.safeParse({ id, rate, description });
  if (!parsed.success) return { success: false, error: "Données invalides" };
  await prisma.exchangeRate.update({
    where: { id: parsed.data.id },
    data: { rate: parsed.data.rate, ...(parsed.data.description ? { description: parsed.data.description } : {}), updatedAt: new Date() },
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
  await requireSuperAdmin();
  const parsed = shippingRateUpdateSchema.safeParse({ id, ...data });
  if (!parsed.success) return { success: false, error: "Données invalides" };
  const { id: parsedId, ...validatedData } = parsed.data;
  await prisma.shippingRate.update({ where: { id: parsedId }, data: validatedData });
  revalidatePath("/tarifs");
  revalidatePath("/admin/tarifs");
  return { success: true };
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export async function createOrder(data: unknown) {
  await requireManager();
  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides", details: parsed.error.flatten() };

  const existing = await prisma.order.findUnique({
    where: { trackingNumber: parsed.data.trackingNumber },
  });
  if (existing) return { success: false, error: "Ce numéro de suivi existe déjà" };

  try {
    const { orderDate, ...rest } = parsed.data;
    const order = await prisma.$transaction(async (transaction) => {
      await transaction.client.upsert({
        where: { phone: normalizePhone(rest.customerPhone) },
        update: {
          name: rest.customerName,
          ...(rest.customerEmail ? { email: rest.customerEmail } : {}),
        },
        create: {
          name: rest.customerName,
          phone: normalizePhone(rest.customerPhone),
          email: rest.customerEmail || null,
        },
      });

      return transaction.order.create({
        data: {
          ...rest,
          customerEmail: rest.customerEmail || null,
          storeName: rest.storeName || null,
          storeOrderNumber: rest.storeOrderNumber || null,
          internalNotes: rest.internalNotes || null,
          orderDate: orderDate ? new Date(orderDate) : new Date(),
        },
      });
    });
    revalidatePath("/admin/commandes");
    revalidatePath("/admin/clients");
    return { success: true, order };
  } catch {
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateOrder(id: string, data: unknown) {
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  try {
    const { orderDate, ...rest } = parsed.data;
    const order = await prisma.$transaction(async (transaction) => {
      await transaction.client.upsert({
        where: { phone: normalizePhone(rest.customerPhone) },
        update: {
          name: rest.customerName,
          ...(rest.customerEmail ? { email: rest.customerEmail } : {}),
        },
        create: {
          name: rest.customerName,
          phone: normalizePhone(rest.customerPhone),
          email: rest.customerEmail || null,
        },
      });

      return transaction.order.update({
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
    });
    revalidatePath("/admin/commandes");
    revalidatePath("/admin/clients");
    return { success: true, order };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteOrder(id: string) {
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/commandes");
  return { success: true };
}

export async function addTrackingEvent(data: unknown) {
  await requireManager();
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
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  await prisma.$transaction(async (transaction) => {
    const event = await transaction.trackingEvent.delete({
      where: { id },
      select: { orderId: true },
    });
    const latestEvent = await transaction.trackingEvent.findFirst({
      where: { orderId: event.orderId },
      orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
      select: { status: true },
    });
    await transaction.order.update({
      where: { id: event.orderId },
      data: { status: latestEvent?.status ?? "PENDING" },
    });
  });
  revalidatePath("/suivi");
  revalidatePath("/admin/commandes");
  return { success: true };
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
export async function createTestimonial(data: unknown) {
  await requireViewer();
  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const testimonial = await prisma.testimonial.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/temoignages");
  return { success: true, testimonial };
}

export async function updateTestimonial(id: string, data: unknown) {
  await requireViewer();
  if (!isValidEntityId(id)) return invalidIdResult;
  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const testimonial = await prisma.testimonial.update({ where: { id }, data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/temoignages");
  return { success: true, testimonial };
}

export async function deleteTestimonial(id: string) {
  await requireViewer();
  if (!isValidEntityId(id)) return invalidIdResult;
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/temoignages");
  return { success: true };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export async function createFAQ(data: unknown) {
  await requireViewer();
  const parsed = faqSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const faq = await prisma.fAQ.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/faq");
  return { success: true, faq };
}

export async function updateFAQ(id: string, data: unknown) {
  await requireViewer();
  if (!isValidEntityId(id)) return invalidIdResult;
  const parsed = faqSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const faq = await prisma.fAQ.update({ where: { id }, data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin/faq");
  return { success: true, faq };
}

export async function deleteFAQ(id: string) {
  await requireViewer();
  if (!isValidEntityId(id)) return invalidIdResult;
  await prisma.fAQ.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/faq");
  return { success: true };
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export async function markMessageRead(id: string) {
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  await prisma.contactMessage.update({ where: { id }, data: { status: "READ" } });
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function deleteMessage(id: string) {
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  return { success: true };
}

// ─── SITE SETTINGS ────────────────────────────────────────────────────────────
export async function updateSiteSettings(data: Record<string, string>) {
  await requireSuperAdmin();
  const settings = validateSiteSettings(data);
  if (!settings) return { success: false, error: "Paramètres invalides" };

  for (const [key, value] of Object.entries(settings)) {
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
const adminUserInputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
  name: z.string().trim().min(2).max(100),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]),
});

export async function createAdminUser(data: { email: string; password: string; name: string; role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" }) {
  await requireSuperAdmin();
  const parsed = adminUserInputSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };
  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  try {
    const user = await prisma.adminUser.create({
      data: { ...parsed.data, password: hashedPassword },
      select: { id: true, email: true, name: true, role: true },
    });
    revalidatePath("/admin/utilisateurs");
    return { success: true, user };
  } catch {
    return { success: false, error: "Cet email est déjà utilisé" };
  }
}

export async function adminGetUsers() {
  await requireSuperAdmin();
  return prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export async function updateAdminUser(
  id: string,
  data: { name: string; role: AdminRole; password?: string },
) {
  const session = await requireSuperAdmin();
  if (!isValidEntityId(id)) return invalidIdResult;
  const parsed = z.object({
    name: z.string().trim().min(2).max(100),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]),
    password: z.string().min(12).max(128).optional().or(z.literal("")),
  }).safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const target = await prisma.adminUser.findUnique({ where: { id }, select: { role: true } });
  if (!target) return { success: false, error: "Compte introuvable" };
  if (session.user?.id === id && parsed.data.role !== "SUPER_ADMIN") {
    return { success: false, error: "Vous ne pouvez pas retirer votre propre rôle SUPER_ADMIN" };
  }
  if (target.role === "SUPER_ADMIN" && parsed.data.role !== "SUPER_ADMIN") {
    const superAdminCount = await prisma.adminUser.count({ where: { role: "SUPER_ADMIN" } });
    if (superAdminCount <= 1) return { success: false, error: "Un SUPER_ADMIN doit être conservé" };
  }

  const user = await prisma.adminUser.update({
    where: { id },
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      ...(parsed.data.password ? { password: await bcrypt.hash(parsed.data.password, 12) } : {}),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  revalidatePath("/admin/utilisateurs");
  return { success: true, user };
}

export async function deleteAdminUser(id: string) {
  const session = await requireSuperAdmin();
  if (!isValidEntityId(id)) return invalidIdResult;
  if (session.user?.id === id) return { success: false, error: "Vous ne pouvez pas supprimer votre propre compte" };

  const target = await prisma.adminUser.findUnique({ where: { id }, select: { role: true } });
  if (!target) return { success: false, error: "Compte introuvable" };
  if (target.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.adminUser.count({ where: { role: "SUPER_ADMIN" } });
    if (superAdminCount <= 1) return { success: false, error: "Un SUPER_ADMIN doit être conservé" };
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/utilisateurs");
  return { success: true };
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  await requireViewer();

  const now = new Date();
  const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 6);  startOfWeek.setHours(0,0,0,0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const revenueWhere = (from: Date) => ({
    status: { notIn: ["CANCELLED" as const] },
    orderDate: { gte: from },
    amount: { not: null },
  });

  const weightWhere = (from?: Date) => ({
    weight: { not: null },
    status: { notIn: ["CANCELLED" as const] },
    ...(from ? { orderDate: { gte: from } } : {}),
  });

  const standardShippingRate = await prisma.shippingRate.findFirst({
    where: { pricingType: "PER_KG", isActive: true, price: { not: null } },
    orderBy: { displayOrder: "asc" },
    select: { price: true },
  });
  const weightRate = standardShippingRate?.price ?? 0;

  const sumWeight = (rows: { weight: number | null }[]) =>
    rows.reduce((sum, order) => sum + (order.weight ? Math.ceil(order.weight) * weightRate : 0), 0);

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

  const weightRevenue = { total: wAll, day: wDay, week: wWeek, month: wMonth, year: wYear, rate: weightRate };

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
  await requireViewer();
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

export async function adminGetClients() {
  await requireViewer();

  const [clients, orderCounts] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.order.groupBy({
      by: ["customerPhone"],
      _count: { _all: true },
    }),
  ]);

  const counts = new Map<string, number>();
  for (const item of orderCounts) {
    const phone = normalizePhone(item.customerPhone);
    counts.set(phone, (counts.get(phone) ?? 0) + item._count._all);
  }

  return clients.map((client) => ({
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    orderCount: counts.get(client.phone) ?? 0,
  }));
}

const clientSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
});

export async function updateClient(id: string, data: unknown) {
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };

  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: normalizePhone(parsed.data.phone),
        email: parsed.data.email || null,
      },
    });
    revalidatePath("/admin/clients");
    return {
      success: true,
      client: {
        ...client,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Ce numéro est déjà utilisé par un autre client" };
    }
    return { success: false, error: "Erreur lors de la modification" };
  }
}

export async function deleteClient(id: string) {
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  try {
    await prisma.client.delete({ where: { id } });
    revalidatePath("/admin/clients");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export async function adminGetStores() {
  await requireViewer();
  return prisma.store.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function adminGetExchangeRates() {
  await requireViewer();
  return prisma.exchangeRate.findMany({ orderBy: { createdAt: "asc" } });
}

export async function adminGetShippingRates() {
  await requireViewer();
  return prisma.shippingRate.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function adminGetTestimonials() {
  await requireViewer();
  return prisma.testimonial.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function adminGetFAQs() {
  await requireViewer();
  return prisma.fAQ.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function adminGetMessages() {
  await requireViewer();
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function adminGetSettings() {
  await requireSuperAdmin();
  const settings = await prisma.siteSetting.findMany();
  return Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCachedSiteSettings, HERO_IMAGE_PATH, invalidateSiteSettingsCache } from "@/lib/site-settings";
import {
  storeSchema,
  orderSchema,
  orderWeightSchema,
  trackingEventSchema,
  testimonialSchema,
  faqSchema,
  entityIdSchema,
  exchangeRateUpdateSchema,
  shippingRateUpdateSchema,
  promoProductSchema,
} from "@/lib/validations";
import { isWhatsAppHost, sourceLabel } from "@/lib/site-stats";
import {
  ORDER_EXPORT_MAX_ROWS,
  csvRow,
  formatOrderDateTime,
  nextDay,
  nextTrackingNumber,
  orderShippingFee,
  parseOrderListParams,
  shiftDate,
  zonedDayStart,
  type OrderListParams,
} from "@/lib/order-list";
import { ARTICLE_TYPE_LABELS, ORDER_STATUS_LABELS } from "@/types";
import { buildDashboardPeriods, dashboardHistoryStart } from "@/lib/dashboard-stats";
import type { Prisma } from "@prisma/client";
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
  "whatsapp_channel_url", "whatsapp_group_url",
  "address_paris", "address_abidjan", "facebook_url", "instagram_url", "tiktok_url", "hero_title",
  "hero_subtitle", "meta_description", "facebook_pixel_id", "google_ads_id",
  "google_analytics_id", "tiktok_pixel_id",
  // announcement_date is no longer shown, but stays accepted: the stored value comes back with every save.
  "announcement_enabled", "announcement_text", "announcement_link", "announcement_date",
  "hero_eyebrow", "hero_title_before", "hero_title_highlight", "hero_title_after",
  "hero_tagline", "hero_subtitle_text", "hero_cta_primary", "hero_cta_secondary", "hero_image",
]);
const SETTING_URL_HOSTS: Record<string, readonly string[]> = {
  whatsapp_link: ["wa.me", "api.whatsapp.com"],
  whatsapp_channel_url: ["whatsapp.com", "www.whatsapp.com"],
  whatsapp_group_url: ["chat.whatsapp.com"],
  facebook_url: ["facebook.com", "www.facebook.com"],
  instagram_url: ["instagram.com", "www.instagram.com"],
  tiktok_url: ["tiktok.com", "www.tiktok.com"],
};
const SETTING_MAX_LENGTH: Record<string, number> = {
  hero_image: 8_000_000,
};

function validateSiteSettings(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const entries = Object.entries(data);
  if (entries.length > SITE_SETTING_KEYS.size) return null;

  const settings: Record<string, string> = {};
  for (const [key, rawValue] of entries) {
    const maxLength = SETTING_MAX_LENGTH[key] ?? 1_000;
    if (!SITE_SETTING_KEYS.has(key) || typeof rawValue !== "string" || rawValue.length > maxLength) return null;
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
    revalidatePath("/");
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
    revalidatePath("/");
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
  revalidatePath("/");
  revalidatePath("/boutiques");
  revalidatePath("/admin/boutiques");
  return { success: true };
}

export async function toggleStoreActive(id: string, isActive: boolean) {
  await requireManager();
  if (!isValidEntityId(id) || typeof isActive !== "boolean") return { success: false, error: "Données invalides" };
  await prisma.store.update({ where: { id }, data: { isActive } });
  revalidatePath("/");
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
/** Prices come from the database: the form only sends the article type and a tariff id. */
async function resolveOrderPricing(articleType: "STANDARD" | "LUXE", shippingRateId?: string) {
  if (articleType === "LUXE") {
    const rate = await prisma.shippingRate.findFirst({
      where: { pricingType: "PERCENTAGE", isActive: true, percentage: { not: null } },
      orderBy: { displayOrder: "asc" },
      select: { percentage: true },
    });
    return rate ? { kgRate: null, luxePercent: rate.percentage } : null;
  }
  if (!shippingRateId) return null;
  const rate = await prisma.shippingRate.findFirst({
    where: { id: shippingRateId, pricingType: "PER_KG", isActive: true, price: { not: null } },
    select: { price: true },
  });
  return rate ? { kgRate: rate.price, luxePercent: null } : null;
}

const invalidPricingResult = { success: false as const, error: "Tarif d'expédition invalide ou inactif" };

export async function createOrder(data: unknown) {
  await requireManager();
  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides", details: parsed.error.flatten() };

  const existing = await prisma.order.findUnique({
    where: { trackingNumber: parsed.data.trackingNumber },
  });
  if (existing) return { success: false, error: "Ce numéro de suivi existe déjà" };

  try {
    const { orderDate, weight, shippingRateId, ...rest } = parsed.data;
    const pricing = await resolveOrderPricing(rest.articleType, shippingRateId);
    if (!pricing) return invalidPricingResult;

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
          ...pricing,
          customerEmail: rest.customerEmail || null,
          storeName: rest.storeName || null,
          storeOrderNumber: rest.storeOrderNumber || null,
          internalNotes: rest.internalNotes || null,
          weight: weight ?? null,
          weightAddedAt: weight ? new Date() : null,
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
    const { orderDate, weight, shippingRateId, ...rest } = parsed.data;
    const existing = await prisma.order.findUnique({ where: { id }, select: { articleType: true } });
    if (!existing) return { success: false, error: "Commande introuvable" };
    // Same article type and no tariff picked again → the price frozen on the order is kept.
    const keepPricing = rest.articleType === existing.articleType && (rest.articleType === "LUXE" || !shippingRateId);
    const pricing = keepPricing ? {} : await resolveOrderPricing(rest.articleType, shippingRateId);
    if (!pricing) return invalidPricingResult;

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
          ...pricing,
          customerEmail: rest.customerEmail || null,
          storeName: rest.storeName || null,
          storeOrderNumber: rest.storeOrderNumber || null,
          internalNotes: rest.internalNotes || null,
          ...(weight !== undefined ? { weight, weightAddedAt: new Date() } : {}),
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

export async function updateOrderWeight(data: unknown) {
  await requireManager();
  const parsed = orderWeightSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Poids ou date invalide" };

  try {
    const order = await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: {
        weight: parsed.data.weight,
        weightAddedAt: new Date(parsed.data.weightAddedAt),
      },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/commandes");
    return { success: true, order };
  } catch {
    return { success: false, error: "Impossible d'enregistrer les frais de transport" };
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
      data: { status: latestEvent?.status ?? "PURCHASED" },
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
    if (key === "hero_image" && value === HERO_IMAGE_PATH) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  // Site settings feed the root layout (header/footer/announcement bar) on every
  // route, so bust the shared layout cache, not just the homepage.
  invalidateSiteSettingsCache();
  revalidatePath("/", "layout");
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
  // One history window (start of the previous year) feeds every period and its comparison.
  const historyStart = zonedDayStart(shiftDate(dashboardHistoryStart(now), -1));

  const standardShippingRate = await prisma.shippingRate.findFirst({
    where: { pricingType: "PER_KG", isActive: true, price: { not: null } },
    orderBy: { displayOrder: "asc" },
    select: { price: true },
  });
  const weightRate = standardShippingRate?.price ?? 0;

  const [
    totalOrders, activeOrders, deliveredOrders, activeStores, unreadMessages, publishedTestimonials,
    totalRevenueAgg, feeOrders, revenueRows, recentOrders, recentMessages,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.store.count({ where: { isActive: true } }),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.testimonial.count({ where: { isPublished: true } }),
    prisma.order.aggregate({ _sum: { amount: true }, where: { status: { notIn: ["CANCELLED"] }, amount: { not: null } } }),
    prisma.order.findMany({
      where: {
        status: { notIn: ["CANCELLED"] },
        OR: [
          { weight: { not: null }, weightAddedAt: { not: null } },
          { articleType: "LUXE", amount: { not: null } },
        ],
      },
      select: {
        articleType: true, amount: true, weight: true, kgRate: true, luxePercent: true,
        weightAddedAt: true, orderDate: true,
      },
    }),
    prisma.order.findMany({
      where: { status: { notIn: ["CANCELLED"] }, orderDate: { gte: historyStart } },
      select: { amount: true, orderDate: true, createdAt: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, trackingNumber: true, customerName: true, destinationCity: true,
        destinationCountry: true, status: true, createdAt: true,
      },
    }),
    prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, subject: true, status: true, createdAt: true },
    }),
  ]);

  // Per-kg fees are dated when the weight is entered; luxury fees (% of the amount) at the order date.
  const feeRows = feeOrders.map((o) => ({
    fee: orderShippingFee(o, weightRate),
    weight: o.articleType === "LUXE" ? null : o.weight,
    date: o.articleType === "LUXE" ? o.orderDate : o.weightAddedAt,
  }));
  const totalTransport = feeRows.reduce((sum, row) => sum + row.fee, 0);

  return {
    totalOrders,
    activeOrders,
    deliveredOrders,
    activeStores,
    unreadMessages,
    publishedTestimonials,
    totalRevenue: totalRevenueAgg._sum.amount ?? 0,
    totalTransport,
    periods: buildDashboardPeriods(revenueRows, feeRows, now),
    recentOrders,
    recentMessages,
  };
}

/** Cheap count used by the admin shell (sidebar badge + notification bell). */
export async function getUnreadMessageCount() {
  await requireViewer();
  return prisma.contactMessage.count({ where: { status: "UNREAD" } });
}

// ─── ADMIN GETTERS ────────────────────────────────────────────────────────────
async function buildOrderWhere(params: OrderListParams): Promise<Prisma.OrderWhereInput> {
  const and: Prisma.OrderWhereInput[] = [];
  if (params.search) {
    const contains = { contains: params.search };
    const or: Prisma.OrderWhereInput[] = [
      { trackingNumber: contains },
      { customerName: contains },
      { customerPhone: contains },
      { storeOrderNumber: contains },
      { storeName: contains },
      { destinationCity: contains },
    ];
    // Phones are stored as typed ("+225 07 00 00 …"): compare digits only, so "0700" finds them too.
    const digits = params.search.replace(/\D/g, "");
    if (digits.length >= 4 && /^[\d\s+().-]+$/.test(params.search)) {
      const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM orders
        WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(customerPhone, ' ', ''), '+', ''), '-', ''), '.', ''), '(', ''), ')', '')
          LIKE ${`%${digits}%`}
        LIMIT 1000`;
      if (rows.length) or.push({ id: { in: rows.map((row) => row.id) } });
    }
    and.push({ OR: or });
  }
  if (params.status) and.push({ status: params.status });
  if (params.destination) and.push({ destinationCity: params.destination });
  if (params.dateFrom || params.dateTo) {
    and.push({
      createdAt: {
        ...(params.dateFrom ? { gte: zonedDayStart(params.dateFrom) } : {}),
        ...(params.dateTo ? { lt: zonedDayStart(nextDay(params.dateTo)) } : {}),
      },
    });
  }
  return and.length ? { AND: and } : {};
}

function buildOrderSort(params: OrderListParams): Prisma.OrderOrderByWithRelationInput[] {
  // "id" as tie-breaker keeps pagination stable when the sorted column has duplicates.
  return [{ [params.sort]: params.order }, { id: params.order }];
}

export async function adminListOrders(rawParams: unknown) {
  await requireViewer();
  const params = parseOrderListParams((rawParams ?? {}) as Record<string, unknown>);
  const where = await buildOrderWhere(params);

  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const page = Math.min(params.page, totalPages);

  const [orders, totalOrders, delivered, phones, destinations, shippingRates, lastOrder] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: buildOrderSort(params),
      skip: (page - 1) * params.limit,
      take: params.limit,
      include: { trackingEvents: { orderBy: { displayOrder: "asc" } } },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.groupBy({ by: ["customerPhone"] }),
    prisma.order.groupBy({ by: ["destinationCity"], orderBy: { destinationCity: "asc" } }),
    prisma.shippingRate.findMany({
      where: { isActive: true, pricingType: { in: ["PER_KG", "PERCENTAGE"] } },
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, pricingType: true, price: true, percentage: true },
    }),
    // The "previous order" is the last one created; its number is incremented for the next one.
    prisma.order.findFirst({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { trackingNumber: true },
    }),
  ]);

  const uniqueClients = new Set(phones.map((p) => normalizePhone(p.customerPhone))).size;
  const kgRates = shippingRates.flatMap((rate) =>
    rate.pricingType === "PER_KG" && rate.price !== null ? [{ id: rate.id, name: rate.name, price: rate.price }] : [],
  );
  const luxePercent = shippingRates.find((rate) => rate.pricingType === "PERCENTAGE" && rate.percentage !== null)?.percentage ?? null;

  // Skip numbers already taken (one typed by hand ahead of the sequence), so the prefilled one always saves.
  let nextNumber = nextTrackingNumber(lastOrder?.trackingNumber);
  for (let i = 0; i < 50; i++) {
    const taken = await prisma.order.findUnique({ where: { trackingNumber: nextNumber }, select: { id: true } });
    if (!taken) break;
    nextNumber = nextTrackingNumber(nextNumber);
  }

  return {
    params: { ...params, page },
    orders,
    total,
    totalPages,
    stats: {
      total: totalOrders,
      inProgress: totalOrders - delivered,
      delivered,
      uniqueClients,
    },
    destinations: destinations.map((d) => d.destinationCity).filter(Boolean),
    // Default per-kg price for old orders that have no frozen rate.
    weightRate: kgRates[0]?.price ?? 0,
    kgRates,
    luxePercent,
    nextTrackingNumber: nextNumber,
  };
}

export async function adminExportOrdersCsv(rawParams: unknown) {
  await requireManager();
  const params = parseOrderListParams((rawParams ?? {}) as Record<string, unknown>);

  const orders = await prisma.order.findMany({
    where: await buildOrderWhere(params),
    orderBy: buildOrderSort(params),
    take: ORDER_EXPORT_MAX_ROWS + 1,
    select: {
      trackingNumber: true,
      customerName: true,
      customerPhone: true,
      storeOrderNumber: true,
      destinationCity: true,
      destinationCountry: true,
      status: true,
      createdAt: true,
      amount: true,
      packageCount: true,
      weight: true,
      weightAddedAt: true,
      articleType: true,
      kgRate: true,
      luxePercent: true,
    },
  });

  const truncated = orders.length > ORDER_EXPORT_MAX_ROWS;
  const rows = truncated ? orders.slice(0, ORDER_EXPORT_MAX_ROWS) : orders;

  const lines = [
    csvRow([
      "N° Suivi", "Client", "Téléphone", "N° commande boutique", "Ville", "Pays",
      "Statut", "Date", "Heure", "Montant (FCFA)", "Colis", "Poids (kg)", "Date ajout poids",
      "Type d'articles", "Frais de transport (FCFA)",
    ]),
    ...rows.map((o) => {
      const { date, time } = formatOrderDateTime(o.createdAt);
      return csvRow([
        o.trackingNumber, o.customerName, o.customerPhone, o.storeOrderNumber,
        o.destinationCity, o.destinationCountry, ORDER_STATUS_LABELS[o.status] ?? o.status,
        date, time, o.amount, o.packageCount, o.weight,
        o.weightAddedAt ? formatOrderDateTime(o.weightAddedAt).date : null,
        ARTICLE_TYPE_LABELS[o.articleType], orderShippingFee(o) || null,
      ]);
    }),
  ];

  // The UTF-8 BOM (so Excel reads accents) is added by the client when building the file.
  return { csv: lines.join("\r\n"), count: rows.length, truncated };
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
  return getCachedSiteSettings();
}

// ─── PROMOS ───────────────────────────────────────────────────────────────────
function revalidatePromos() {
  revalidatePath("/promos", "layout");
  revalidatePath("/admin/promos");
}

export async function adminGetPromoProducts() {
  await requireViewer();
  return prisma.promoProduct.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, storeId: true, title: true, affiliateUrl: true, price: true, oldPrice: true,
      isActive: true, displayOrder: true, updatedAt: true, store: { select: { name: true } },
    },
  });
}

export async function createPromoProduct(data: unknown) {
  await requireManager();
  const parsed = promoProductSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  const { image, ...fields } = parsed.data;
  if (!image) return { success: false, error: "Ajoutez une image" };

  try {
    await prisma.promoProduct.create({ data: { ...fields, image } });
  } catch {
    return { success: false, error: "Boutique introuvable" };
  }
  revalidatePromos();
  return { success: true };
}

export async function updatePromoProduct(id: string, data: unknown) {
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  const parsed = promoProductSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  const { image, ...fields } = parsed.data;

  try {
    await prisma.promoProduct.update({ where: { id }, data: { ...fields, ...(image ? { image } : {}) } });
  } catch {
    return { success: false, error: "Article introuvable" };
  }
  revalidatePromos();
  return { success: true };
}

export async function deletePromoProduct(id: string) {
  await requireManager();
  if (!isValidEntityId(id)) return invalidIdResult;
  await prisma.promoProduct.deleteMany({ where: { id } });
  revalidatePromos();
  return { success: true };
}

// ─── SITE STATISTICS ──────────────────────────────────────────────────────────
// Not exported: a "use server" file may export async functions only.
const SITE_STATS_PERIODS = [7, 30, 90] as const;

function countRows<T extends string>(rows: { key: T | null; count: number }[]) {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.key ?? "", (totals.get(row.key ?? "") ?? 0) + row.count);
  return totals;
}

export async function adminGetSiteStats(days: number) {
  await requireViewer();
  const period = SITE_STATS_PERIODS.includes(days as (typeof SITE_STATS_PERIODS)[number]) ? days : 30;
  const since = new Date(Date.now() - period * 86_400_000);
  const inPeriod = { createdAt: { gte: since } };
  const viewTypes = { in: ["visit", "page"] };

  const [visitRows, clickRows, pageViews, pageRows, deviceRows, campaignRows, referrerRows, dailyRows] = await Promise.all([
    prisma.siteEvent.groupBy({ by: ["source"], where: { ...inPeriod, type: "visit" }, _count: { _all: true } }),
    prisma.siteEvent.groupBy({ by: ["source", "target"], where: { ...inPeriod, type: "click" }, _count: { _all: true } }),
    prisma.siteEvent.count({ where: { ...inPeriod, type: viewTypes } }),
    prisma.siteEvent.groupBy({
      by: ["path"], where: { ...inPeriod, type: viewTypes }, _count: { path: true },
      orderBy: { _count: { path: "desc" } }, take: 10,
    }),
    prisma.siteEvent.groupBy({ by: ["device"], where: { ...inPeriod, type: "visit" }, _count: { _all: true } }),
    prisma.siteEvent.groupBy({
      by: ["utmCampaign", "type", "target"],
      where: { ...inPeriod, utmCampaign: { not: null }, type: { in: ["visit", "click"] } },
      _count: { _all: true },
    }),
    prisma.siteEvent.groupBy({
      by: ["referrerHost"], where: { ...inPeriod, type: "visit", source: "other" }, _count: { referrerHost: true },
      orderBy: { _count: { referrerHost: "desc" } }, take: 10,
    }),
    prisma.$queryRaw<{ day: string; visits: bigint }[]>`
      SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS day, COUNT(*) AS visits
      FROM site_events WHERE type = 'visit' AND createdAt >= ${since}
      GROUP BY day ORDER BY day`,
  ]);

  const whatsappRows = clickRows.filter((row) => isWhatsAppHost(row.target));
  const visitsBySource = countRows(visitRows.map((row) => ({ key: row.source, count: row._count._all })));
  const whatsappBySource = countRows(whatsappRows.map((row) => ({ key: row.source, count: row._count._all })));
  const sources = [...new Set([...visitsBySource.keys(), ...whatsappBySource.keys()])]
    .map((source) => ({
      source, label: sourceLabel(source),
      visits: visitsBySource.get(source) ?? 0, whatsapp: whatsappBySource.get(source) ?? 0,
    }))
    .sort((a, b) => b.visits - a.visits || b.whatsapp - a.whatsapp);

  const outbound = countRows(
    clickRows.filter((row) => !isWhatsAppHost(row.target)).map((row) => ({ key: row.target, count: row._count._all })),
  );

  const campaigns = new Map<string, { visits: number; whatsapp: number }>();
  for (const row of campaignRows) {
    const entry = campaigns.get(row.utmCampaign ?? "") ?? { visits: 0, whatsapp: 0 };
    if (row.type === "visit") entry.visits += row._count._all;
    else if (isWhatsAppHost(row.target)) entry.whatsapp += row._count._all;
    campaigns.set(row.utmCampaign ?? "", entry);
  }

  const dailyByDay = new Map(dailyRows.map((row) => [row.day, Number(row.visits)]));
  const daily = Array.from({ length: period }, (_, index) => {
    const day = new Date(Date.now() - (period - 1 - index) * 86_400_000).toISOString().slice(0, 10);
    return { label: `${day.slice(8, 10)}/${day.slice(5, 7)}`, value: dailyByDay.get(day) ?? 0 };
  });

  const deviceLabels: Record<string, string> = { mobile: "Mobile", tablet: "Tablette", desktop: "Ordinateur" };
  return {
    period,
    visits: [...visitsBySource.values()].reduce((sum, value) => sum + value, 0),
    pageViews,
    whatsappClicks: whatsappRows.reduce((sum, row) => sum + row._count._all, 0),
    outboundClicks: [...outbound.values()].reduce((sum, value) => sum + value, 0),
    sources,
    outbound: [...outbound].map(([host, clicks]) => ({ host, clicks })).sort((a, b) => b.clicks - a.clicks).slice(0, 10),
    campaigns: [...campaigns].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.visits - a.visits),
    pages: pageRows.map((row) => ({ path: row.path, views: row._count.path })),
    devices: deviceRows
      .map((row) => ({ label: deviceLabels[row.device] ?? row.device, visits: row._count._all }))
      .sort((a, b) => b.visits - a.visits),
    referrers: referrerRows.map((row) => ({ host: row.referrerHost ?? "", visits: row._count.referrerHost })),
    daily,
  };
}

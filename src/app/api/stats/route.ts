import { z } from "zod";
import { prisma } from "@/lib/db";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";
import { classifyVisit, deviceFromUserAgent, isBot } from "@/lib/site-stats";

const eventSchema = z.object({
  t: z.enum(["visit", "page", "click"]),
  p: z.string().startsWith("/").max(300),
  r: z.string().max(1_000).default(""),
  q: z.string().max(1_000).default(""),
  h: z.string().max(1_000).optional(),
});

const RETENTION_MONTHS = 13;
const noContent = () => new Response(null, { status: 204 });

export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return noContent();

  const body = await request.text();
  if (body.length > 4_000) return new Response(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) return new Response(null, { status: 400 });
  const event = parsed.data;
  if (event.p.startsWith("/admin")) return noContent();

  const limit = await consumeRateLimit("site-stats", await getRequestFingerprint(), 300, 60 * 60 * 1000);
  if (!limit.allowed) return noContent();

  let target: string | null = null;
  if (event.t === "click") {
    try {
      target = new URL(event.h ?? "").hostname.toLowerCase().replace(/^www\./, "").slice(0, 255);
    } catch {
      return new Response(null, { status: 400 });
    }
  }

  const ownHost = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(":")[0];
  const origin = classifyVisit(event.r, event.q, ownHost);
  await prisma.siteEvent.create({
    data: { type: event.t, path: event.p, device: deviceFromUserAgent(userAgent), target, ...origin },
  });

  // shortcut: purge runs on ~1 request in 200 instead of a scheduled job; fine at this traffic.
  if (Math.random() < 0.005) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
    await prisma.siteEvent.deleteMany({ where: { createdAt: { lt: cutoff } } });
  }
  return noContent();
}

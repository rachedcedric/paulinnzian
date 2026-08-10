import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

interface RateLimitRow {
  attempts: number;
  expiresAt: Date;
}

export async function getRequestFingerprint() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || requestHeaders.get("x-real-ip") || "unknown";
}

export async function consumeRateLimit(
  scope: string,
  identifier: string,
  maximumAttempts: number,
  windowMs: number,
) {
  const key = createHash("sha256").update(`${scope}:${identifier}`).digest("hex");
  const expiresAt = new Date(Date.now() + windowMs);
  const rows = await prisma.$queryRaw<RateLimitRow[]>`
    INSERT INTO public_rate_limits ("key", "attempts", "expiresAt", "updatedAt")
    VALUES (${key}, 1, ${expiresAt}, NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "attempts" = CASE
        WHEN public_rate_limits."expiresAt" <= NOW() THEN 1
        ELSE public_rate_limits."attempts" + 1
      END,
      "expiresAt" = CASE
        WHEN public_rate_limits."expiresAt" <= NOW() THEN EXCLUDED."expiresAt"
        ELSE public_rate_limits."expiresAt"
      END,
      "updatedAt" = NOW()
    RETURNING "attempts", "expiresAt"
  `;

  return {
    allowed: rows[0].attempts <= maximumAttempts,
    retryAfter: rows[0].expiresAt,
  };
}
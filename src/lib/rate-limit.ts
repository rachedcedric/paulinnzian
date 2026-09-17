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

  const rows = await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`
      DELETE FROM public_rate_limits
      WHERE \`expiresAt\` <= NOW()
    `;

    await transaction.$executeRaw`
      INSERT INTO public_rate_limits (\`key\`, \`attempts\`, \`expiresAt\`, \`updatedAt\`)
      VALUES (${key}, 1, ${expiresAt}, NOW())
      ON DUPLICATE KEY UPDATE
        \`attempts\` = CASE
          WHEN \`expiresAt\` <= NOW() THEN 1
          ELSE \`attempts\` + 1
        END,
        \`expiresAt\` = CASE
          WHEN \`expiresAt\` <= NOW() THEN VALUES(\`expiresAt\`)
          ELSE \`expiresAt\`
        END,
        \`updatedAt\` = NOW()
    `;

    return transaction.$queryRaw<RateLimitRow[]>`
      SELECT \`attempts\`, \`expiresAt\` FROM public_rate_limits WHERE \`key\` = ${key}
    `;
  });

  return {
    allowed: rows[0].attempts <= maximumAttempts,
    retryAfter: rows[0].expiresAt,
  };
}

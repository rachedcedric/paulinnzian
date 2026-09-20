import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const DATA_IMAGE_PATTERN = /^data:(image\/(?:gif|jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/;

export async function GET() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "hero_image" },
    select: { value: true, updatedAt: true },
  });
  const match = setting?.value.match(DATA_IMAGE_PATTERN);

  if (!setting || !match) {
    return new Response(null, { status: 404 });
  }

  const image = Buffer.from(match[2], "base64");

  return new Response(image, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
      "Content-Type": match[1],
      ETag: `"${setting.updatedAt.getTime()}-${image.byteLength}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
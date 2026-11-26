import { prisma } from "@/lib/db";
import { DATA_IMAGE_PATTERN, entityIdSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!entityIdSchema.safeParse(id).success) return new Response(null, { status: 404 });

  const product = await prisma.promoProduct.findUnique({ where: { id }, select: { image: true, updatedAt: true } });
  const match = product?.image.match(DATA_IMAGE_PATTERN);
  if (!product || !match) return new Response(null, { status: 404 });

  const image = Buffer.from(match[2], "base64");
  return new Response(image, {
    headers: {
      // Pages link the image with ?v=<updatedAt>, so a changed image gets a new URL.
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Type": match[1],
      ETag: `"${product.updatedAt.getTime()}-${image.byteLength}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

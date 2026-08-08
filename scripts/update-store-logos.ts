import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

// Google favicon API (128px) — plus fiable que Clearbit
function gLogo(domain: string) {
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
}

const STORE_LOGOS: Record<string, string> = {
  shein:             gLogo("shein.com"),
  "fashion-nova":    gLogo("fashionnova.com"),
  zara:              gLogo("zara.com"),
  hm:                gLogo("hm.com"),
  bershka:           gLogo("bershka.com"),
  "pull-and-bear":   gLogo("pullandbear.com"),
  mango:             gLogo("mango.com"),
  asos:              gLogo("asos.com"),
  boohoo:            gLogo("boohoo.com"),
  prettylittlething: gLogo("prettylittlething.com"),
  temu:              gLogo("temu.com"),
  aliexpress:        gLogo("aliexpress.com"),
  amazon:            gLogo("amazon.com"),
  nike:              gLogo("nike.com"),
  adidas:            gLogo("adidas.com"),
  puma:              gLogo("puma.com"),
  "jd-sports":       gLogo("jdsports.com"),
  sephora:           gLogo("sephora.com"),
  "yves-rocher":     gLogo("yves-rocher.fr"),
  apple:             gLogo("apple.com"),
  samsung:           gLogo("samsung.com"),
  ikea:              gLogo("ikea.com"),
  "leroy-merlin":    gLogo("leroymerlin.fr"),
  decathlon:         gLogo("decathlon.com"),
  cdiscount:         gLogo("cdiscount.com"),
  zalando:           gLogo("zalando.fr"),
};

async function main() {
  console.log("🖼️  Mise à jour des logos des boutiques...");
  let updated = 0;
  let skipped = 0;

  for (const [slug, logoUrl] of Object.entries(STORE_LOGOS)) {
    const store = await prisma.store.findUnique({ where: { slug } });
    if (!store) {
      console.log(`  ⚠️  Boutique non trouvée : ${slug}`);
      continue;
    }
    // Ne pas écraser les logos uploadés manuellement (base64)
    if (store.logo && store.logo.startsWith("data:")) {
      console.log(`  ⏭️  Logo manuel conservé : ${store.name}`);
      skipped++;
      continue;
    }
    await prisma.store.update({
      where: { slug },
      data: { logo: logoUrl },
    });
    console.log(`  ✅ ${store.name}`);
    updated++;
  }

  console.log(`\n🎉 Terminé : ${updated} logos mis à jour, ${skipped} conservés (manuel)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

import { PrismaClient, PricingType, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const hashedPassword = await bcrypt.hash("Admin@2026!", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@mrshein.fr" },
    update: {},
    create: {
      email: "admin@mrshein.fr",
      password: hashedPassword,
      name: "Paulin N'ZIAN",
      role: Role.SUPER_ADMIN,
    },
  });
  console.log("✅ Admin user created");

  // Exchange rates
  await prisma.exchangeRate.upsert({
    where: { id: "shein-rate" },
    update: {},
    create: {
      id: "shein-rate",
      name: "Taux SHEIN France",
      rate: 655,
      currencyFrom: "EUR",
      currencyTo: "XOF",
      description: "Taux appliqué aux commandes sur SHEIN France",
      isActive: true,
    },
  });
  await prisma.exchangeRate.upsert({
    where: { id: "other-rate" },
    update: {},
    create: {
      id: "other-rate",
      name: "Autres Boutiques",
      rate: 670,
      currencyFrom: "EUR",
      currencyTo: "XOF",
      description: "Taux appliqué aux autres boutiques",
      isActive: true,
    },
  });
  console.log("✅ Exchange rates created");

  // Shipping rates
  const shippingRates = [
    {
      id: "standard",
      name: "Standard",
      pricingType: PricingType.PER_KG,
      price: 9800,
      description: "Vêtements et accessoires",
      estimatedDelivery: "3 à 7 jours",
      displayOrder: 1,
    },
    {
      id: "express",
      name: "Express",
      pricingType: PricingType.PER_KG,
      price: 19000,
      description: "Livraison prioritaire",
      estimatedDelivery: "24h à 48h",
      displayOrder: 2,
    },
    {
      id: "luxe",
      name: "Articles de Luxe",
      pricingType: PricingType.PERCENTAGE,
      percentage: 10,
      description: "Gucci, Chanel, Louis Vuitton, etc.",
      estimatedDelivery: "5 à 10 jours",
      displayOrder: 3,
    },
    {
      id: "electronique",
      name: "Appareils Électroniques",
      pricingType: PricingType.PERCENTAGE,
      percentage: 10,
      description: "Téléphones, Ordinateurs, Tablettes, etc.",
      estimatedDelivery: "5 à 10 jours",
      displayOrder: 4,
    },
  ];

  for (const rate of shippingRates) {
    await prisma.shippingRate.upsert({
      where: { id: rate.id },
      update: {},
      create: rate,
    });
  }
  console.log("✅ Shipping rates created");

  // Stores
  const stores = [
    { name: "SHEIN", slug: "shein", websiteUrl: "https://www.shein.fr", category: "Mode", displayOrder: 1 },
    { name: "Fashion Nova", slug: "fashion-nova", websiteUrl: "https://www.fashionnova.com", category: "Mode", displayOrder: 2 },
    { name: "Zara", slug: "zara", websiteUrl: "https://www.zara.com/fr", category: "Mode", displayOrder: 3 },
    { name: "H&M", slug: "hm", websiteUrl: "https://www2.hm.com/fr_fr", category: "Mode", displayOrder: 4 },
    { name: "Bershka", slug: "bershka", websiteUrl: "https://www.bershka.com/fr", category: "Mode", displayOrder: 5 },
    { name: "Pull&Bear", slug: "pull-and-bear", websiteUrl: "https://www.pullandbear.com/fr", category: "Mode", displayOrder: 6 },
    { name: "Mango", slug: "mango", websiteUrl: "https://www.mango.com/fr", category: "Mode", displayOrder: 7 },
    { name: "ASOS", slug: "asos", websiteUrl: "https://www.asos.com/fr", category: "Mode", displayOrder: 8 },
    { name: "Boohoo", slug: "boohoo", websiteUrl: "https://www.boohoo.com", category: "Mode", displayOrder: 9 },
    { name: "PrettyLittleThing", slug: "prettylittlething", websiteUrl: "https://www.prettylittlething.fr", category: "Mode", displayOrder: 10 },
    { name: "Temu", slug: "temu", websiteUrl: "https://www.temu.com/fr", category: "Marketplace", displayOrder: 11 },
    { name: "AliExpress", slug: "aliexpress", websiteUrl: "https://fr.aliexpress.com", category: "Marketplace", displayOrder: 12 },
    { name: "Amazon", slug: "amazon", websiteUrl: "https://www.amazon.fr", category: "Marketplace", displayOrder: 13 },
    { name: "Nike", slug: "nike", websiteUrl: "https://www.nike.com/fr", category: "Sport", displayOrder: 14 },
    { name: "Adidas", slug: "adidas", websiteUrl: "https://www.adidas.fr", category: "Sport", displayOrder: 15 },
    { name: "Puma", slug: "puma", websiteUrl: "https://fr.puma.com", category: "Sport", displayOrder: 16 },
    { name: "JD Sports", slug: "jd-sports", websiteUrl: "https://www.jdsports.fr", category: "Sport", displayOrder: 17 },
    { name: "Sephora", slug: "sephora", websiteUrl: "https://www.sephora.fr", category: "Beauté", displayOrder: 18 },
    { name: "Yves Rocher", slug: "yves-rocher", websiteUrl: "https://www.yves-rocher.fr", category: "Beauté", displayOrder: 19 },
    { name: "Apple", slug: "apple", websiteUrl: "https://www.apple.com/fr", category: "High-Tech", displayOrder: 20 },
    { name: "Samsung", slug: "samsung", websiteUrl: "https://www.samsung.com/fr", category: "High-Tech", displayOrder: 21 },
    { name: "IKEA", slug: "ikea", websiteUrl: "https://www.ikea.com/fr", category: "Maison", displayOrder: 22 },
    { name: "Leroy Merlin", slug: "leroy-merlin", websiteUrl: "https://www.leroymerlin.fr", category: "Maison", displayOrder: 23 },
    { name: "Decathlon", slug: "decathlon", websiteUrl: "https://www.decathlon.fr", category: "Sport", displayOrder: 24 },
    { name: "Cdiscount", slug: "cdiscount", websiteUrl: "https://www.cdiscount.com", category: "Marketplace", displayOrder: 25 },
    { name: "Zalando", slug: "zalando", websiteUrl: "https://www.zalando.fr", category: "Mode", displayOrder: 26 },
  ];

  for (const store of stores) {
    await prisma.store.upsert({
      where: { slug: store.slug },
      update: {},
      create: { ...store, isActive: true },
    });
  }
  console.log("✅ Stores created");

  // FAQs
  const faqs = [
    {
      id: "faq-1",
      question: "Comment passer une commande ?",
      answer: "Envoyez-moi le lien du produit ou votre panier via WhatsApp. Je vous communique le montant exact, et une fois le paiement effectué, j'achète immédiatement.",
      displayOrder: 1,
    },
    {
      id: "faq-2",
      question: "Quels sont les délais de livraison ?",
      answer: "Les délais varient selon le mode d'expédition choisi. Standard : 3 à 7 jours. Express : 24h à 48h. Pour les articles de luxe et électroniques : 5 à 10 jours.",
      displayOrder: 2,
    },
    {
      id: "faq-3",
      question: "Comment effectuer le paiement ?",
      answer: "Les paiements sont acceptés en espèces et par Mobile Money. Les modalités exactes vous sont communiquées au moment de la validation de votre commande.",
      displayOrder: 3,
    },
    {
      id: "faq-4",
      question: "Quels pays sont disponibles pour l'expédition ?",
      answer: "Nous expédions principalement vers Abidjan (Côte d'Ivoire) et d'autres destinations en Afrique. Contactez-moi via WhatsApp pour connaître les destinations disponibles.",
      displayOrder: 4,
    },
    {
      id: "faq-5",
      question: "Comment fonctionne l'expédition ?",
      answer: "Après réception de vos colis à Paris, ils sont regroupés et expédiés vers votre destination. Vous recevez un numéro de suivi pour suivre votre commande en temps réel.",
      displayOrder: 5,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { id: faq.id },
      update: {},
      create: { ...faq, isPublished: true },
    });
  }
  console.log("✅ FAQs created");

  // Site settings
  const settings = [
    { key: "site_name", value: "Paulin N'ZIAN - Personal Shopper" },
    { key: "site_slogan", value: "Votre Personal Shopper pour vos achats en Europe" },
    { key: "whatsapp_number", value: "+33637036839" },
    { key: "whatsapp_link", value: "https://wa.me/33637036839" },
    { key: "phone_ci", value: "+225 07 77 06 13 30" },
    { key: "address_paris", value: "Paris 18ème arrondissement" },
    { key: "address_abidjan", value: "Cocody Faya, Abidjan" },
    { key: "facebook_url", value: "#" },
    { key: "instagram_url", value: "#" },
    { key: "tiktok_url", value: "https://www.tiktok.com/@paulinnzianofficiel" },
    { key: "hero_title", value: "ACHETEZ MOINS CHER SUR VOS BOUTIQUES PRÉFÉRÉES." },
    { key: "hero_subtitle", value: "Votre Personal Shopper pour vos achats en Europe." },
    { key: "meta_description", value: "Personal Shopper pour vos achats sur SHEIN, Fashion Nova, Zara, Amazon, Apple, Samsung et vos boutiques préférées. Tarifs transparents, zéro frais caché et réexpédition de vos colis." },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Site settings created");

  console.log("🎉 Database seeded successfully!");
  console.log("\n📧 Admin credentials:");
  console.log("   Email:    admin@mrshein.fr");
  console.log("   Password: Admin@2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

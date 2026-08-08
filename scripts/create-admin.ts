import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  const email = process.argv[2] || "paulin@mrshein.fr";
  const password = process.argv[3] || "SecurePass123!";
  const name = process.argv[4] || "Paulin Admin";

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "SUPER_ADMIN",
      },
    });
    console.log("✅ Admin créé avec succès:");
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);
    console.log(`   Nom: ${name}`);
    console.log(`   ID: ${user.id}`);
  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

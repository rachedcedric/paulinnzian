import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("invalid-password-placeholder", 12);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const { prisma } = await import("@/lib/db");
        const user = await prisma.adminUser.findUnique({ where: { email } });
        if (!user) {
          await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
          return null;
        }

        const now = new Date();
        if (user.lockedUntil && user.lockedUntil > now) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          const failedLoginAttempts = user.failedLoginAttempts + 1;
          await prisma.adminUser.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts,
              lockedUntil: failedLoginAttempts >= MAX_LOGIN_ATTEMPTS
                ? new Date(now.getTime() + LOCK_DURATION_MS)
                : null,
            },
          });
          return null;
        }

        if (user.failedLoginAttempts || user.lockedUntil) {
          await prisma.adminUser.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});

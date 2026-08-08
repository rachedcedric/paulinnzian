import type { NextAuthConfig } from "next-auth";

// Lightweight config for Edge middleware — no bcrypt, no Prisma
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminPath = nextUrl.pathname.startsWith("/admin");
      const isLoginPath = nextUrl.pathname === "/admin/login";

      if (isAdminPath && !isLoginPath && !isLoggedIn) return false;
      if (isLoginPath && isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl.origin));
      }
      return true;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

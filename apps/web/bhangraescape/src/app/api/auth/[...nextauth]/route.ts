// apps/web/bhangraescape/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../../../../../lib/prisma";



export const { handlers: { GET, POST }, auth } = NextAuth({
  // IMPORTANT: pass your env vars to the provider
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,        // from .env.local
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,// from .env.local
    }),
  ],
  session: { strategy: "jwt" },
  // (optional but useful) read NEXTAUTH_SECRET/NEXTAUTH_URL from env automatically
  // trustHost: true, // uncomment if you use a custom dev host or proxy
  callbacks: {
    async jwt({ token, user }) {
      // first login: user is defined → copy things into the token
       if (user) {
      // Fetch role from DB if needed (Prisma) or hardcode for your account
      if (user.email === "ekamsingh643@gmail.com") {
        token.role = "ADMIN";  
      } else {
        token.role = "GUEST";
      }
    }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).sub ?? (token as any).id ?? null;
        (session.user as any).role = (token as any).role ?? "GUEST";
      }
      return session;
    },
  },
});
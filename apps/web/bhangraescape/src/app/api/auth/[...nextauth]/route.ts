// apps/web/bhangraescape/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../../../../../lib/prisma";


export const { handlers: { GET, POST }, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // Keep token lean; do not set role here.
      // token.sub contains the user id after first login.
      return token;
    },
    async session({ session, token }) {
      // Expose user id on session
      if (session.user) {
        (session.user as any).id = (token as any).sub ?? (token as any).id ?? null;
      }

      // Read the latest role from DB every time
      const userId = (token as any).sub ?? null;
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        (session.user as any).role = dbUser?.role ?? "GUEST";
      } else {
        (session.user as any).role = "GUEST";
      }
      return session;
    },
  },
});
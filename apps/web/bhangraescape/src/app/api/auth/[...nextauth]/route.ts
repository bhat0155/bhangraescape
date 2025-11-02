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
    if (user) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
      token.role = dbUser?.role ?? "GUEST";
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      (session.user as any).role = token.role ?? "GUEST";
    }
    return session;
  },
}

});
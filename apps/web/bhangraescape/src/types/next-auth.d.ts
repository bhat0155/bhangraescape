import { DefaultSession } from "next-auth";

type Role = "GUEST" | "MEMBER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      role?: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}

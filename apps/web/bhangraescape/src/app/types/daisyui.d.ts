declare module "daisyui";

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// 1. Define the possible roles used in your application (must match your Prisma Enum)
export type UserRole = "ADMIN" | "USER" | "GUEST";

// 2. Extend the base 'User' type (used when fetching user from database)
declare module "next-auth" {
  interface User extends DefaultUser {
    role: UserRole;
  }

  // 3. Extend the 'Session' type (used by useSession, getSession, etc.)
  interface Session extends DefaultSession {
    user?: {
      // We must explicitly re-declare any base properties you are relying on
      // like id, name, email, image, and then add our custom ones.
      id: string; // Assuming you set this in your JWT callback
      role: UserRole;
    } & DefaultSession["user"];
  }
}

// 4. Extend the 'JWT' type
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole;
  }
}
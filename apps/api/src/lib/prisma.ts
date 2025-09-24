import { PrismaClient } from "@prisma/client";

declare global {
    var __prisma__: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma = global.__prisma__ || new PrismaClient();


// if not in production, assign to the global object
if(process.env.NODE_ENV !=="production"){
    global.__prisma__ = prisma
}
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

/**
 * Determine whether the incoming request was served over HTTPS.
 * Next.js sets `nextUrl` on NextRequest, but we also fall back to proxy headers
 * so this works for plain Requests (e.g. when running locally).
 */
const isNextRequest = (req: NextRequest | Request): req is NextRequest =>
  "nextUrl" in req;

export const isSecureRequest = (req: NextRequest | Request): boolean => {
  if (isNextRequest(req)) {
    return req.nextUrl.protocol === "https:";
  }

  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  const forwardedHeader = req.headers.get("forwarded");
  if (forwardedHeader) {
    const protoMatch = forwardedHeader.toLowerCase().match(/proto=(https?)/);
    if (protoMatch) {
      return protoMatch[1] === "https";
    }
  }

  return process.env.NODE_ENV === "production";
};

/**
 * Read the raw Auth.js session token from any Next.js request,
 * ensuring we look for the secure cookie name when running over HTTPS.
 */
export const getRawAuthToken = async (req: NextRequest | Request) => {
  if (!AUTH_SECRET) {
    throw new Error("Missing NEXTAUTH_SECRET or AUTH_SECRET env var.");
  }

  return getToken({
    req,
    raw: true,
    secret: AUTH_SECRET,
    secureCookie: isSecureRequest(req),
  });
};

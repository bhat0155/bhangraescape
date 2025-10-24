import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!; // e.g. http://localhost:4000/api

export async function POST(req: NextRequest) {
  console.log("➡️ [Proxy] POST /api/events hit");

  const rawJWT = await getToken({ req, raw: true });
  const body = await req.json();

  const upstream = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
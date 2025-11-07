import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE = process.env.API_INTERNAL_BASE_URL!;

type Params = { eventId: string };

export async function POST(
  req: NextRequest,
  context: { params: Params }
) {
  const { eventId } = context.params;
  const rawJWT = await getToken({ req, raw: true });
  const body = await req.text();

  const upstream = await fetch(`${API_BASE}/uploads/${eventId}/media`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
    },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(
  _req: NextRequest,
  context: { params: Params }
) {
  const { eventId } = context.params;

  const upstream = await fetch(`${API_BASE}/uploads/${eventId}/media`, {
    method: "GET",
    cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

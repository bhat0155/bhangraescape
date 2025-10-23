import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function POST(req: NextRequest, {params}: {params: {id: string}}){
    // read the jwt from browser
    const rawJWT = await getToken({req, raw: true});
    const payload = await req.json();

    // forward the request to express
    const upstream = await fetch(`${API_BASE}/events/${params.id}/availability`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
    },
    body: JSON.stringify(payload)
  });

  // read the response back from server
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json"}
  })
}
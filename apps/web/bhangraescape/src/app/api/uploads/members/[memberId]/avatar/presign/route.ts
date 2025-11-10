import { NextResponse, NextRequest } from "next/server";
import { getRawAuthToken } from "@/lib/auth";

const API_BASE = process.env.API_INTERNAL_BASE_URL!;

type Params = { memberId: string };

export async function POST(
  req: NextRequest,
  context: { params: Params }
) {
  const { memberId } = context.params;
  const token = await getRawAuthToken(req);
  const payload = await req.json();

  const upstream = await fetch(`${API_BASE}/uploads/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ...payload, prefix: "avatars", subjectId: memberId }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: text || "presign error" },
      { status: upstream.status }
    );
  }

  const json = await upstream.json();
  return NextResponse.json(json, { status: 200 });
}

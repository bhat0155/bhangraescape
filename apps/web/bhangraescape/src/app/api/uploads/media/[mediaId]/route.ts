import { NextRequest, NextResponse } from "next/server";
import { getRawAuthToken } from "@/lib/auth";

const API_BASE = process.env.API_INTERNAL_BASE_URL!;

type Params = { mediaId: string };

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { mediaId } = await context.params;
  const rawJWT = await getRawAuthToken(req);

  const upstream = await fetch(`${API_BASE}/uploads/media/${mediaId}`, {
    method: "DELETE",
    headers: {
      ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
    },
    cache: "no-store",
  });

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

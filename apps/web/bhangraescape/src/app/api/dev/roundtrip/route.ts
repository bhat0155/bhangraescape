// apps/web/bhangraescape/src/app/api/dev/roundtrip/route.ts
import { NextResponse } from "next/server";
import { getRawAuthToken } from "@/lib/auth";

const getBackendBase = () =>
  process.env.API_INTERNAL_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: Request) {
  // 1) Extract JWT from the Auth.js cookie
  const token = await getRawAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const backendBase = getBackendBase();
  if (!backendBase) {
    return NextResponse.json(
      {
        error: "Missing API_INTERNAL_BASE_URL (or NEXT_PUBLIC_API_BASE_URL)",
        detail: "Set the env var so we know where to send the debug roundtrip.",
      },
      { status: 500 },
    );
  }

  // 2) Forward the token to your backend
  const backendUrl = `${backendBase.replace(/\/$/, "")}/auth/debug`;
  let res: Response;
  try {
    res = await fetch(backendUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Network error", detail, backendUrl },
      { status: 502 },
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  let body: unknown = null;
  if (contentType.includes("application/json")) {
    body = await res.json().catch((e) => ({
      parseError: e instanceof Error ? e.message : String(e),
    }));
  } else {
    body = await res.text();
  }

  // 3) Return backend response to the browser
  return NextResponse.json({
    sentBearer: true,
    backendUrl,
    backendStatus: res.status,
    backendBody: body,
  });
}

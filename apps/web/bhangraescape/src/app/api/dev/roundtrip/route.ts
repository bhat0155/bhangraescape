// apps/web/bhangraescape/src/app/api/dev/roundtrip/route.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  // 1) Extract JWT from the Auth.js cookie
  const token = await getToken({ req, raw: true });
  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // 2) Forward the token to your backend
  const backendUrl = "http://localhost:4000/api/auth/debug"; // Express route
  let res;
  try {
    res = await fetch(backendUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Network error", detail: String(err) }, { status: 502 });
  }

  // 3) Return backend response to the browser
  try {
    const body = await res.json();
    return NextResponse.json({
      sentBearer: true,
      backendStatus: res.status,
      backendBody: body,
    });
  } catch {
    return NextResponse.json({
      sentBearer: true,
      backendStatus: res.status,
      backendBody: "(no JSON body)",
    });
  }
}
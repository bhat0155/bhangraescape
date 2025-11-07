import { NextRequest, NextResponse} from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/app/api/auth/[...nextauth]/route"; 


// helper to build express URL
const API_BASE = process.env.API_INTERNAL_BASE_URL!;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const rawJWT = await getToken({ req, raw: true });

    try {
        const upstream = await fetch(`${API_BASE}/events/${params.id}`, {
            method: "GET",
            headers: {
                ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
            },
            cache: "no-store"
        });

        const text = await upstream.text();

        // 💡 CRITICAL DEBUG STEP: Log the 500 error content
        if (!upstream.ok) {
            console.error(
                `[API Proxy Error] GET /events/${params.id} failed with status ${upstream.status}`,
                `Response body: ${text.substring(0, 500)}` // Log up to 500 chars of the body
            );
        }

        // Stream server's response back to frontend
        return new NextResponse(text, {
            status: upstream.status,
            headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
        });

    } catch (error) {
        // This catches network errors (e.g., API is completely down/unreachable)
        console.error("[Proxy Network Error] Could not connect to upstream API:", error);
        return NextResponse.json({ error: "Upstream API connection failed" }, { status: 502 });
    }
}

export async function POST(req: NextRequest){
    try{
        const session = await auth();
    const role = (session?.user as any)?.role ?? "GUEST";

    if(role !== "ADMIN"){
        return NextResponse.json({error : "Forbidden", status: 403})
    }
    const body = await req.json();
    const resp = await fetch(`${API_BASE}/events`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    })

    // stream the response back as is
    const text = await resp.text();
   try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: resp.status });
    } catch {
      // If API didn’t return JSON, return raw text
      return new NextResponse(text, {
        status: resp.status,
        headers: { "Content-Type": resp.headers.get("content-type") ?? "text/plain" },
      });
    }
    }catch(err){
        console.error("[/api/events] proxy error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, {params}: {params: {id: string}}){
  const rawJWT = await getToken({ req, raw: true });
  const body = await req.json();

  const upstream = await fetch(`${API_BASE}/events/${params.id}`, {
    method: "PATCH",
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

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }>}){
  const {id} = await context.params;
  const rawJWT = await getToken({ req, raw: true });

  const upstream = await fetch(`${API_BASE}/events/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
    },
  });

  if(!upstream.ok){
  const text = await upstream.text();
 return NextResponse.json({ error: text || "Delete failed" }, { status: upstream.status });
  }

  return NextResponse.json({status: "deleted"}, {status: 200})
}


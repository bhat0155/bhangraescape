import { NextRequest, NextResponse} from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/app/api/auth/[...nextauth]/route"; 


// helper to build express URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function GET(req: NextRequest, {params}: {params: {id:string}}){
    // 1. Read the nextAuth token from current request
    // 2. raw: true gives signed jwt string
    const rawJWT = await getToken({req, raw: true});

    // pass the request to express with authorisation
    const upstream = await fetch(`${API_BASE}/events/${params.id}`, {
        method: "GET",
        headers: {
      ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
        },
        cache: "no-store"
    })

    // stream server's response back to frontend
    const text = await upstream.text();
    return new NextResponse(text, {
        status: upstream.status,
        headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    })
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
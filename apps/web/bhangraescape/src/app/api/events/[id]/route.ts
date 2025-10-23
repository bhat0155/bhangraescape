import { NextRequest, NextResponse} from "next/server";
import { getToken } from "next-auth/jwt";

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
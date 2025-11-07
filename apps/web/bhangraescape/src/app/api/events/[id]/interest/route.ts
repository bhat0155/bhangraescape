import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE = process.env.API_INTERNAL_BASE_URL!;

export async function POST(req: NextRequest,  context: { params: Promise<{ id: string }>}){
    const {id} = await context.params;
    const rawJWT = await getToken({req, raw: true})
    const body =await req.text()

    const upstream = await fetch(`${API_BASE}/events/${id}/interest`,{
         method: "POST",
          headers: {
            "content-type": "application/json",
            ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
            },
            body
    })

    const contentType = upstream.headers.get("content-type") ?? "";
    const text = await upstream.text();
    const bodyResponse = upstream.status === 204 || !contentType.includes("application/json") ? null : text;

    return new NextResponse(bodyResponse, {
        status: upstream.status,
        headers: { "content-type": contentType || "application/json" }
    })
}
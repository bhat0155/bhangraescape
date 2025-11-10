import { NextRequest } from "next/server";
import { getRawAuthToken } from "@/lib/auth";

const API_BASE = process.env.API_INTERNAL_BASE_URL;


export async function GET(req: NextRequest, context: { params: Promise<{ id: string }>}){
    const id = await context.params
    const rawJWT = await getRawAuthToken(req);

    const upstream = await fetch(`${API_BASE}/events/${id}/performers`, {
        method: "GET",
        headers: {
      ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
             },
        cache: "no-store",
    })

    const text = await upstream.text();
    return new Response(text, {
        status: upstream.status,
        headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
        }
    })
}

export async function PUT(req: NextRequest, {params}: {params: {id: string}}){
    // body is {[userId1, userId2]}
    const body = await req.text();
    const rawJWT = await getRawAuthToken(req);

    const upstream = await fetch(`${API_BASE}/events/${params.id}/performers`,{
        method: "PUT",
        headers: {
             "content-type": "application/json",
      ...(rawJWT ? { Authorization: `Bearer ${rawJWT}` } : {}),
        },
        body
    })

    const text = await upstream.text();
    return new Response(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
    })
}

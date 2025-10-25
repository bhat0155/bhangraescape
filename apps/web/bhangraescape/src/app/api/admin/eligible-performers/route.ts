// get all the eligible performers from backend server

import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: NextRequest){
    // read the jwt from this request
    const rawJWT = await getToken({req, raw: true});

    const upstream = await fetch(`${API_BASE}/admin/eligible-performers`, {
        method: "GET",
        headers: {
            ...(rawJWT ? {Authorization: `Bearer ${rawJWT}`}: {})
        },
        cache: "no-store"
    })

    const text = await upstream.text();
    return new NextResponse(text, {
        status: upstream.status,
        headers: {"content-type": upstream.headers.get("content-type") ?? "application/json",}
    })
}
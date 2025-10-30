import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

const BASE_API = process.env.NEXT_PUBLIC_API_BASE_URL!

export async function POST(req: NextRequest, {params}: {params: {memberid: string}}){
    const body = await req.json();
    const token = getToken({req, raw: true});

    const upstream = await fetch(`${BASE_API}/uploads/${params.memberid}/presign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({...body, prefix: "avatars"}),
        cache: "no-store"
    })

    if(!upstream.ok){
        const text = await upstream.text();
        return NextResponse.json({Error: text || "presign error"}, {status: upstream.status})
    }

    const json = await upstream.json();
     return NextResponse.json(json, {status: 200});
}
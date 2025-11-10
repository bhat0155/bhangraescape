import { NextRequest, NextResponse } from "next/server";
import { getRawAuthToken } from "@/lib/auth";

const BASE_API = process.env.API_INTERNAL_BASE_URL!

export async function POST(req: NextRequest){
    const body = await req.json();
    const token = await getRawAuthToken(req);

    const upstream = await fetch(`${BASE_API}/contactus`, {
        method: "POST",
       headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`}: {})
        },
        body: JSON.stringify(body),
        cache: "no-store"
    })

    if(!upstream.ok){
        const text = await upstream.text().catch(()=>"");
        return NextResponse.json(
            { error: text || "Could not send contact info" },
            { status: upstream.status },
        );
    }

    const json = await upstream.json();
    return NextResponse.json(json, { status: 202 });

}

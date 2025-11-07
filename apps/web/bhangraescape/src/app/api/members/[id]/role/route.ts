
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const BASE_API = process.env.API_INTERNAL_BASE_URL!

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }>}){
    const {id} = await context.params
    const body = await req.json();
    const raw = await getToken({req, raw: true})

    const upstream = await fetch(`${BASE_API}/members/${id}/role`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(raw ? {Authorization: `Bearer ${raw}`}: {})
        },
        body: JSON.stringify(body),
        cache: "no-store"
    })

   if (!upstream.ok) {
  const text = await upstream.text().catch(() => "");
  return NextResponse.json(
    { error: text || "error in upstream" },
    { status: upstream.status },
  );
}

    const json = await upstream.json();
    return NextResponse.json(json)
}
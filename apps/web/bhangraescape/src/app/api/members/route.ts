import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

// public get
export async function GET(){
    const res = await fetch(`${API_BASE}/members`, {cache: "no-store"});

    if(!res.ok){
        const text = await res.text().catch((err)=> console.log(err));
        return NextResponse.json({
            error: `Upstream failed: ${res.status} ${res.statusText}`, detail: text
        }, {status: 500})
    }

    const data = await res.json();
    return NextResponse.json({data, status: 200})
}

// post

export async function POST(req: NextRequest){
    const token = await getToken({req, raw: true});
    const body = await req.json();

    const upstream = await fetch(`${API_BASE}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const t = await upstream.text().catch(() => "");
    return NextResponse.json({ error: t || "Upstream error" }, { status: upstream.status });
  }

  const json = await upstream.json();
  return NextResponse.json(json, { status: 201 });
}
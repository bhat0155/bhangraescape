import { NextResponse } from "next/server";

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


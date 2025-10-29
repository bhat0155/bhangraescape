// public get one

import { NextResponse } from "next/server";

const BASE_API = process.env.NEXT_PUBLIC_API_BASE_URL!; 

export async function GET({params}:{params: {id: string}}){

    const upstream = await fetch(`${BASE_API}/members/${params.id}`, {
        cache: "no-store"
    })

    if(upstream.status === 404){
        return NextResponse.json({error: "not found", status: 404})
    }

    if(!upstream.ok){
        const text = await upstream.text();
        return NextResponse.json({error: text || "upstream Error"},{ status: upstream.status})
    }

    const json = await upstream.json()
    return NextResponse.json(json, {status: 200})
}
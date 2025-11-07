// public get one

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const BASE_API = process.env.API_INTERNAL_BASE_URL!

export async function GET(_req: NextRequest, {params}:{params: {id: string}}){

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

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }>}){
    const {id}=await context.params
    const body = await req.json();
    const raw = await getToken({req, raw: true})

    const upstream = await fetch(`${BASE_API}/members/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(raw ? {Authorization: `Bearer ${raw}`}: {})
        },
        body: JSON.stringify(body),
        cache: "no-store"
    })

    if(!upstream.ok){
        const text = await upstream.text();
        return NextResponse.json({error: text || "error in upstream"}, {status: upstream.status})
    }

    const json = await upstream.json();
    return NextResponse.json(json, {status: 200})
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }>}){
    const {id}=await context.params
    const token = await getToken({req, raw: true})

    const upstream = await fetch(`${BASE_API}/members/${id}`,{
        method: "DELETE",
         headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`}: {})
        },
        cache: "no-store"
    })

    if(!upstream.ok){
         const text = await upstream.text();
        return NextResponse.json({error: text || "error in upstream"}, {status: upstream.status})
    }
    if(upstream.status == 204){
        return new NextResponse(null, { status: 204 });
    }

    const json = await upstream.json();
    return NextResponse.json(json, {status: 200})
}
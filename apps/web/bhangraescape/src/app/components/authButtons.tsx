"use client";

import { useSession, signIn, signOut } from "next-auth/react";


export default function AuthButtons(){
    const {data: session, status}= useSession();

    if (status == "loading") return <span>Loading</span>;

    if(!session){
        return (
            <button className="px-3 py-2 rounded bg-black text-white" onClick={()=>signIn("google")}>Sign in with google</button>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm">
                Hi, {session.user?.name}, your email is {session.user?.email} and id is {session.user?.id} and role is {session.user?.role}
            </span>
            <button
        className="px-3 py-2 rounded border"
        onClick={() => signOut()}
      >
        Sign out
      </button>
        </div>
    )

    

}
"use client"
import React from 'react';
import {useState, useEffect} from 'react';

export default function EventsCheckPage(){
    const [status, setStatus] = useState<"idle"|"ok"|"error">("idle");
    const [message, setMessage] = useState<string>("");

    useEffect(()=>{
        const API_BASE  = process.env.NEXT_PUBLIC_API_BASE_URL;
        if(!API_BASE){
            setStatus("error");
            setMessage("API base URL is not defined");
            return;
        }

        fetch(`${API_BASE}/events`, {
            method: "GET",
            credentials: "include",
            headers: {
                "content-type": "application/json"
            }
        })
        .then(async(res)=>{
            if(!res.ok) throw new Error(`HTTP: ${res.status}`);
            const json = await res.json();
            setStatus("ok");
            setMessage(`Fetched ${Array.isArray(json.items)? json.items.length : 0} events`);
            console.log("Events:", json);
        })
        .catch((err)=>{
            setStatus("error");
            setMessage(`Error fetching events: ${err.message}`);
            console.log("Error fetching events:", err);
        })
    },[])

    return(
        <div>
            <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Dev Check — Events</h1>
      <p>Status: <strong>{status}</strong></p>
      <p>Message: {message}</p>
      <p className="opacity-70">
        Open DevTools → Network tab to confirm: request goes to <code>{process.env.NEXT_PUBLIC_API_BASE}/events</code> and returns <code>200 OK</code>.
      </p>
    </div>
        </div>
    )
}
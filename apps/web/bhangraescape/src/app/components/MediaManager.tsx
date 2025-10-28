"use client"
import { useState } from "react";
import MediaGrid from "./MediaGrid";
import type { MediaItem } from "../types/media";

type Props = {
    eventId: string,
    role: string,
    initialMedia: MediaItem[]
}

type Role = "GUEST" | "MEMBER" | "ADMIN";


export default function MediaManager({eventId, role, initialMedia}: Props){
    // media state variable
    const [media, setMedia] = useState<MediaItem[]>(initialMedia);
    const isAdmin = role === "ADMIN";


    return(
        <section className="space-y-3">
            <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Videos and Photos</h2>
                {/* Placeholder for upload button */}
                <button
                type="button"
                disabled={!isAdmin}
                title= "Add media"
                className={`btn btn-sm ${isAdmin ? "btn-primary" : "btn-disabled"}`}
                >+ Add</button>
            </header>
            <MediaGrid items={media}></MediaGrid>
        </section>
    )
}
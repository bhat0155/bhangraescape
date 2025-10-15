import { prisma } from "../lib/prisma";
import { createPlaylistBody, createPlaylistBodyType, patchPlaylistBodyAndParams, patchPlaylistBodyAndParamsType } from "../schemas/playlist.schema";
import { Prisma } from "@prisma/client"; 

const selectCard = {
    id: true,
    eventId: true,
    provider: true,
    title: true,
    artist: true,
    url: true,
    createdAt: true
} as const;

export const playlistService = {
    // list playlist items by event
    async listByEvent(eventId: string){
        return await prisma.playlistItem.findMany({
            where: {eventId},
            select: selectCard,
            orderBy: {createdAt: "desc"}
        })
    },

    async create(eventId: string, body: createPlaylistBodyType){
         const {title, artist, url, provider} = body;

        return await prisma.playlistItem.create({
            data: {
                eventId,
                title,
                artist,
                url,
                provider
            },
            select: selectCard
        })
    },


    async patch(playlistId: string, partial: patchPlaylistBodyAndParamsType){
        const dataToUpdate = partial as Prisma.PlaylistItemUpdateInput;
        try{
            return await prisma.playlistItem.update({
                where: {id: playlistId},
                data: {...dataToUpdate},
                select: selectCard
                
            })
        }catch(err: any){
            if (err.code === "P2025"){
                const e: any = new Error("Playlist item not found");
                e.status = 404;
                throw e;
            }
            throw err;
        }
    },

    async delete(playlistId: string){
        try{
            await prisma.playlistItem.delete({
                where: {id: playlistId}
            })
             return {ok: true, deletedId: playlistId}
        }catch(err: any){
            if(err.code === "P2025"){
                const e: any = new Error("Playlist item not found");
                e.status = 404;
                throw e;
            }
            throw err;
        }
    }
}
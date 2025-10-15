
import { prisma } from "../lib/prisma";
import type { setFinalMixBodyType } from "../schemas/finalmix.schemas";


const selectFinalMix = {
    id: true,
    finalPlaylistProvider: true,
    finalPlaylistUrl: true
} as const;

export const finalMixService = {
     async set(eventId: string, body: setFinalMixBodyType) {
    try {
      return await prisma.event.update({
        where: { id: eventId },
        data: {
          finalPlaylistProvider: body.provider,
          finalPlaylistUrl: body.url,
        },
        select: selectFinalMix,
      });
    } catch (e: any) {
      if (e?.code === "P2025") {
        const err: any = new Error("Event not found");
        err.status = 404;
        throw err;
      }
      throw e;
    }
  },

  async get(eventId: string){
    try{    
        return await prisma.event.findUnique({
            where: {id: eventId},
            select: selectFinalMix
        })
        
    }catch(err: any){
       if (err?.code === "P2025") {
        const err: any = new Error("Event not found");
        err.status = 404;
        throw err; 
    }
    throw err;
}
  },

  async clear(eventId: string){
    try{
         await prisma.event.update({
            where: {id: eventId},
            data: {
                finalPlaylistProvider: null,
                finalPlaylistUrl: null
            },
        })
        return {ok: true}
    }catch(err: any){   
 if (err?.code === "P2025") {
        const err: any = new Error("Event not found");
        err.status = 404;
        throw err; 
    }
    throw err;
}
  }
}
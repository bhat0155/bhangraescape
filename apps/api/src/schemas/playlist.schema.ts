import {z} from 'zod';

// list by event
export const listPlaylistParams = z.object({
    params: z.object({
        eventId: z.string().min(1)
    })
})

// create playlist item
export const createPlaylistBody = z.object({
    params: z.object({
        eventId: z.string().min(1)
    }),
    body: z.object({
        title: z.string().trim().min(1).max(200),
        artist: z.string().trim().min(1).max(200),
        url: z.string().url().max(1000),
        provider: z.enum(["YOUTUBE", "SOUNDCLOUD", "SPOTIFY", "EXTERNAL"]).default("EXTERNAL")
    })
})

// patch playlist item
export const patchPlaylistBodyAndParams = z.object({
    params: z.object({
        playlistId: z.string().min(1)
    }),
    body: z.object({
        title: z.string().trim().min(1).max(200).optional(),
        artist: z.string().trim().min(1).max(200).optional(),
        url: z.string().url().max(1000).optional(),
                provider: z.enum(["YOUTUBE", "SOUNDCLOUD", "SPOTIFY", "EXTERNAL"]).optional()


    })
}).refine(
    (val) => Object.keys(val.body).length > 0, 
    { 
        message: "Provide at least one field to update (title, artist, url, or provider).",
        path: ["body"], 
    }
);

// delete playlist item
export const deletePlaylistParams = z.object({
    params: z.object({
        playlistId: z.string().min(1)
    })
})

export type createPlaylistBodyType = z.infer<typeof createPlaylistBody>["body"]
export type patchPlaylistBodyAndParamsType = z.infer<typeof patchPlaylistBodyAndParams>["body"]
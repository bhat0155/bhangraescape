import {z} from "zod";

export const eventIdParamFinalMix = z.object({
    params: z.object({
        eventId: z.string().min(1)
    })
})

export const setFinalMixBody = z.object({
    params: z.object({
        eventId: z.string().min(1)
    }),
    body: z.object({
    provider: z.enum(["EXTERNAL", "SOUNDCLOUD"]), 
    url: z.string().url().max(500)
    })
})

export type eventIdParamType = z.infer<typeof eventIdParamFinalMix>["params"];
export type setFinalMixBodyType = z.infer<typeof setFinalMixBody>["body"];
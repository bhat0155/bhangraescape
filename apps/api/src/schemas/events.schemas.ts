import {z} from 'zod';

export const createEventBody = z.object({
    body: z.object({
        title: z.string().min(1).max(120),
        description: z.string().min(1).max(400),
        date: z.string().date(),
    })
})

export const eventIdParam = z.object({
    params: z.object({
        eventId: z.string().min(1)
    })
})
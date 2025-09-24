import {z} from 'zod';

export const submitContactBody = z.object({
    body: z.object({
        name: z.string().trim().min(1).max(100),
        email: z.string().trim().email(),
        message: z.string().trim().min(1).max(2000)
    })
})
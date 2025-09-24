import {z} from 'zod';


export const submitJoinBody = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(2000).optional(),  
  }),
});

export const listJoinRequestQuery = z.object({
    query: z.object({
        status: z.enum(["PENDING", "APPROVED", "REJECTED"])
    }).optional()
})

export const reviewJoinParams = z.object({
    params: z.object({
        id: z.string().min(1)
    })
})

export const reviewJoinBody = z.object({
    body: z.object({
        action: z.enum(["APPROVE", "REJECT"])
    })
})
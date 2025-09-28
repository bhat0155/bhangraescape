import {z} from 'zod';


export const submitJoinBody = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(2000).optional(),  
  }),
});

export const joinTeamIdParam = z.object({
    id: z.string().min(1, "id is required")
})


export const reviewJoinBody = z.object({

        action: z.enum(["APPROVED", "REJECTED"])

})

export const ListPendingJoinRequestsBody = z.object({}); 

export const reviewJoinRequestSchema = z.object({
    // 'params' property expects the ID from the route path (e.g., /:id)
    params: joinTeamIdParam,
    // 'body' property expects the action from the request body
    body: reviewJoinBody
});

export type SubmitJoinBodyType = z.infer<typeof submitJoinBody>
export type JoinTeamIdParamType = z.infer<typeof joinTeamIdParam>
export type ReviewJoinBodyType = z.infer<typeof reviewJoinBody>
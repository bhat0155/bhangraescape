import {z} from 'zod';

// GET /api/members?search=abc
export const listMembersQuery = z.object({
    query: z.object({
        search: z.string().min(1).max(100).optional()
    })
})

// GET /api/members/:memberId
export const memberIdParam = z.object({
    params: z.object({
        memberId: z.string().min(1)
    })
})

// POST /api/members
export const createMemberBody = z.object({
    body: z.object({
        name: z.string().min(1).max(100),
        avatarUrl: z.string().url(),
        description: z.string().min(1).max(2000),
        email: z.string().email()
    })
})

// PATCH /api/members/:memberId

export const patchMemberBodyAndParams = z.object({
    params: z.object({
        memberId: z.string().min(1)
    }),
    body: z.object({
        name: z.string().trim().min(1).max(100).optional(),
        avatarUrl: z.string().url().optional(),
        description: z.string().trim().min(1).max(2000).optional()
    })
}).refine((val)=>{
    const b = val.body;
    return !!(b.name||b.avatarUrl||b.description)
},{message: "Provide at least one field to update (name, avatarUrl, description)."})


// /api/members/:memberId/role
export const updateRoleBodyAndParams = z.object({
    params: z.object({
        id: z.string().min(1)
    }),
    body: z.object({
        role: z.enum(["ADMIN", "MEMBER", "GUEST"])
    })
    
})

export type listMemeberQueryInput = z.infer<typeof listMembersQuery>;
export type memberIdParamInput = z.infer<typeof memberIdParam>;
export type createMemberBodyInput = z.infer<typeof createMemberBody>;
export type createMemberBodyType = z.infer<typeof createMemberBody>
export type updateRoleAndBodyType = z.infer<typeof updateRoleBodyAndParams>

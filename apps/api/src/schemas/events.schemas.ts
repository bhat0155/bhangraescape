import {z} from 'zod';

export const createEventBody = z.object({
    body: z.object({
        title: z.string().min(1).max(120),
        location: z.string().min(1).max(400),
        date: z.coerce.date()
    })
})

// patch event
// refines make sure atleast one thing is updated inside body
export const patchEventBodyAndParams = z.object({
    params: z.object({
    eventId: z.string().min(1),
  }),
    body: z.object({
        title: z.string().trim().min(1).max(100).optional(),
        location: z.string().trim().min(1).max(160).optional(),
        date: z.coerce.date().optional()
    })
}).refine((val)=>{
    const b = val.body;
    return !!(b.title || b.location || b.date)
},{
      message: "Provide at least one field to update (title, location, or date)." 
})

// delete event
// DELETE /api/events/:eventId
export const deleteEventParams = z.object({
  params: z.object({
    eventId: z.string().min(1),
  }),
});

export const eventIdParam = z.object({
    params: z.object({
        eventId: z.string().min(1)
    })
})

export const getEventParams = z.object({
    params: z.object({
        eventId: z.string().min(1)
    })
})

export const toggleInterestSchema = z.object({
  params: z.object({ eventId: z.string().min(1) }),
  body:   z.object({ interested: z.boolean() }),
});

export const getAvailabilityParams = z.object({
    params: z.object({
        eventId: z.string().min(1)
    })
});

export const setAvailabilityParams = z.object({
    params: z.object({
        eventId: z.string().min(1)
    }),
    body: z.object({
        days: z.array(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])).min(1).max(7)
    })
})

export type getEventParamsInput = z.infer<typeof getEventParams>;
export type toggleInterestInput = z.infer<typeof toggleInterestSchema>;

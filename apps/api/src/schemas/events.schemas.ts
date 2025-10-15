import path from 'path';
import {file, z} from 'zod';

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

export const listEventQuery = z.object({
    query: z.object({
        status: z.enum(["all", "upcoming", "past"]).optional().default("all"),
        search: z.string().trim().max(120).optional()
    })
})

// uploading to s3
export const presignMediaBody = z.object({
    params: z.object({
        eventId: z.string().min(1)
    }),
    body: z.object({
        prefix: z.enum(["avatars", "events"]),
        contentType: z.string().min(1),
        ext: z.string().regex(/^[a-z0-9.]+$/i).optional(), // jpg, png, mp4...
    })
})

export const presignAvatarBody = z.object({
  body: z.object({
    contentType: z.string().min(1),           // e.g. image/jpeg
    ext: z.string().regex(/^[a-z0-9.]+$/i).optional(), // jpg, png...
  }),
});

export const registerEventMediaBody = z.object({
    params: z.object({
        eventId: z.string().min(1)
    }),
    body: z.object({
        fileKey: z.string().min(1),
        type: z.enum(["IMAGE","VIDEO"]),
        title: z.string().trim().min(1).optional().nullable()
    })
})

export const patchMediaBodyAndParams = z
  .object({
    params: z.object({ mediaId: z.string().min(1) }),
    body: z.object({
      title: z.string().trim().min(1).max(120).optional(),
      type: z.enum(["IMAGE", "VIDEO"]).optional(),
    }),
  })
  .refine(
    (val) => val.body.title !== undefined || val.body.type !== undefined,
    { message: "Provide at least one field to update (title or type).", path: ["body"] },
  );


export type getEventParamsInput = z.infer<typeof getEventParams>;
export type toggleInterestInput = z.infer<typeof toggleInterestSchema>;
export type listEventQueryType = z.infer<typeof listEventQuery>["query"];
export type PresignEventMediaBody = z.infer<typeof presignMediaBody>
export type RegisterEventMediaBody = z.infer<typeof registerEventMediaBody>

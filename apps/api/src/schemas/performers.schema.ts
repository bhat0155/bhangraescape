import { z } from "zod";

export const setPerformersParamsAndBody = z.object({
  params: z.object({
    eventId: z.string().min(1, "eventId is required"),
  }),
  body: z.object({
    userIds: z.array(z.string().min(1)).optional().default([]),
  }),
});

export type SetPerformersParamsAndBodyInput = z.infer<typeof setPerformersParamsAndBody>;
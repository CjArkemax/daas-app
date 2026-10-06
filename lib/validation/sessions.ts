import {z} from "zod";

export const saveFocusSessionSchema = z.object({
    clientSessionId: z.uuid(),
    projectId: z.uuid(),
    taskId: z.uuid(),
    sessionType: z.enum(['focus','short_break','long_break']).default("focus"),
    status: z.enum(['completed','cancelled']).default("completed"),
    startedAt: z.iso.datetime(),
    endedAt: z.iso.datetime(),
    plannedSeconds: z.int().positive().max(86400),
    note: z.string().trim().max(500).optional()
})

export type SaveFocusSessionInput = z.infer<typeof saveFocusSessionSchema>
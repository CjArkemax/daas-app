import {z} from "zod";

export const createTaskSchema = z.object({
    projectId: z.uuid(),
    title: z.string().trim().min(1).max(120),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const completeTaskSchema = z.object({
    taskId: z.uuid(),
})
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>
"use server"
import { db } from "@/db";
import { focusSessions, tasks } from "@/db/schema";
import { requireUser } from "@/lib/auth/requireUser";
import { type SaveFocusSessionInput, saveFocusSessionSchema } from "@/lib/validation/sessions";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";



export async function saveFocusSession(input: SaveFocusSessionInput): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const user = await requireUser();
  
  const parsed = saveFocusSessionSchema.safeParse(input);

  if(!parsed.success){
    return{success:false, error:parsed.error.issues[0].message}
  }

  const[task] = await db
  .select({id: tasks.id, projectId:tasks.projectId})
  .from(tasks)
  .where(and(
    eq(tasks.id, parsed.data.taskId),
    eq(tasks.userId, user.id)
  ))
    .limit(1);

    if(!task){
        return {success: false, error: 'Task not found'}
    }
    if(task.projectId !== parsed.data.projectId){
        return {success: false, error: 'Project mismatch'}
    }

    const [inserted] = await db
    .insert(focusSessions)
    .values({
      ...parsed.data,
      userId: user.id,
      startedAt: new Date(parsed.data.startedAt),
      endedAt: new Date(parsed.data.endedAt),
      note: parsed.data.note ?? null,
    })
    .onConflictDoNothing({ target: focusSessions.clientSessionId })
    .returning({ id: focusSessions.id });

    revalidatePath('/dashboard');
    
    if (!inserted) {
    const [existing] = await db
    .select({ id: focusSessions.id })
    .from(focusSessions)
    .where(eq(focusSessions.clientSessionId, parsed.data.clientSessionId))
    .limit(1);

        if (!existing) {
        return { success: false, error: "Conflict resolution failed" };
    }
    return { success: true, id: existing.id };
   }
    return { success: true, id: inserted.id };
}
"use server";

import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { requireUser } from "@/lib/auth/requireUser";
import { completeTaskSchema, createTaskSchema } from "@/lib/validation/tasks";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";


type ActionState = {
    success: boolean;
    error: string | null;
};

export async function createTask(_prevState:unknown ,formData:FormData):Promise<ActionState>{
    const user = await requireUser()
    const raw ={
        projectId:formData.get('projectId'),
        title: formData.get('title')
    }
    const parsed = createTaskSchema.safeParse(raw)

    if(!parsed.success){
        return{success:false,error:parsed.error.issues[0].message}
    }
    //ownership check: if the task inserting in the same project belongs to the same user
    //used only project id for less latency
    const [project] = await db.select({ id: projects.id })
        .from(projects)
        .where(and(
            eq(projects.userId, user.id),
            eq(projects.id, parsed.data.projectId),
        )).limit(1);

        if(!project){
            return{success:false, error: 'project not found'}
        }

    //insert (project id ,user id, title) in  tasks table
   await db.insert(tasks)
    .values({
        projectId: parsed.data.projectId,
        userId: user.id,
        title: parsed.data.title,
    })

    //
    revalidatePath(`/projects/${parsed.data.projectId}`)

    return{success:true, error:null}
}

export async function completeTask(formData: FormData): Promise<void> {
  const user = await requireUser();

  const raw = { 
    taskId: formData.get('taskId')
 };
  const parsed = completeTaskSchema.safeParse(raw);
  if (!parsed.success) return;

  const [completedTask] = await db
    .update(tasks)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(and(
      eq(tasks.id, parsed.data.taskId),
      eq(tasks.userId, user.id),
    ))
    .returning({
      id: tasks.id,
      projectId: tasks.projectId,
    });

  if (!completedTask) return;

  revalidatePath(`/projects/${completedTask.projectId}`);
}
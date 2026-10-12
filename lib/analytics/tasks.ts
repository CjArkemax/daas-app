import { db } from "@/db";
import { tasks } from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";


export async function listTasksForProject(userId: string, projectId: string){
  return db
  .select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      eq(tasks.projectId, projectId),
      inArray(tasks.status, ['pending', 'completed']),
    ))
    .orderBy(
      sql`CASE WHEN ${tasks.status} = 'pending' THEN 0 ELSE 1 END`,
      desc(tasks.createdAt)
    )
}
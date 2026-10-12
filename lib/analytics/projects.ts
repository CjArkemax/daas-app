import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";


export async function listProjectsForUser(userId: string){// gives all project 
    return db
    .select()
    .from(projects)
    .where(and(
        eq(projects.userId, userId),
        eq(projects.status, 'active'),
    ))
    .orderBy(asc(projects.createdAt));
}

export async function getProjectById(userId: string, projectId:string){ // specific project only

    const result = await db
    .select()
    .from(projects)
    .where(and(
        eq(projects.userId, userId),
        eq(projects.id, projectId),
        eq(projects.status, 'active'),
    ))
    .limit(1);

    return result[0];
}   

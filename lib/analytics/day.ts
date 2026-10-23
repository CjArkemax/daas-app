import { db } from "@/db";
import { focusSessionsAnalytics, profiles, projects, tasks } from "@/db/schema";
import { TZDate } from "@date-fns/tz";
import { startOfDay, addDays } from "date-fns";
import { and, eq, gte, lt, sql } from "drizzle-orm";


export async function getUserTimezone(userId: string): Promise<string> {
  const [profile] = await db
    .select({ timezone: profiles.timezone })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  
  return profile?.timezone ?? 'UTC';
}

export function getDayBounds(timezone: string) {
  const now = new TZDate(Date.now(), timezone);// 2026-04-23 21:00:00.000 + Asia/Kolkata
  const startLocal = startOfDay(now);// 2026-04-23 00:00:00.000 + Asia/Kolkata // start of the day
  const endLocal = addDays(startLocal, 1); //// 2026-04-24 00:00:00.000 + Asia/Kolkata // end of the day

  return {
    start: new Date(startLocal.getTime()), //start: 2026-04-22T18:30:00.000Z (UTC equivalent of April 23, 00:00:00 IST)
    end: new Date(endLocal.getTime()),     //end: 2026-04-23T18:30:00.000Z (UTC equivalent of April 24, 00:00:00 IST)
  };
}


export async function getTodayTotalFocusedSeconds(userId: string, timezone: string){
    const {start, end} = getDayBounds(timezone);
    const [row] = await db
    .select({total: sql<number>`COALESCE(SUM(${focusSessionsAnalytics.actualSeconds}),0)`})
    .from(focusSessionsAnalytics)
    .where(and(
        eq(focusSessionsAnalytics.userId, userId),
        gte(focusSessionsAnalytics.startedAt, start),
        lt(focusSessionsAnalytics.startedAt, end)
    ));
    return Number(row?.total ?? 0);
}

export async function getTodaySessions(userId:string, timezone:string){
    const { start, end } = getDayBounds(timezone);
return db
  .select({
    id: focusSessionsAnalytics.id,
    taskTitle: tasks.title,
    projectName: projects.name,
    startedAt: focusSessionsAnalytics.startedAt,
    endedAt: focusSessionsAnalytics.endedAt,
    actualSeconds: focusSessionsAnalytics.actualSeconds,
  })
  .from(focusSessionsAnalytics)
  .innerJoin(tasks, eq(focusSessionsAnalytics.taskId, tasks.id))
  .innerJoin(projects, eq(focusSessionsAnalytics.projectId, projects.id))
  .where(and(
    eq(focusSessionsAnalytics.userId, userId),
    gte(focusSessionsAnalytics.startedAt, start),
    lt(focusSessionsAnalytics.startedAt, end),
  ))
  .orderBy(focusSessionsAnalytics.startedAt);
}
import { sql } from 'drizzle-orm';
import { unique, pgTable, text, timestamp, uuid, integer, pgEnum, foreignKey, index, pgView } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles',{
    id: uuid("id").primaryKey(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    timezone: text("timezone").notNull().default("UTC"),
    createdAt : timestamp("created_at",{withTimezone: true}).notNull().defaultNow(),
    updatedAt :timestamp("updated_at", {withTimezone:true}).notNull().defaultNow()
});


export const projectStatus = pgEnum("project_status",["active","archived"]);

export const projects =pgTable('projects',{
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => profiles.id,{onDelete: 'cascade'}),
    name: text("name").notNull(),
    description: text("description"),
    status: projectStatus("status").default("active").notNull(),
    createdAt : timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
    updatedAt :timestamp("updated_at", {withTimezone:true}).notNull().defaultNow()
});


export const taskStatus = pgEnum("task_status", ['pending','completed', 'archived']);

export  const tasks = pgTable('tasks',{
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull().references(()=> projects.id,{onDelete: 'cascade'}),
    userId: uuid("user_id").notNull().references(()=> profiles.id,{onDelete: 'cascade'}),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatus("status").default("pending").notNull(),
    createdAt : timestamp("created_at",{withTimezone: true}).notNull().defaultNow(),
    updatedAt :timestamp("updated_at", {withTimezone:true}).notNull().defaultNow(),
    completedAt : timestamp("completed_at", { withTimezone: true }),

},(table) => [
   // INDEX 1: Quick lookups for user tasks by status
    index("tasks_user_id_status_idx").on(table.userId, table.status),
    
    // INDEX 2: Quick lookups for project tasks by status
    index("tasks_project_id_status_idx").on(table.projectId, table.status),
    
    // INDEX 3 / CONSTRAINT: Enforces the composite key pairs 
    unique("project_id_id_unique").on(table.projectId, table.id)
])


export const focusSessionTypeEnum = pgEnum("focus_session_type",['focus','short_break','long_break'])

export const focusSessionStatusEnum = pgEnum("focus_session_status",['completed','cancelled'])

export const focusSessions = pgTable('focus_sessions',{
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(()=> profiles.id,{onDelete: 'cascade'}),
    projectId: uuid("project_id").notNull(),
    taskId: uuid("task_id").notNull(),
    clientSessionId: uuid("client_session_id").notNull().unique(),
    sessionType:focusSessionTypeEnum("session_type").default('focus').notNull(),
    status: focusSessionStatusEnum("status").default('completed').notNull(),
    startedAt: timestamp("started_at",{withTimezone: true}).notNull(),
    endedAt: timestamp("ended_at",{withTimezone: true}).notNull(),
    plannedSeconds: integer("planned_seconds").notNull(),
    actualSeconds: integer("actual_seconds").generatedAlwaysAs(() => sql`(EXTRACT(EPOCH FROM ended_at) - EXTRACT(EPOCH FROM started_at))::integer`),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
},
    (table)=>[foreignKey({
    name: "focus_sessions_project_id_task_id_fkey",
    columns: [table.projectId, table.taskId],
    foreignColumns: [tasks.projectId, tasks.id],
    }).onDelete("restrict"),
    // INDEX 4: Timelines for standard user session history
    index("focus_sessions_user_id_started_at_desc_idx").on(table.userId, table.startedAt.desc()),

    // INDEX 5: PARTIAL INDEX - Optimizes the read analytical path (Rule 7)
    index("focus_sessions_analytics_idx")
        .on(table.userId, table.startedAt)
        .where(sql`session_type = 'focus' AND status = 'completed'`),

    // INDEX 6: Speeds up counting session logs for deletion evaluations
    index("focus_sessions_task_id_idx").on(table.taskId)
]);

export const focusSessionsAnalytics = pgView("focus_sessions_analytics").as((qb) => 
    qb.select()
      .from(focusSessions)
      .where(
        sql`session_type = 'focus' AND status = 'completed'`
      )
);

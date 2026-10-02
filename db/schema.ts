import { sql } from 'drizzle-orm';
import { unique, pgTable, text, timestamp, uuid, integer, foreignKey, index, pgView, check } from 'drizzle-orm/pg-core';

// 1. TypeScript Status Arrays & Types
export const PROJECT_STATUS = ["active", "archived"] as const;
export type ProjectStatus = typeof PROJECT_STATUS[number];

export const TASK_STATUS = ["pending", "completed", "archived"] as const;
export type TaskStatus = typeof TASK_STATUS[number];

export const SESSION_TYPE = ["focus", "short_break", "long_break"] as const;
export type SessionType = typeof SESSION_TYPE[number];

export const SESSION_STATUS = ["completed", "cancelled"] as const;
export type SessionStatus = typeof SESSION_STATUS[number];

// --- TABLES ---

// 1. PROFILES
export const profiles = pgTable('profiles', {
    id: uuid("id").primaryKey(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    timezone: text("timezone").notNull().default("UTC"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// 2. PROJECTS
export const projects = pgTable('projects', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").$type<ProjectStatus>().default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
},(table)=> [
    check("projects_status_check", sql`status IN ('active', 'archived')`)
]);

// 3. TASKS
export const tasks = pgTable('tasks', {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<TaskStatus>().default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
    check("tasks_status_check", sql`status IN ('pending', 'completed', 'archived')`),
    index("tasks_user_id_status_idx").on(table.userId, table.status),
    index("tasks_project_id_status_idx").on(table.projectId, table.status),
    unique("project_id_id_unique").on(table.projectId, table.id)
]);

// 4. FOCUS SESSIONS
export const focusSessions = pgTable('focus_sessions', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    projectId: uuid("project_id").notNull(),
    taskId: uuid("task_id").notNull(),
    clientSessionId: uuid("client_session_id").notNull().unique(),
    sessionType: text("session_type").$type<SessionType>().default('focus').notNull(),
    status: text("status").$type<SessionStatus>().default('completed').notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(), 
    endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
    plannedSeconds: integer("planned_seconds").notNull(),
    actualSeconds: integer("actual_seconds").generatedAlwaysAs(() => sql`(EXTRACT(EPOCH FROM (ended_at - started_at)))::integer`),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        name: "focus_sessions_project_id_task_id_fkey",
        columns: [table.projectId, table.taskId],
        foreignColumns: [tasks.projectId, tasks.id],
    }).onDelete("restrict"),
    check("focus_sessions_session_type_check", sql`session_type IN ('focus', 'short_break', 'long_break')`),
    check("focus_sessions_status_check", sql`status IN ('completed', 'cancelled')`),
    index("focus_sessions_user_id_started_at_desc_idx").on(table.userId, table.startedAt.desc()),
    index("focus_sessions_analytics_idx")
        .on(table.userId, table.startedAt)
        .where(sql`session_type = 'focus' AND status = 'completed'`),
    index("focus_sessions_task_id_idx").on(table.taskId)
]);

// --- DATABASE VIEW ---
export const focusSessionsAnalytics = pgView("focus_sessions_analytics").as((qb) => 
    qb.select()
      .from(focusSessions)
      .where(sql`session_type = 'focus' AND status = 'completed'`)
);

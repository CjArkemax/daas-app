CREATE TABLE "focus_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"client_session_id" uuid NOT NULL,
	"session_type" text DEFAULT 'focus' NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL,
	"planned_seconds" integer NOT NULL,
	"actual_seconds" integer GENERATED ALWAYS AS ((EXTRACT(EPOCH FROM (ended_at - started_at)))::integer) STORED,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "focus_sessions_client_session_id_unique" UNIQUE("client_session_id"),
	CONSTRAINT "focus_sessions_session_type_check" CHECK (session_type IN ('focus', 'short_break', 'long_break')),
	CONSTRAINT "focus_sessions_status_check" CHECK (status IN ('completed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_status_check" CHECK (status IN ('active', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "project_id_id_unique" UNIQUE("project_id","id"),
	CONSTRAINT "tasks_status_check" CHECK (status IN ('pending', 'completed', 'archived'))
);
--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_project_id_task_id_fkey" FOREIGN KEY ("project_id","task_id") REFERENCES "public"."tasks"("project_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "focus_sessions_user_id_started_at_desc_idx" ON "focus_sessions" USING btree ("user_id","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "focus_sessions_analytics_idx" ON "focus_sessions" USING btree ("user_id","started_at") WHERE session_type = 'focus' AND status = 'completed';--> statement-breakpoint
CREATE INDEX "focus_sessions_task_id_idx" ON "focus_sessions" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "tasks_user_id_status_idx" ON "tasks" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "tasks_project_id_status_idx" ON "tasks" USING btree ("project_id","status");--> statement-breakpoint
CREATE VIEW "public"."focus_sessions_analytics" AS (select "id", "user_id", "project_id", "task_id", "client_session_id", "session_type", "status", "started_at", "ended_at", "planned_seconds", "actual_seconds", "note", "created_at" from "focus_sessions" where session_type = 'focus' AND status = 'completed');
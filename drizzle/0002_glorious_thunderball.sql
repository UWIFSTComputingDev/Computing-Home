CREATE TABLE "classrooms" (
	"code" text PRIMARY KEY NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"directions" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classrooms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"credits" integer NOT NULL,
	"year" text NOT NULL,
	"offered" jsonb NOT NULL,
	"prereqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"degrees" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "classrooms_code_idx" ON "classrooms" USING btree ("code","title","directions");--> statement-breakpoint
CREATE INDEX "courses_year_idx" ON "courses" USING btree ("year");--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;
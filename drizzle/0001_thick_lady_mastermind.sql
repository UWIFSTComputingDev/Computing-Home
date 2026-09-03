CREATE INDEX "answers_question_status_idx" ON "answers" USING btree ("question_id","status");--> statement-breakpoint
CREATE INDEX "submissions_course_status_idx" ON "submissions" USING btree ("course_id","status");--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");
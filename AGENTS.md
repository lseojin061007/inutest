<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Supabase Implementation Rules

## Tables and Access Control
When creating or modifying tables, always include explicit GRANT statements to ensure the PostgREST API can access them:
- `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."table_name" TO "anon";`
- `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."table_name" TO "authenticated";`
- `GRANT ALL ON TABLE "public"."table_name" TO "service_role";`

## Row Level Security (RLS)
Always enable RLS for all tables. For user-specific data (e.g., diaries), implement policies that restrict access to the owner:
- `ALTER TABLE "public"."table_name" ENABLE ROW LEVEL SECURITY;`
- Example Diary Policy:
  ```sql
  CREATE POLICY "Users can manage their own diaries"
  ON "public"."diaries"
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  ```

# Editorial admin routes

- \`/admin/login\`: password sign-in for pre-approved Supabase Auth accounts only. No public registration.
- \`/admin\`: staff-only overview of drafts and posts.
- \`/admin/articles/new\`: create a draft, require active profile and role.
- \`/admin/articles/[id]/edit\`: save, submit for review, approve, publish, unpublish.
- Content editor uses plain UTF-8 text for the first secure implementation.
- Authentication uses Supabase SSR cookies and \`getUser\` for authoritative checks.
- RLS also enforces publication controls; client input never supplies role or author ID.
- First owner onboarding requires separate verified-email approval, intentionally not automated.
- Vercel environment configuration is required; do not put credentials in GitHub.

No Telegram/Facebook import or public launch is enabled yet.

# Strict upload gateway: staged activation

Status: implementation prepared, disabled by default. Existing server-side Sharp
uploads continue with the caller's authenticated Storage client. Filename/MIME
policies alone do not stop authenticated callers bypassing Sharp with direct
Storage requests. The strict gateway closes that gap only after policy activation.

1. Use a separate isolated Supabase project for testing, with both Preview public
   variables and its server-only `SUPABASE_UPLOAD_SECRET_KEY` pointing to that
   project. The secret is a Supabase secret API key (or legacy service-role key).
   Never use a `NEXT_PUBLIC_` name, commit the value, print it, or share it in chat.
2. Set Preview-only `BW_STRICT_UPLOAD_GATEWAY=true`. The gateway independently
   verifies the user, active staff role and owner/editor AAL2 before constructing
   the privileged Storage client. Missing keys fail closed. Metadata insertion
   still uses the caller's original RLS-enforced database client.
3. Verify real JPEG/PNG/WebP/AVIF upload, full and thumbnail output, article edit
   and public image access; verify inactive/anonymous users and AAL1 owners fail.
4. Apply `supabase/manual/strict-upload-gateway.sql` to that isolated project.
   Verify direct authenticated INSERT and UPDATE/upsert fail, while the gateway
   still works. These restrictive policies cover both news buckets and leave
   other buckets, existing objects and public reads intact.
5. Only after those checks and explicit production approval, configure the
   Production secret/flag, deploy, verify upload, then apply the policies. Never
   apply the policies first: the existing upload path needs its old INSERT policy.
6. Rollback by dropping only the two new restrictive policies, then disable the
   gateway flag and redeploy. No object or article deletion is necessary.

There is no remote-image fetching in this gateway: only supplied file bytes enter
Sharp. Output names use the authenticated user ID and a random UUID; callers cannot
choose a bucket, object path or overwrite target. Sharp re-encodes to WebP and
strips metadata. Cleanup removes only newly generated paths on partial failure.
No UI components or image delivery routes change.

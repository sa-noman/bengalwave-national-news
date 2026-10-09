# Bengal Wave: architecture and release plan

## Ownership and environments
- GitHub: source of truth, private repository
- Vercel: target hosting, project should be connected to GitHub after review
- Supabase: planned storage, identity and PostgreSQL backend, Singapore region
- Domain bengalwavenews.com: not owned/connected yet
- The repository is not equivalent to a live deployment.

## Scope of foundation branch
Working responsive Bengali news interface with example-only articles; client-side right navigation drawer and search; article, category, latest, about, contact and editorial policy pages.
Every example story is explicitly marked as a sample. No unverifiable news is published.
Until real content, media rights, admin identity and review workflow are configured, robots disallow indexing.

## Future CMS implementation (not shipped)
1. Supabase project and migrations applied only after cost and account confirmation.
2. Supabase Auth and role-based permissions; server-side checks, RLS tests.
3. Editorial review steps: imported -> draft -> review -> approved -> published.
4. Source imports disabled by default; Telegram not configured, Facebook deferred.
5. News media library in Supabase Storage, image credit/caption and rights tracking.
6. Cache invalidation after approved publication.
7. CI, preview tests, monitored public beta; explicit approval before public launch.

## Deployment
From GitHub import this repository into Vercel; select Next.js with project root \`/\`.
Never commit private env values. A Vercel URL is not the eventual custom domain.
Create a production environment with distinct credentials from previews once the database is provisioned.
Do not enable automated publishing without verified sources and specific approval.

## Brand QA
Sticky forest green header with white Bengal / gold Wave; original logo; full-width gold bottom border.
Right sliding drawer. No LIVE or breaking ticker. Thin dividers between sections.
Yellow feature and culture section, green hover headline and gold underline. Mobile first.

## Known first-stage limitations
- Example articles are in code, not yet pulled from a database.
- Admin and external automation deliberately disabled.
- Sample images are illustrations, not real news photography.
- No public deployment has been requested or authorized.

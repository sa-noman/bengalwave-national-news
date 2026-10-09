# Bengal Wave Newsroom Visual Preview

## Root cause
The homepage used only the Supabase `published` feed. There were no articles, so the entire editorial layout appeared empty. The footer CSS also referenced a missing `public/brand/heritage-cover.webp` file.

## Fix
- On **Vercel Preview** or local `next dev` only, if there are no real published articles, show labelled, fictional layout samples. Every example includes a visible **নমুনা প্রতিবেদন** note and the top notice says the stories are not real.
- On **Vercel Production**, no preview fixture is shown. Published articles still come from Supabase and are never faked. When no articles are published, show a designed welcome state.
- Sample details, latest, category and search routes work only in preview/development.
- Replaced the missing footer background reference with pure CSS parchment-inspired styling; preserved the original logo asset.
- Removed the unowned custom-domain claim from the footer.

## Scope
Website appearance and presentation only. No Admin, Auth, DB schema, permissions or source automations changed.

## QA
Run `npm test`, `npm run typecheck`, `npm run build`. Verify homepage desktop/mobile and preview article routes on a **protected Vercel Preview** deployment. Use real editorial images and the original high-resolution heritage artwork when available and rights are confirmed.

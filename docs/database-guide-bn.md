# Bengal Wave ডেটাবেজ পরিচালনা

Supabase Project ID: `lkleykmjphmliqybmwff`। Region: Singapore।

প্রথম Migration: `initial_cms_schema` (২০২৬-১০-০৯)।

১০টি টেবিল তৈরি হয়েছে এবং সব টেবিলে Row Level Security চালু আছে। মোট ৯টি সংবাদ বিভাগ প্রস্তুত। এখনো কোনো সংবাদ, অ্যাডমিন অ্যাকাউন্ট বা স্বয়ংক্রিয় সংবাদ উৎস যোগ করা হয়নি।

`articles`-এ সংবাদ ও প্রকাশের অবস্থা, `categories`-এ বিভাগ, `profiles`-এ ব্যবহারকারীর অনুমতি, `article_revisions`-এ সংশোধনের ইতিহাস, `media_assets`-এ ছবির তথ্য, `sources` ও `imported_items`-এ ভবিষ্যতের অটোমেশন তথ্য এবং `audit_logs`-এ প্রশাসনিক কার্যক্রম রাখা হবে।

কোনো স্বয়ংক্রিয় প্রকাশনা চালু নেই। মূল অ্যাডমিনের ইমেইল নির্ধারিত হলে যাচাইকৃত Supabase Auth ব্যবহারকারীকে অনুমোদিত উপায়ে Owner Role দেওয়া হবে।

**সতর্কতা:** `supabase/migrations/001_blueprint.sql` ছিল পরিকল্পনার খসড়া। সেটি নতুন Migration-এর সঙ্গে পুনরায় চালাবেন না। মূল Migration হলো `202610090001_initial_cms.sql`।

---

# Bengal Wave CMS database

Supabase project: `lkleykmjphmliqybmwff` (Singapore, Noman organization).

Migration `supabase/migrations/202610090001_initial_cms.sql` was applied on 2026-10-09 through Supabase with migration name `initial_cms_schema`.

## Current state
- Ten tables: profiles, categories, tags, media_assets, articles, article_tags, article_revisions, sources, imported_items and audit_logs.
- Nine category records. No published news, no owner account, no imports, no connected source.
- All public tables have RLS enabled. Public users may read published articles and active categories; no browser access to automation inbox or audit logs.
- Source imports disabled by default. No auto-publish policy is enabled.
- Editors will need a separate authentication and role bootstrap step before writing through the admin UI.
- Do not apply both `001_blueprint.sql` and the actual initial migration. The former is an archive of the design draft, not an executable migration for this database.
- Check policies carefully prior to implementing scheduled publishing or granting admin rights.

## First administrator
Owner email is still undecided. Create a user through secure Supabase Auth onboarding, verify email, then explicitly assign their `profiles.role = 'owner'` using an authorized database administration path. No automatic elevation or open registration should be implemented.

## Next steps
1. Add proper Supabase SSR session management and separate authenticated dashboard routes.
2. Restrict write actions to authorized server flows and add verification tests.
3. Integrate public news pages with `published` records only.
4. Add secure storage access policies and editorial image rights fields.
5. Configure Vercel Preview with public beta access only when separately approved.

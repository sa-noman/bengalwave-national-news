-- Exclusive is a real editorial category, not a renamed Featured flag.
-- Prepared in preview only. Apply to the database only with explicit live approval.
-- Existing articles, category assignments, and published content are untouched.
insert into public.categories (slug,label_bn,sort_order,is_active)
values ('exclusive','এক্সক্লুসিভ',5,true)
on conflict (slug) do nothing;

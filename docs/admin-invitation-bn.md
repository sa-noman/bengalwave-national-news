# Bengal Wave: আমন্ত্রণ গ্রহণ ও প্রথম Admin Account

প্রধান Admin-এর ইমেইল ব্যবহারকারী চ্যাটে নিশ্চিত করেছেন। নিরাপত্তার জন্য ইমেইল এবং পাসওয়ার্ড GitHub রিপোজিটরিতে রাখা হয়নি।

## Supabase দিয়ে ব্যবহারকারী আমন্ত্রণ

1. প্রথমে HTTPS-সহ Vercel Development/Preview URL তৈরি করে দুইটি Public Supabase Environment Variable সেট করতে হবে: `NEXT_PUBLIC_SUPABASE_URL` এবং `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`। Public Launch-এর আগে Deployment Protection নিশ্চিত করতে হবে।
2. Supabase → Authentication → URL Configuration-এ **Site URL** সেট করতে হবে সেই Deployment URL-এ; Allowed Redirect URLs-এ প্রয়োজনীয় Deployment URL-ই থাকবে, কোনো অপ্রয়োজনীয় wildcard নয়।
3. Supabase → Authentication → Email Templates → Invite user-এর যাচাই লিংক ব্যবহার করুন: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`। Invite Template-এ সংরক্ষণের পর নিজে টেস্ট করতে হবে।
4. Supabase Dashboard → Authentication → Users → Invite User-এ নিশ্চিত Admin ইমেইল বসিয়ে Invitation পাঠাতে হবে। Supabase Plugin-এ এখনো Auth Invitation পাঠানোর Action নেই, তাই Dashboard-এ এই ক্লিক ব্যবহারকারীকে করতে হবে।
5. ইমেইলে পাওয়া লিংক থেকে `/auth/confirm`-এ OTP যাচাই হবে; তারপর `/admin/set-password`-এ **নিজের ডিভাইস থেকে** ১২ বা তার বেশি অক্ষরের নতুন পাসওয়ার্ড বসাতে হবে। পাসওয়ার্ড ChatGPT-কে দেবেন না।
6. অ্যাকাউন্ট তৈরির এবং ইমেইল যাচাইয়ের পর user UUID যাচাই করে অনুমোদিত Supabase প্রশাসনিক অপারেশনে `public.profiles`-এ একটি সক্রিয় `owner` Row তৈরি করতে হবে। Auth User তৈরি হওয়ার আগে Owner Role দেওয়া হবে না।
7. `/admin/login` থেকে Login, `/admin` Dashboard, Logout এবং অনুমোদনহীন ব্যবহারকারীর Access Denied আচরণ পরীক্ষা করতে হবে।

## গুরুত্বপূর্ণ

- প্রথমে খোলা Registration বন্ধ/Invite-only করতে হবে। এ সেটিংটি Dashboard-এ যাচাই করুন।
- Repo-তে কোনো পাসওয়ার্ড, টোকেন বা Admin ইমেইল Commit করবেন না।
- আলাদা Owner Role Assignment ছাড়া কেউ সম্পাদকীয় ফিচার ব্যবহার করতে পারবে না।
- Vercel Project/Preview এখনও তৈরি হয়নি; তাই এখনই Invitation পাঠালে ভুল Site URL-এ যেতে পারে।
- User-এর Public Launch অনুমোদন নেই। Vercel Deployment Protection পর্যালোচনা ও আলাদা অনুমতি ছাড়া Public Launch করবেন না।

## সম্পূর্ণ হওয়ার সংজ্ঞা

**৪ নম্বর ধাপ সম্পূর্ণ** হবে Invite গ্রহণ, verified email, Owner profile, Login/Logout এবং অনুমতি যাচাই বাস্তবে সফল হওয়ার পর। শুধু Invite বা কোড লেখা থাকলে পুরো ধাপ সম্পন্ন নয়।
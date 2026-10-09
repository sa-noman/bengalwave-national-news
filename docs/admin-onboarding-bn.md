# Bengal Wave: প্রথম Admin Account চালু করার নিয়ম

**অবস্থা (৯ অক্টোবর ২০২৬):** Supabase Auth-এ এখনো কোনো ব্যবহারকারী নেই, কোনো Owner নেই। প্রকৃত ইমেইল নির্বাচন বাকি। Owner তৈরির কাজ স্বয়ংক্রিয়ভাবে করা হয়নি।

## আগে যা দরকার

১. মালিকের নির্বাচিত Admin ইমেইল। ইমেইল ঠিকানা চ্যাটে দেওয়া যাবে, কিন্তু পাসওয়ার্ড বা Recovery Code পাঠানো যাবে না।

২. Supabase Dashboard → **Authentication → Users** থেকে নির্বাচিত ইমেইলে নিরাপদভাবে User Invite পাঠাতে হবে। ব্যবহারকারীর নিজের ইমেইলে Invitation গ্রহণ করতে হবে। Supabase plugin-এর বর্তমান সংযোগে Auth User Invite করার কোনো সরাসরি Action নেই; তাই এই ধাপটি Dashboard থেকে করতে হবে।

৩. প্রথমবারের জন্য Authentication-এর Signups/Provider Settings যাচাই করতে হবে। Public Sign Up খোলা রাখার প্রয়োজন নেই। শুধু Invite-ভিত্তিক Owner onboarding করতে হবে।

৪. Supabase Auth-এ ব্যবহারকারীর ইমেইল যাচাই হওয়ার পর সংশ্লিষ্ট Auth UUID নিশ্চিত করে তাকে **Owner** হিসেবে Profiles টেবিলে অনুমোদিত SQL Migration বা প্রশাসনিক Query দিয়ে যুক্ত করতে হবে। ব্যবহারকারীর ইমেইল নিশ্চিত না হয়ে কাউকে Owner করা যাবে না। `public.profiles`-এ স্বয়ংক্রিয়ভাবে Role-এ উন্নীত হওয়ার কোনো ব্যবস্থা নেই।

৫. Vercel-এর Development/Preview Environment-এ Supabase URL এবং Publishable Key সেট করে Login পরীক্ষা করতে হবে। Live Public Launch-এর অনুমোদন আলাদা।

## নিরাপত্তা

- Supabase Security Advisor-এর RLS/Function warnings পর্যালোচনা করা হয়েছে; `harden_admin_auth` ও `private_role_lookup` Migration প্রয়োগ করা হয়েছে।
- Public Schema-তে SECURITY DEFINER Function দিয়ে সরাসরি Admin Action নেই।
- এডিটর ছাড়া সংবাদ Publish করা যাবে না। ডাটাবেজ Status Transition যাচাই করে।
- Telegram, Facebook ও Auto Publish এখনো বন্ধ।
- পাসওয়ার্ড কখনো GitHub Commit বা চ্যাটে প্রকাশ করবেন না।

## Login যাচাইয়ের পরেই ধাপ ৪ সম্পূর্ণ

শুধু Login Form তৈরি থাকলেই ধাপ সম্পূর্ণ নয়। Invitation, Email Verification, Owner Permission, Login, Logout, Unauthorized Access Test এবং কাজ করা Preview URL যাচাই করতে হবে।

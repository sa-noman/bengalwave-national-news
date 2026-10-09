# Bengal Wave: CMS ও নিরাপদ প্রকাশনা

পরবর্তী ডেভেলপমেন্ট পর্যায়ে Supabase SSR ভিত্তিক লগইন, অনুমতি নিয়ন্ত্রণ, সংবাদ তৈরি, Draft, Review, Approve, Publish ও Unpublish যোগ করা হয়েছে।

## শুরুর আগে
- Vercel-এ NEXT_PUBLIC_SUPABASE_URL এবং NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY যুক্ত করতে হবে।
- প্রধান Owner-এর ইমেইল চূড়ান্ত করে Supabase Auth-এর মাধ্যমে যাচাইকৃত ব্যবহারকারী তৈরি করতে হবে।
- প্রমাণিত সেই Auth User-এর ID-তে অনুমোদিত প্রশাসনিক উপায়ে profiles টেবিলে owner Role যুক্ত করতে হবে।
- কোনো সাধারণ ব্যবহারকারী নিজে নিজের Role পরিবর্তন করতে পারবেন না।

## সংবাদ প্রকাশ
লগইন → Draft তৈরি → Review → Approved → Published। সংবাদের তথ্য, উৎস ও বিভাগ যাচাই করা বাধ্যতামূলক।
নিউজ পেজগুলো Supabase-এ প্রকাশিত সংবাদ ছাড়া অন্য কোনো সংবাদ পাঠকদের দেখাবে না।
অনুমোদনহীন ব্যবহারকারী Admin Dashboard-এ প্রবেশ করতে পারবেন না।

## এখনও অসম্পূর্ণ
Owner Account, ছবি সংরক্ষণ ব্যবস্থা, Rich Text Editor, স্বয়ংক্রিয় সংবাদ আমদানি, Scheduling Job, বাস্তব Deployment এবং Public Launch।
এখনো Paid Upgrade বা Public Launch করা হয়নি।
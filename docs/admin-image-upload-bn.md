# Bengal Wave: Admin থেকে সংবাদে ছবি যোগ করার নিয়ম

## কোথায় ছবি যুক্ত করবেন

লাইভ সাইটে `main` ব্রাঞ্চ, আলাদা পরীক্ষার সাইটে `fix/partial-news-images-20261010` ব্রাঞ্চ।

- নতুন সংবাদ: `/admin/articles/new`
- পুরোনো সংবাদ: `/admin/articles/[id]/edit`

ফর্মের **সংবাদের ছবি** অংশে **ছবি নির্বাচন করুন** থেকে JPG, PNG বা WebP বেছে নিন। নির্বাচন করলেই স্থানীয় প্রিভিউ দেখা যাবে। প্রয়োজনে Alt Text, ক্যাপশন ও ফটো ক্রেডিট লিখুন। তারপর **খসড়া সংরক্ষণ / পরিবর্তন সংরক্ষণ** চাপুন। আপলোড ও প্রসেসিং শেষ না হওয়া পর্যন্ত অপেক্ষা করুন।

## মাপ ও মান

- সর্বোচ্চ ইনপুট ফাইল: **৪ MB** (Vercel-এর request সীমার কথা বিবেচনা করে)
- ন্যূনতম উৎস ছবির মাত্রা: **940 × 450** পিক্সেল
- মূল ছবি: সর্বোচ্চ 2000 × 2000-এ ফিট (কখনো upscale নয়), WebP Quality **90**
- নিউজ কার্ডের Thumbnail: সর্বোচ্চ 760 পিক্সেল চওড়া, WebP Quality **78**
- ছবি নির্বাচনের সঙ্গে সঙ্গে Local Preview। আপলোডের পর Storage থেকে CDN URL।
- ছবি ভাঙা, খুব ছোট বা unsupported format হলে সংরক্ষণের সময় error দেখাবে।
- ছবি পরিবর্তন করলে পুরোনো ফাইল তৎক্ষণাৎ delete হয় না; revision/cleanup-এর জন্য থাকে।

## নিরাপত্তা ও ডাটাবেজ

- Production Storage bucket: `bengalwave-news-images`; Preview bucket: `bengalwave-preview-news-images`।
- দুটি পরিবেশেই যাচাইকৃত CMS কর্মীরা ছবি আপলোড করতে পারেন। Preview-তে প্রকাশনা ও লাইভ সংবাদ পরিবর্তন নিষিদ্ধ।
- সংরক্ষণ করতে authenticated `owner`, `editor` অথবা অনুমোদিত `contributor` Role প্রয়োজন।
- Original/Thumbnail একই UUID directory-তে; ডাটাবেজের `media_assets.storage_path` এবং `articles.hero_media_id` লিঙ্ক করে।
- Public নিউজ ফিড শুধু প্রকাশিত আর্টিকেলের সঙ্গে যুক্ত ছবির Metadata পড়ে।
- উভয় Bucket-এর জন্য আলাদা Role-Restricted Storage Policy কার্যকর করা হয়েছে। পুরোনো Preview-তে আপলোড করা ছবিগুলো নতুন Production-এও পড়া যায়।
- **গুরুত্বপূর্ণ:** Preview ও মূল সাইট একই Supabase project's `articles` টেবিল ব্যবহার করে। Preview ব্রাঞ্চে লাইভ সংবাদ Publish/Unpublish এবং প্রকাশিত সংবাদ Edit কোড দিয়ে বন্ধ রাখা হয়েছে। তবে Draft/Approved-এ পরিবর্তন উভয় Admin থেকে দেখা যেতে পারে। সম্পূর্ণ পৃথক পরীক্ষার জন্য Staging Database প্রয়োজন।

## সমস্যা হলে

ছবি সিলেক্টের পর Save-এ error হলে ফাইলের Size/Dimensions চেক করুন। Dashboard-এ লগইন থাকতে হবে। Vercel Preview Deployment READY কি না যাচাই করুন। ৪ MB-এর বেশি উৎস হলে আগে ছবি Resize/Compress করুন; WebP হিসেবে Full Image আবার Quality 90-এ সংরক্ষিত হবে।

import type { NewsItem } from "@/lib/demo-news";

// These are fictional, editorial-layout fixtures, NOT reports about real events.
// Never show them outside a local development or Vercel Preview environment.
export const previewNews: NewsItem[] = [
  {id:"preview-01",slug:"sample-bangladesh-rivers",category:"জাতীয়",categorySlug:"national",title:"নদী ও জনজীবন: বদলে যাওয়া বাংলার গল্প",summary:"বাংলাদেশের নদীকেন্দ্রিক জীবন নিয়ে একটি উদাহরণধর্মী প্রতিবেদনের বিন্যাস। এটি বাস্তব সংবাদ নয়।",image:"/illustrations/river.svg",featured:true,isDemo:true},
  {id:"preview-02",slug:"sample-international-coverage",category:"আন্তর্জাতিক",categorySlug:"international",title:"বিশ্বের ঘটনাপ্রবাহ বুঝতে প্রেক্ষাপটভিত্তিক সংবাদ",summary:"আন্তর্জাতিক বিভাগের কার্ড, শিরোনাম ও তথ্যের বিন্যাস দেখানোর নমুনা।",image:"/illustrations/world.svg",isDemo:true},
  {id:"preview-03",slug:"sample-public-participation",category:"রাজনীতি",categorySlug:"politics",title:"নাগরিক অংশগ্রহণ ও স্থানীয় উদ্যোগের নানা দিক",summary:"সামাজিক ও রাজনৈতিক সংবাদ পরিবেশনার একটি নমুনা।",image:"/illustrations/city.svg",isDemo:true},
  {id:"preview-04",slug:"sample-market-economy",category:"অর্থনীতি",categorySlug:"economy",title:"বাজারের গতিপ্রকৃতি ও পরিবারের দৈনন্দিন হিসাব",summary:"অর্থনৈতিক সংবাদের জন্য নির্ধারিত প্রাথমিক ডিজাইন নমুনা।",image:"/illustrations/economy.svg",isDemo:true},
  {id:"preview-05",slug:"sample-local-communities",category:"জাতীয়",categorySlug:"national",title:"গ্রাম ও শহরের গল্পে বাংলাদেশের বৈচিত্র্য",summary:"দেশের বিভিন্ন অঞ্চলের জীবন নিয়ে একটি নমুনা ফিচারের শিরোনাম।",image:"/illustrations/city.svg",isDemo:true},
  {id:"preview-06",slug:"sample-cultural-heritage",category:"সংস্কৃতি",categorySlug:"culture",title:"ঐতিহ্যের স্থাপত্যে ফিরে দেখা বাংলার ইতিহাস",summary:"ফিচার ও সংস্কৃতি বিভাগের জন্য পরীক্ষামূলক বিন্যাস।",image:"/illustrations/heritage.svg",featured:true,isDemo:true},
  {id:"preview-07",slug:"sample-technology-education",category:"প্রযুক্তি",categorySlug:"technology",title:"প্রযুক্তি শিক্ষায় নতুন প্রজন্মের কৌতূহল",summary:"প্রযুক্তি বিভাগে শিরোনাম ও কার্ড উপস্থাপনার নমুনা।",image:"/illustrations/city.svg",isDemo:true},
  {id:"preview-08",slug:"sample-digital-media",category:"ফিচার",categorySlug:"features",title:"ডিজিটাল যুগে সংবাদপাঠের পরিবর্তিত অভ্যাস",summary:"এই নমুনার মাধ্যমে দীর্ঘ শিরোনামের প্রদর্শন পরীক্ষা করা হয়।",image:"/illustrations/world.svg",featured:true,isDemo:true},
  {id:"preview-09",slug:"sample-world-explainer",category:"আন্তর্জাতিক",categorySlug:"international",title:"মানচিত্রে বিশ্ব: প্রতিবেশী অঞ্চল ও যোগাযোগ",summary:"আন্তর্জাতিক ব্যাখ্যামূলক প্রতিবেদন উপস্থাপনার উদাহরণ।",image:"/illustrations/world.svg",isDemo:true},
  {id:"preview-10",slug:"sample-rural-economy",category:"অর্থনীতি",categorySlug:"economy",title:"কৃষি ও ক্ষুদ্র ব্যবসায় স্থানীয় অর্থনীতির ভূমিকা",summary:"অর্থনীতি বিভাগের সংবাদ বিন্যাস পরীক্ষার নমুনা।",image:"/illustrations/economy.svg",isDemo:true},
  {id:"preview-11",slug:"sample-folk-stories",category:"ফিচার",categorySlug:"features",title:"লোকজ সুর ও স্মৃতিতে বাংলার সাংস্কৃতিক জীবন",summary:"ফিচার স্টোরির ছবি, ক্যাপশন ও লেখা দেখানোর নমুনা।",image:"/illustrations/heritage.svg",featured:true,isDemo:true},
  {id:"preview-12",slug:"sample-national-education",category:"জাতীয়",categorySlug:"national",title:"শিক্ষা ও তরুণদের স্বপ্ন নিয়ে একটি প্রতিবেদন",summary:"জাতীয় বিভাগের জন্য আরেকটি নমুনা নিউজ কার্ড।",image:"/illustrations/river.svg",isDemo:true},
  {id:"preview-13",slug:"sample-sports-communities",category:"খেলাধুলা",categorySlug:"sports",title:"মাঠে তরুণদের অনুশীলন ও দল গঠনের গল্প",summary:"খেলাধুলা বিভাগের কার্ড পরীক্ষা করার নমুনা।",image:"/illustrations/city.svg",isDemo:true},
  {id:"preview-14",slug:"sample-entertainment-culture",category:"বিনোদন",categorySlug:"entertainment",title:"সিনেমা ও নাটকে গল্প বলার নতুন ভাষা",summary:"বিনোদন বিভাগের তথ্য বিন্যাসের নমুনা।",image:"/illustrations/heritage.svg",isDemo:true}
];
export const previewArticleBody=[
  "এটি শুধুমাত্র Bengal Wave ওয়েবসাইটের ডিজাইন ও পাঠযোগ্যতা পরীক্ষা করার জন্য তৈরি একটি নমুনা। এখানে কোনো বাস্তব ঘটনা বা সংবাদ প্রকাশ করা হয়নি।",
  "মূল ওয়েবসাইটে যাচাইকৃত সংবাদ প্রকাশের সময় প্রতিবেদনের পূর্ণাঙ্গ বিবরণ, প্রাসঙ্গিক উৎস, সঠিক তারিখ এবং ছবির বিবরণ এই জায়গায় প্রদর্শিত হবে।",
  "এই পেজে বাংলা ফন্ট, অনুচ্ছেদের দূরত্ব, শিরোনামের আকার এবং মোবাইল স্ক্রিনের বিন্যাস পরীক্ষা করা যাবে।"
].join("\n\n");

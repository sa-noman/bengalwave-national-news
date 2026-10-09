import type {NewsItem} from "@/lib/demo-news";
// All items are fictional placeholders, and never displayed on Vercel Production.
export const previewNews:NewsItem[]=[
 {id:"sample1",slug:"sample-national-river",category:"জাতীয়",categorySlug:"national",title:"নদী ও জনজীবন: বদলে যাওয়া বাংলার গল্প",summary:"বাংলাদেশের নদীকেন্দ্রিক জীবন নিয়ে একটি উদাহরণধর্মী প্রতিবেদনের বিন্যাস। এটি বাস্তব সংবাদ নয়।",image:"/prototype/story-lead.webp",featured:true,isDemo:true},
 {id:"sample2",slug:"sample-economy-markets",category:"অর্থনীতি",categorySlug:"economy",title:"বাজারের গতিপ্রকৃতি ও পরিবারের দৈনন্দিন হিসাব",summary:"অর্থনৈতিক সংবাদ উপস্থাপনার নমুনা, কোনো বাস্তব ঘটনার প্রতিবেদন নয়।",image:"/illustrations/economy.svg",isDemo:true},
 {id:"sample3",slug:"sample-technology-education",category:"প্রযুক্তি",categorySlug:"technology",title:"প্রযুক্তি শিক্ষায় তরুণ প্রজন্মের কৌতূহল",summary:"প্রযুক্তি বিভাগের সংবাদ কার্ডের জন্য একটি নমুনা বিবরণ।",image:"/illustrations/city.svg",featured:true,isDemo:true},
 {id:"sample4",slug:"sample-sport-teams",category:"খেলাধুলা",categorySlug:"sports",title:"মাঠে তরুণদের অনুশীলন ও দল গঠনের গল্প",summary:"খেলাধুলা বিভাগের ডিজাইন পরীক্ষার নমুনা।",image:"/illustrations/world.svg",isDemo:true},
 {id:"sample5",slug:"sample-world-climate",category:"আন্তর্জাতিক",categorySlug:"international",title:"বিশ্বজুড়ে জলবায়ু আলোচনার গুরুত্বপূর্ণ প্রেক্ষাপট",summary:"আন্তর্জাতিক সংবাদের ছবির সঙ্গে শিরোনাম ও বিবরণের বিন্যাস।",image:"/illustrations/world.svg",featured:true,isDemo:true},
 {id:"sample6",slug:"sample-entertainment",category:"বিনোদন",categorySlug:"entertainment",title:"সিনেমা ও নাটকে গল্প বলার নতুন ভাষা",summary:"বিনোদনের নানা আয়োজন নিয়ে একটি কাল্পনিক নমুনা।",image:"/prototype/feature-1.webp",isDemo:true},
 {id:"sample7",slug:"sample-river-conservation",category:"জাতীয়",categorySlug:"national",title:"নদীভাঙন ও মানুষের জীবন নিয়ে অনুসন্ধানের নানা দিক",summary:"দেশের মানুষের গল্প উপস্থাপনার নমুনা।",image:"/prototype/story-2.webp",isDemo:true},
 {id:"sample8",slug:"sample-education-bangladesh",category:"জাতীয়",categorySlug:"national",title:"শিক্ষার নতুন উদ্যোগ নিয়ে একটি বিশেষ প্রতিবেদন",summary:"জাতীয় বিভাগের কনটেন্ট বিন্যাসের নমুনা।",image:"/prototype/story-3.webp",isDemo:true},
 {id:"sample9",slug:"sample-road-journey",category:"জাতীয়",categorySlug:"national",title:"দেশের মহাসড়ক ও যাতায়াত নিয়ে নাগরিক ভাবনা",summary:"দেশের বিভিন্ন অঞ্চলের তথ্যচিত্রের নমুনা।",image:"/prototype/story-4.webp",isDemo:true},
 {id:"sample10",slug:"sample-world-energy",category:"আন্তর্জাতিক",categorySlug:"international",title:"বিশ্বের জ্বালানি খাত বোঝার কিছু গুরুত্বপূর্ণ বিষয়",summary:"আন্তর্জাতিক অর্থনীতি বিষয়ে একটি উদাহরণ।",image:"/illustrations/world.svg",isDemo:true},
 {id:"sample11",slug:"sample-global-connections",category:"আন্তর্জাতিক",categorySlug:"international",title:"প্রতিবেশী অঞ্চল ও আন্তর্জাতিক যোগাযোগের ইতিহাস",summary:"এটি কোনো চলমান ঘটনার সংবাদ নয়।",image:"/illustrations/world.svg",isDemo:true},
 {id:"sample12",slug:"sample-world-health",category:"আন্তর্জাতিক",categorySlug:"international",title:"বৈশ্বিক স্বাস্থ্যব্যবস্থা নিয়ে সাধারণ আলোচনা",summary:"আন্তর্জাতিক বিভাগের জন্য ডিজাইন নমুনা।",image:"/illustrations/world.svg",isDemo:true},
 {id:"sample13",slug:"sample-football",category:"খেলাধুলা",categorySlug:"sports",title:"তৃণমূল ফুটবলে নতুনদের আগ্রহ ও অনুশীলন",summary:"খেলাধুলা বিভাগের নিউজ লেআউট পরীক্ষার লেখা।",image:"/illustrations/city.svg",isDemo:true},
 {id:"sample14",slug:"sample-womens-cricket",category:"খেলাধুলা",categorySlug:"sports",title:"মেয়েদের ক্রিকেটে তরুণ খেলোয়াড়দের স্বপ্ন",summary:"পরীক্ষামূলক প্রতিবেদন কার্ড।",image:"/illustrations/world.svg",isDemo:true},
 {id:"sample15",slug:"sample-athletics",category:"খেলাধুলা",categorySlug:"sports",title:"দৌড় ও অ্যাথলেটিকসে নতুন প্রজন্মের প্রস্তুতি",summary:"নমুনা ক্রীড়া প্রতিবেদন।",image:"/illustrations/city.svg",isDemo:true},
 {id:"sample16",slug:"sample-exports",category:"অর্থনীতি",categorySlug:"economy",title:"রপ্তানি ও উৎপাদনশীলতা নিয়ে বিশ্লেষণের কাঠামো",summary:"অর্থনীতির একটি কাল্পনিক প্রতিবেদনের ধরন।",image:"/illustrations/economy.svg",isDemo:true},
 {id:"sample17",slug:"sample-mobile-bank",category:"অর্থনীতি",categorySlug:"economy",title:"ডিজিটাল লেনদেন ও ব্যক্তিগত অর্থব্যবস্থাপনা",summary:"নমুনা সংবাদ কার্ডের লেখা।",image:"/illustrations/economy.svg",isDemo:true},
 {id:"sample18",slug:"sample-small-business",category:"অর্থনীতি",categorySlug:"economy",title:"ক্ষুদ্র ব্যবসায় স্থানীয় মানুষের নানা অভিজ্ঞতা",summary:"অর্থনীতি বিভাগের জন্য নমুনা।",image:"/illustrations/economy.svg",isDemo:true},
 {id:"sample19",slug:"sample-folk-culture",category:"ফিচার",categorySlug:"features",title:"বাঁশের গান আর নদীর সুর: লোকসংস্কৃতির গল্প",summary:"ইতিহাস ও ঐতিহ্যের নিবিড় পরিচয় তুলে ধরার নমুনা।",image:"/prototype/feature-2.webp",featured:true,isDemo:true},
 {id:"sample20",slug:"sample-old-dhaka",category:"সংস্কৃতি",categorySlug:"culture",title:"পুরান ঢাকার গলি, স্থাপত্য আর মানুষের গল্প",summary:"বাংলা সাহিত্য ও সংস্কৃতির ডিজাইন পরীক্ষার লেখা।",image:"/illustrations/heritage.svg",isDemo:true},
 {id:"sample21",slug:"sample-new-film",category:"বিনোদন",categorySlug:"entertainment",title:"পর্দার পেছনের গল্প ও নতুন নির্মাতাদের ভাবনা",summary:"বিনোদন বিভাগের ফিচার কার্ডের উদাহরণ।",image:"/illustrations/heritage.svg",isDemo:true},
 {id:"sample22",slug:"sample-books",category:"সংস্কৃতি",categorySlug:"culture",title:"বাংলা সাহিত্য ও চিন্তার জগতে ফিরে দেখা সৃষ্টি",summary:"বই, লেখক এবং সময়ের সঙ্গে বদলে যাওয়া গল্প।",image:"/illustrations/heritage.svg",isDemo:true},
 {id:"sample23",slug:"sample-politics",category:"রাজনীতি",categorySlug:"politics",title:"নাগরিক অংশগ্রহণ ও স্থানীয় উদ্যোগের নানা দিক",summary:"রাজনীতি বিভাগের নমুনা সংবাদ।",image:"/illustrations/city.svg",isDemo:true}
];
export const previewArticleBody=[
 "এটি শুধু বেঙ্গল ওয়েভ ওয়েবসাইটের ডিজাইন ও পাঠযোগ্যতা পরীক্ষা করার জন্য তৈরি একটি নমুনা। এখানে কোনো বাস্তব ঘটনা বা সংবাদ প্রকাশ করা হয়নি।",
 "মূল ওয়েবসাইটে যাচাইকৃত সংবাদ প্রকাশের সময় প্রতিবেদনের পূর্ণাঙ্গ বিবরণ, উৎস, তারিখ এবং ছবির বিবরণ এই জায়গায় দেখানো হবে।",
 "এই পেজে বাংলা ফন্ট, অনুচ্ছেদ, শিরোনাম এবং মোবাইল স্ক্রিনের বিন্যাস পরীক্ষা করা যাচ্ছে।"
].join("\n\n");

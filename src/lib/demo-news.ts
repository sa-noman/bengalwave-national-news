export type NewsItem = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  image: string;
  featured?: boolean;
};

export const categories = [
  {slug:"national",label:"জাতীয়"},
  {slug:"international",label:"আন্তর্জাতিক"},
  {slug:"politics",label:"রাজনীতি"},
  {slug:"economy",label:"অর্থনীতি"},
  {slug:"features",label:"ফিচার"},
  {slug:"culture",label:"সংস্কৃতি"},
  {slug:"technology",label:"প্রযুক্তি"},
  {slug:"sports",label:"খেলাধুলা"},
] as const;

// DEVELOPMENT FIXTURES ONLY. These are not verified or published articles.
// Switch to the Supabase published-articles query before a real public launch.
export const demoNews: NewsItem[] = [
  {id:"01",slug:"rivers-and-communities",category:"জাতীয়",title:"নদী, জনজীবন ও বাংলাদেশের পরিবর্তনের গল্প",summary:"নদীকেন্দ্রিক জীবন ও পরিবেশ নিয়ে একটি নমুনা সম্পাদকীয় প্রতিবেদন। বাস্তব সংবাদ নয়।",image:"/illustrations/river.svg",featured:true},
  {id:"02",slug:"community-conversation",category:"রাজনীতি",title:"স্থানীয় উদ্যোগ ও নাগরিক অংশগ্রহণ নিয়ে আলোচনা",summary:"নতুন নিউজ কার্ডের বিন্যাস বোঝানোর জন্য তৈরি উদাহরণ।",image:"/illustrations/city.svg"},
  {id:"03",slug:"food-and-economy",category:"অর্থনীতি",title:"নিত্যপণ্যের বাজার বুঝতে তথ্যভিত্তিক বিশ্লেষণ",summary:"অর্থনীতি বিভাগের একটি নমুনা সংবাদ শিরোনাম।",image:"/illustrations/economy.svg"},
  {id:"04",slug:"world-perspectives",category:"আন্তর্জাতিক",title:"বিশ্বসংবাদ: ঘটনাপ্রবাহ ও প্রেক্ষাপট",summary:"আন্তর্জাতিক বিভাগে সংবাদ কীভাবে দেখা যাবে তার উদাহরণ।",image:"/illustrations/world.svg"},
  {id:"05",slug:"heritage-architecture",category:"সংস্কৃতি",title:"বাংলার ঐতিহ্য ও স্থাপত্যের গল্প",summary:"ঐতিহ্যভিত্তিক একটি নমুনা ফিচার।",image:"/illustrations/heritage.svg"},
  {id:"06",slug:"digital-education",category:"প্রযুক্তি",title:"প্রযুক্তি শিক্ষার নতুন সম্ভাবনা নিয়ে ভাবনা",summary:"প্রযুক্তি বিভাগের নমুনা প্রতিবেদন।",image:"/illustrations/city.svg"},
  {id:"07",slug:"folk-culture",category:"ফিচার",title:"লোকসংস্কৃতির সুরে বাংলার জীবন",summary:"ফিচার বিভাগের একটি উদাহরণ, যাচাইকৃত সংবাদ নয়।",image:"/illustrations/heritage.svg"},
  {id:"08",slug:"sporting-stories",category:"খেলাধুলা",title:"খেলাধুলায় তরুণদের অংশগ্রহণ ও অনুশীলন",summary:"খেলাধুলা বিভাগের নমুনা কার্ড।",image:"/illustrations/world.svg"}
];

export function getArticle(slug: string) {
  return demoNews.find((item) => item.slug === slug);
}
export function getCategory(label: string) {
  return categories.find((category) => category.slug === label);
}

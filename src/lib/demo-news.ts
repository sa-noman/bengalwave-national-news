export type NewsItem = {
  id: string;
  slug: string;
  category: string;
  categorySlug?: string;
  title: string;
  summary: string;
  image: string;
  featured?: boolean;
  publishedAt?: string;
  isDemo?: boolean;
};

// Legacy development fixtures, intentionally not used for public pages.
// Only published, server-filtered Supabase articles may appear as real news.
export const categories = [
  {slug:"national",label:"জাতীয়"},
  {slug:"international",label:"আন্তর্জাতিক"},
  {slug:"politics",label:"রাজনীতি"},
  {slug:"economy",label:"অর্থনীতি"},
  {slug:"features",label:"ফিচার"},
  {slug:"culture",label:"সংস্কৃতি"},
  {slug:"technology",label:"প্রযুক্তি"},
  {slug:"sports",label:"খেলাধুলা"},
  {slug:"entertainment",label:"বিনোদন"},
] as const;
export function getCategory(slug:string) {
  return categories.find(category=>category.slug===slug);
}

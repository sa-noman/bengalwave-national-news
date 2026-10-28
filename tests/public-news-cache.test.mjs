import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("public news reads use a tagged Data Cache while keeping nonce CSP rendering",()=>{
 const feed=read("src/lib/news-feed.ts");
 const layout=read("src/app/layout.tsx");
 assert.match(feed,/unstable_cache\(readPublishedNews,/);
 assert.match(feed,/unstable_cache\(readPublishedNewsByCategory,/);
 assert.match(feed,/unstable_cache\(readPublishedArticle,/);
 assert.match(feed,/tags:\[PUBLIC_NEWS_CACHE_TAG\]/);
 assert.match(feed,/revalidate:PUBLIC_NEWS_REVALIDATE_SECONDS/);
 // Strict CSP nonce is still read per request; caching must not remove it.
 assert.match(layout,/\(await headers\(\)\)\.get\("x-nonce"\)/);
});

test("failed Supabase reads are thrown inside the cache and never cached",()=>{
 const feed=read("src/lib/news-feed.ts");
 assert.match(feed,/if\(error\)throw new PublicNewsReadError/);
 assert.match(feed,/throw new PublicNewsReadError\("Bengal Wave: published image metadata unavailable"/);
 assert.match(feed,/catch\(error\)\{logReadFailure\(error\);return \[\];\}/);
 assert.match(feed,/catch\(error\)\{logReadFailure\(error\);return null;\}/);
});

test("metadata and page share one article read per request",()=>{
 const feed=read("src/lib/news-feed.ts");
 assert.match(feed,/import \{cache\} from "react"/);
 assert.match(feed,/export const getPublishedArticle=cache\(/);
 assert.match(feed,/export const getPublishedNews=cache\(/);
 assert.match(feed,/export const getPublishedNewsByCategory=cache\(/);
});

test("CMS changes immediately invalidate the public news cache",()=>{
 const actions=read("src/app/admin/actions.ts");
 assert.match(actions,/import \{revalidatePath,revalidateTag\} from "next\/cache"/);
 assert.match(actions,/revalidateTag\(PUBLIC_NEWS_CACHE_TAG\)/);
 assert.match(read("src/lib/news-feed-cache.ts"),/PUBLIC_NEWS_CACHE_TAG="bw-public-news"/);
});

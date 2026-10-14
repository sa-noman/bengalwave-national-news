import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const feed=readFileSync("src/lib/news-feed.ts","utf8");
const middleware=readFileSync("src/middleware.ts","utf8");
const image=readFileSync("src/components/news-image.tsx","utf8");

test("Aramco report uses a public-domain headquarters archive photograph",()=>{
 assert.match(feed,/houthi-missile-strike-saudi-aramco-hq-dhahran-oct-2026/);
 assert.ok(feed.includes("https://upload.wikimedia.org/wikipedia/commons/7/7e/AramcoCoreArea.jpg"));
 assert.match(feed,/ফাইল ছবি, হামলার দৃশ্য নয়/);
 assert.match(feed,/Eagleamn \/ Wikimedia Commons/);
});

test("production image policy narrowly allows Wikimedia Commons while keeping other CSP rules",()=>{
 assert.ok(middleware.includes(`? "img-src 'self' data: blob: "+supabaseOrigin+" https://upload.wikimedia.org "+analyticsOrigins`));
 assert.match(middleware,/"default-src 'self'"/);
 assert.match(middleware,/"object-src 'none'"/);
 assert.match(image,/unoptimized=\{useOriginal \|\| \/\^https:/);
});

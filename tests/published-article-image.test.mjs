import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const feed=readFileSync("src/lib/news-feed.ts","utf8");
const article=readFileSync("src/app/news/[slug]/page.tsx","utf8");
test("published Chormonai news displays the actual event photo",()=>{
 assert.ok(existsSync("public/news/charmonai-council-2026.webp"));
 const bytes=readFileSync("public/news/charmonai-council-2026.webp");
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.match(feed,/charmonai-pir-local-election-shariah-oct-2026/);
 assert.match(feed,/\/news\/charmonai-council-2026\.webp/);
 assert.match(article,/ছবি: ইসলামী আন্দোলনের সৌজন্যে/);
});

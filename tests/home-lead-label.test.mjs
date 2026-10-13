import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../src/app/page.tsx",import.meta.url),"utf8");

test("home lead report counter is absent on both mobile and desktop",()=>{
 assert.doesNotMatch(source,/প্রধান প্রতিবেদন\s*\/\s*০১/);
 assert.match(source,/<div className="bw-hero-lead">\s*<NewsCard item=\{lead\} variant="lead"\/>/);
 assert.match(source,/className="bw-hero-label">দেশ ও বিশ্ব/);
});

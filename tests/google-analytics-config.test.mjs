import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("GA4 is opt-in: a valid Measurement ID and Vercel production are both required",()=>{
  const ga=read("src/components/google-analytics.tsx");
  assert.match(ga,/process\.env\.VERCEL_ENV\s*!==\s*"production"/);
  assert.match(ga,/process\.env\.NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  assert.match(ga,/\^G-\[A-Z0-9\]\+/);
  assert.match(ga,/return null;/);
  assert.doesNotMatch(ga,/G-[A-Z0-9]{8,}/,"never hardcode a real GA4 Measurement ID");
});

test("GA4 uses Next.js deferred scripts without modifying page layout",()=>{
  const ga=read("src/components/google-analytics.tsx");
  const layout=read("src/app/layout.tsx");
  assert.match(ga,/from "next\/script"/);
  assert.match(ga,/https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/);
  assert.match(ga,/gtag\('config'/);
  assert.match(ga,/strategy="afterInteractive"/);
  assert.match(layout,/import \{GoogleAnalytics\} from "@\/components\/google-analytics"/);
  assert.match(layout,/<SiteHeader\/>\{children\}<SiteFooter\/><GoogleAnalytics\/>/);
});

test("GA4 environment template is empty and documents production-only activation",()=>{
  const env=read(".env.example");
  assert.match(env,/^NEXT_PUBLIC_GA_MEASUREMENT_ID=\s*$/m);
  assert.match(env,/VERCEL_ENV=production/);
});

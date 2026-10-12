import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const root=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,root),"utf8");

test("GA4 remains production-only and opt-in by deployment ID configuration",()=>{
 const source=read("src/components/google-analytics.tsx");
 assert.match(source,/process\.env\.VERCEL_ENV\s*!==\s*"production"/);
 assert.match(source,/process\.env\.NEXT_PUBLIC_GA_MEASUREMENT_ID/);
 assert.match(source,/return null/);
 assert.match(source,/\^G-\[A-Z0-9\]\+/);
 assert.doesNotMatch(source,/G-[A-Z0-9]{8,}/,"never hardcode the actual Google Analytics measurement ID");
});

test("no popup remains and Google Analytics cookie and ad storage are denied",()=>{
 const source=read("src/components/google-analytics.tsx");
 const layout=read("src/app/layout.tsx");
 assert.match(source,/from "next\/script"/);
 assert.match(source,/gtag\('consent','default'/);
 assert.match(source,/analytics_storage:'denied'/);
 assert.match(source,/ad_storage:'denied'/);
 assert.match(source,/ad_user_data:'denied'/);
 assert.match(source,/ad_personalization:'denied'/);
 assert.match(source,/googletagmanager\.com\/gtag\/js/);
 assert.match(source,/strategy="afterInteractive"/);
 assert.doesNotMatch(source,/AnalyticsConsent|<section|consent-banner/i);
 assert.doesNotMatch(layout,/analytics-consent\.css/);
 assert.ok(!existsSync(new URL("src/components/analytics-consent.tsx",root)));
 assert.ok(!existsSync(new URL("src/app/analytics-consent.css",root)));
});

test("privacy statement reflects cookieless signals and leaves all page sections intact",()=>{
 const layout=read("src/app/layout.tsx");
 const privacy=read("src/app/privacy/page.tsx");
 assert.match(layout,/<SiteHeader\/>\{children\}<SiteFooter\/><GoogleAnalytics\/>/);
 assert.match(privacy,/কুকি ছাড়া সীমিত ভিজিট-সংক্রান্ত সংকেত/);
 assert.doesNotMatch(privacy,/AnalyticsPreferencesButton/);
 assert.match(read(".env.example"),/^NEXT_PUBLIC_GA_MEASUREMENT_ID=\s*$/m);
});

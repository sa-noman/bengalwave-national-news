import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("GA4 requires a valid Measurement ID and production deployment",()=>{
 const server=read("src/components/google-analytics.tsx");
 assert.match(server,/process\.env\.VERCEL_ENV\s*!==\s*"production"/);
 assert.match(server,/process\.env\.NEXT_PUBLIC_GA_MEASUREMENT_ID/);
 assert.match(server,/\^G-\[A-Z0-9\]\+/);
 assert.match(server,/return null/);
 assert.match(server,/<AnalyticsConsent measurementId=\{measurementId\}/);
 assert.doesNotMatch(server,/G-[A-Z0-9]{8,}/,"do not hardcode a real ID");
});

test("Google tag only loads after explicit visitor opt-in",()=>{
 const c=read("src/components/analytics-consent.tsx");
 assert.match(c,/choice==="accepted"&&/);
 assert.match(c,/choice===null\|\|showPreferences/);
 assert.match(c,/window\.localStorage\.setItem\(STORAGE_KEY,value\)/);
 assert.match(c,/if\(value==="rejected"&&wasAccepted\)\{window\.location\.reload\(\);\}/);
 assert.match(c,/googletagmanager\.com\/gtag\/js\?id=/);
 assert.match(c,/analytics_storage:'granted'/);
 assert.match(c,/ad_storage:'denied'/);
 assert.match(c,/ad_user_data:'denied'/);
 assert.match(c,/ad_personalization:'denied'/);
 assert.match(c,/strategy="afterInteractive"/);
});

test("GA4 and privacy controls are included without changing existing sections",()=>{
 const layout=read("src/app/layout.tsx");
 const privacy=read("src/app/privacy/page.tsx");
 assert.match(layout,/import \{GoogleAnalytics\} from "@\/components\/google-analytics"/);
 assert.match(layout,/<SiteHeader\/>\{children\}<SiteFooter\/><GoogleAnalytics\/>/);
 assert.match(layout,/import "\.\/analytics-consent\.css"/);
 assert.match(privacy,/<AnalyticsPreferencesButton\/>/);
 assert.match(read(".env.example"),/^NEXT_PUBLIC_GA_MEASUREMENT_ID=\s*$/m);
});

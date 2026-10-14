import assert from "node:assert/strict";
// Gentle, unauthenticated penetration-style probes against public BengalWave.
// No brute force, writes, credential submission, or unauthorized data access.
const site=(process.env.SECURITY_PROBE_BASE_URL||"https://bengalwave.news").replace(/\/$/,"");
if(!site.startsWith("https://")&&!site.startsWith("http://127.0.0.1:"))
  throw Error("Only HTTPS public target or localhost is permitted");

async function probe(path,{redirect="manual",expected=[200]}={}){
  const res=await fetch(site+path,{redirect,signal:AbortSignal.timeout(20000),headers:{"User-Agent":"BengalWave-SafeSecurityProbe/1.0"}});
  assert.ok(expected.includes(res.status),path+": unexpected HTTP "+res.status);
  return res;
}
const home=await probe("/");
for(const header of ["content-security-policy","x-frame-options","x-content-type-options","strict-transport-security","referrer-policy"]){
  assert.ok(home.headers.get(header),"Missing live header "+header);
}
const csp=home.headers.get("content-security-policy")||"";
assert.ok(csp.includes("frame-ancestors 'none'"),"CSP should prevent third-party framing");
assert.ok(csp.includes("object-src 'none'"),"CSP object embed disabled");
assert.ok(csp.includes("script-src-attr 'none'"),"Inline event-handler attributes denied");
assert.ok(!home.headers.get("x-powered-by"),"Do not disclose Next.js X-Powered-By");
console.log("PASS: live public homepage frame/XSS response protections");

for(const path of ["/admin","/admin/articles/new","/admin/mfa","/admin/set-password"]){
  const res=await probe(path,{expected:[302,303,307,308]});
  assert.match(res.headers.get("location")||"",/\/admin\/login/,"Unauthenticated CMS must redirect to login");
  console.log("PASS: anonymous cannot access "+path);
}
const repeat=await probe("/search?q=security&q=unexpected");
const text=await repeat.text();
assert.ok(!text.includes("Internal Server Error"),"Repeated query parameter must not crash search");
console.log("PASS: repeated search query does not return 500");

const recovery=await probe("/auth/recovery");
assert.equal(recovery.headers.get("referrer-policy"),"no-referrer");
assert.match(recovery.headers.get("cache-control")||"",/no-store/);
assert.match(recovery.headers.get("x-robots-tag")||"",/noindex/);
console.log("PASS: recovery route blocks caching, indexing and referrer leakage");

const conf=await probe("/auth/confirm",{expected:[302,303,307,308]});
assert.match(conf.headers.get("location")||"",/\/admin\/login/);
assert.match(conf.headers.get("cache-control")||"",/no-store/);
console.log("PASS: invalid/no-token recovery confirmation is rejected safely");
console.log("PASS: all non-destructive public security boundary probes");

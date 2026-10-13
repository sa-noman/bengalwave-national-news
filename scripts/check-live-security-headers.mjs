import assert from "node:assert/strict";
const origin="https://bengalwave.news";
async function read(path) {
  let last;
  for(let attempt=1;attempt<=4;attempt++){
    try {
      const res=await fetch(origin+path,{
        redirect:"follow",
        headers:{"user-agent":"BengalWave-Live-Security-Check/1.0"},
        signal:AbortSignal.timeout(20000),
        cache:"no-store",
      });
      const body=await res.text();
      if(res.status>=500)throw new Error("Server HTTP "+res.status+" for "+path);
      return {res,body};
    } catch(e) {
      last=e;
      if(attempt<4)await new Promise(r=>setTimeout(r,attempt*1250));
    }
  }
  throw last;
}
function validateHeaders(path,h){
  for(const name of ["content-security-policy","strict-transport-security","x-content-type-options","x-frame-options","referrer-policy","permissions-policy"]){
    assert.ok(h.get(name),path+" missing LIVE "+name);
  }
  assert.equal(h.get("x-content-type-options"),"nosniff",path+" MIME sniff protection");
  assert.equal(h.get("x-frame-options"),"DENY",path+" frame protection");
  assert.match(h.get("strict-transport-security"),/max-age=\d+/i,path+" HSTS max-age");
  assert.ok(Number(h.get("strict-transport-security").match(/max-age=(\d+)/)?.[1]||0)>=31536000,path+" HSTS 1y");
  const csp=h.get("content-security-policy");
  for(const rule of ["default-src 'self'","object-src 'none'","frame-ancestors 'none'","font-src 'self'","form-action 'self'"]){
    assert.ok(csp.includes(rule),path+" CSP missing "+rule);
  }
  assert.ok(!h.has("x-powered-by"),path+" must not disclose Next.js server");
}
for(const path of ["/","/latest","/category/national","/admin/login"]){
  const {res,body}=await read(path);
  assert.equal(res.status,200,"HTTP status "+path);
  assert.equal(new URL(res.url).host,"bengalwave.news",path+" must remain on production domain");
  validateHeaders(path,res.headers);
  if(path==="/"){
    assert.match(body,/<meta name="robots" content="index, follow"/i);
    assert.doesNotMatch(body,/<meta name="robots" content="noindex/i);
  }
  if(path==="/admin/login")assert.match(body,/<meta name="robots" content="noindex/i);
  console.log("PASS live",path,"HTTP 200, six security headers and relevant indexing rules");
}
const robots=await read("/robots.txt");
assert.equal(robots.res.status,200);
assert.match(robots.body,/^Allow: \/$/m);
assert.match(robots.body,/^Disallow: \/admin\//m);
assert.match(robots.body,/^Sitemap: https:\/\/bengalwave\.news\/sitemap\.xml$/m);
console.log("PASS live robots.txt public SEO crawl and private exclusions");
const sitemap=await read("/sitemap.xml");
assert.equal(sitemap.res.status,200);
assert.match(sitemap.body,/<loc>https:\/\/bengalwave\.news\/?<\/loc>/);
console.log("PASS live sitemap.xml");
const locked=await fetch(origin+"/admin",{redirect:"manual",signal:AbortSignal.timeout(20000)});
assert.ok([302,303,307,308].includes(locked.status),"Unauthenticated /admin must redirect");
assert.match(locked.headers.get("location")||"",/\/admin\/login/);
validateHeaders("/admin",locked.headers);
console.log("PASS live unauthenticated admin redirect and live response security headers");
console.log("PASS all independent live BengalWave HTTP security checks");

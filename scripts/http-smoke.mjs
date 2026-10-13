import assert from "node:assert/strict";
const base=process.env.SMOKE_BASE_URL||"http://127.0.0.1:3100";
const mode=process.env.SMOKE_MODE||"preview";
async function get(path){
 let last;
 for(let i=0;i<40;i++){
  try{
   const response=await fetch(base+path,{signal:AbortSignal.timeout(5000)});
   return {response,text:await response.text()};
  }catch(e){last=e;await new Promise(r=>setTimeout(r,500));}
 }
 throw last;
}
function ok(code,expected,path){assert.equal(code,expected,path+" HTTP status");}
const homepage=await get("/");
ok(homepage.response.status,200,"/");
for(const header of ["content-security-policy","strict-transport-security","x-content-type-options","x-frame-options","referrer-policy"]){
 assert.ok(homepage.response.headers.get(header),"Missing "+header);
}
const csp=homepage.response.headers.get("content-security-policy")||"";
assert.ok(csp.includes("frame-ancestors 'none'"),"iframe protection");
assert.ok(csp.includes("font-src 'self'"),"self hosted fonts allowed");
if(mode==="production"){
 assert.match(homepage.text,/<meta name="robots" content="index, follow"/i);
 assert.doesNotMatch(homepage.text,/<meta name="robots" content="noindex/i);
 console.log("PASS /: 200, production index/follow and required security response headers");
}else{
 assert.match(homepage.text,/<meta name="robots" content="noindex, nofollow"/i);
 console.log("PASS /: 200, preview noindex and required security response headers");
}

const robots=await get("/robots.txt");
ok(robots.response.status,200,"/robots.txt");
const sitemap=await get("/sitemap.xml");
ok(sitemap.response.status,200,"/sitemap.xml");
if(mode==="production"){
 assert.match(robots.text,/^Allow: \/$/m);
 assert.doesNotMatch(robots.text,/^Disallow: \/$/m);
 assert.match(robots.text,/^Disallow: \/admin\//m);
 assert.match(robots.text,/^Sitemap: https:\/\/bengalwave.news\/sitemap.xml$/m);
 console.log("PASS /robots.txt: production public crawl allowed and admin excluded");
 assert.match(sitemap.text,/<loc>https:\/\/bengalwave.news\/?<\/loc>/);
 assert.match(sitemap.text,/category\/national/);
 console.log("PASS /sitemap.xml: production homepage and categories present");
}else{
 assert.match(robots.text,/^Disallow: \/$/m);
 console.log("PASS /robots.txt: preview blocked");
 assert.doesNotMatch(sitemap.text,/<loc>https:\/\/bengalwave.news\/news\//);
 console.log("PASS /sitemap.xml: preview stories excluded");
}
const login=await get("/admin/login");
ok(login.response.status,200,"/admin/login");
assert.match(login.text,/noindex/);
console.log("PASS /admin/login: accessible page with noindex");
for(const route of ["/latest","/category/national"]){
 const result=await get(route);
 ok(result.response.status,200,route);
 console.log("PASS",route);
}
console.log("All local HTTP smoke checks passed.");

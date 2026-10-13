import assert from "node:assert/strict";
const base=process.env.SMOKE_BASE_URL||"http://127.0.0.1:3100";
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
assert.match(homepage.text,/<meta name="robots" content="noindex, nofollow"/i);
console.log("PASS /: 200, preview noindex and required security response headers");

const robots=await get("/robots.txt");
ok(robots.response.status,200,"/robots.txt");
assert.match(robots.text,/Disallow: \//);
console.log("PASS /robots.txt: preview blocked");
const sitemap=await get("/sitemap.xml");
ok(sitemap.response.status,200,"/sitemap.xml");
assert.doesNotMatch(sitemap.text,/<loc>https:\/\/bengalwave\.news\/news\//);
console.log("PASS /sitemap.xml: no preview/sample article URLs");
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

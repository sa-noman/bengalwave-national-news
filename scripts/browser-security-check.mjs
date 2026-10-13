import assert from "node:assert/strict";
import {chromium} from "playwright";

// Run against a locally started, fully built Next.js Preview app, in a new
// Chromium context with no installed extensions and no persisted cookies.
const origin=process.env.BROWSER_SMOKE_URL||"http://127.0.0.1:3201";
const viewports=[
 {name:"desktop",width:1440,height:900},
 {name:"mobile",width:390,height:844},
];
const routes=["/","/latest","/category/national","/admin/login"];
const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-extensions"]});
let count=0;
try {
 for(const viewport of viewports){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
  for(const route of routes){
   const page=await context.newPage();
   const forbiddenFonts=[];
   const cspErrors=[];
   page.on("request",req=>{
    const url=req.url();
    if(/fonts\.googleapis\.com|fonts\.gstatic\.com|frontend-cdn\.perplexity\.ai/i.test(url)){
      forbiddenFonts.push(url);
    }
   });
   page.on("console",message=>{
    if(message.type()==="error" && /content security policy|violates the following|refused to load/i.test(message.text()))
      cspErrors.push(message.text().slice(0,320));
   });
   const response=await page.goto(origin+route,{waitUntil:"networkidle",timeout:60000});
   assert.equal(response?.status(),200,route+" must render");
   const h=response.headers();
   for(const name of ["content-security-policy","strict-transport-security","x-content-type-options","x-frame-options","referrer-policy"]){
    assert.ok(h[name],route+" missing "+name);
   }
   assert.match(h["content-security-policy"],/frame-ancestors 'none'/);
   assert.equal(h["x-content-type-options"],"nosniff");
   await page.evaluate(()=>document.fonts.ready);
   const matchingFonts=await page.evaluate(()=>{
     const entries=[...document.fonts].filter(font=>font.family.toLowerCase().includes("noto serif bengali"));
     return entries.filter(font=>font.status==="loaded").length;
   });
   assert.ok(matchingFonts>0,route+": expected self-hosted Bengali font files to load");
   assert.deepEqual(forbiddenFonts,[],route+": external font requests detected");
   assert.deepEqual(cspErrors,[],route+": browser CSP console errors detected");
   if(route==="/admin/login"){
     const content=await page.locator('meta[name="robots"]').getAttribute("content");
     assert.match(content||"",/noindex/);
   }
   console.log("PASS",viewport.name,route,"headers, font delivery and clean extension-free CSP");
   count++;
   await page.close();
  }
  // A fresh browser with no cookies must be rejected by all CMS pages.
  for(const protectedPath of ["/admin","/admin/articles/new"]){
   const response=await context.request.get(origin+protectedPath,{maxRedirects:0});
   assert.ok([302,303,307,308].includes(response.status()),protectedPath+" must redirect");
   assert.match(response.headers()["location"]||"",/\/admin\/login/);
   console.log("PASS",viewport.name,protectedPath,"unauthenticated redirect");
   count++;
  }
  await context.close();
 }
} finally{await browser.close();}
console.log("PASS "+count+" extension-free browser and unauthorized CMS checks");

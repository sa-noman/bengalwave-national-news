import assert from "node:assert/strict";
import {chromium} from "playwright";

const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-extensions"]});
try{
  for(const viewport of [{width:1440,height:900,name:"desktop"},{width:390,height:844,name:"mobile"}]){
    const page=await browser.newPage({viewport,deviceScaleFactor:1});
    const jsErrors=[];
    const cspErrors=[];
    const requested=[];
    page.on("pageerror",e=>jsErrors.push(e.message));
    page.on("console",m=>{if(m.type()==="error" && /content security policy|refused to load/i.test(m.text()))cspErrors.push(m.text())});
    page.on("request",r=>{if(r.url().startsWith("https://challenges.cloudflare.com/"))requested.push(r.url().split("?")[0]);});
    const res=await page.goto("https://bengalwave.news/admin/login",{waitUntil:"domcontentloaded",timeout:60000});
    assert.equal(res?.status(),200,"login page must return HTTP 200");
    const csp=res.headers()["content-security-policy"]||"";
    assert.match(csp,/frame-src https:\/\/challenges\.cloudflare\.com/,"Turnstile frame must be explicitly allowed in CSP");
    assert.match(csp,/script-src .*https:\/\/challenges\.cloudflare\.com/,"Cloudflare script must be allowed in CSP");
    assert.equal(await page.locator('input[name="email"]').count(),1);
    assert.equal(await page.locator('input[name="password"]').count(),1);
    assert.equal(await page.locator('input[name="cf-turnstile-response"]').count(),1,"captcha hidden input must render");
    await page.waitForFunction(()=>typeof window.turnstile?.render==="function",{timeout:30000}).catch(e=>{throw new Error("Cloudflare Turnstile JavaScript did not initialize: "+e.message)});
    assert.ok(requested.length>0,"Cloudflare browser client was not fetched");
    assert.deepEqual(cspErrors,[],"CSP must allow Cloudflare widget");
    assert.deepEqual(jsErrors,[],"Login widget must not crash");
    console.log("PASS "+viewport.name+" live Cloudflare client, invisible Turnstile input and CSP (NOT proof of successful login)");
    await page.close();
  }
  const page=await browser.newPage();
  const home=await page.goto("https://bengalwave.news/",{waitUntil:"domcontentloaded",timeout:60000});
  assert.equal(home?.status(),200);
  console.log("PASS public homepage unaffected");
  await page.close();
}finally{await browser.close();}

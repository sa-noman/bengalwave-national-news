import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {chromium} from "playwright";

// Secure real-time expiry test of BengalWave production.
// Credentials and session tokens must NEVER be logged or included in artifacts.
const site="https://bengalwave.news";
const email="abdullah.omar0025@gmail.com";
const password=process.env.BW_TEST_PASSWORD;
if(!password){
  console.error("BLOCKED: configure GitHub Actions repository secret BW_TEST_PASSWORD.");
  process.exit(2);
}
const fingerprint=s=>createHash("sha256").update(s).digest("hex");
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function readSession(cookies){
  const parts=cookies.filter(c=>/^sb-[a-z0-9]+-auth-token(?:\.\d+)?$/.test(c.name));
  assert.ok(parts.length,"No Supabase auth cookie found after CMS login");
  parts.sort((a,b)=>{
    const n=c=>Number(c.name.split(".").at(-1));
    return (a.name.includes(".")?n(a):0)-(b.name.includes(".")?n(b):0);
  });
  const value=parts.map(c=>c.value).join("");
  const decoded=value.startsWith("base64-")
    ?Buffer.from(value.slice(7),"base64url").toString("utf8")
    :decodeURIComponent(value);
  const session=JSON.parse(decoded);
  const accessToken=session.access_token;
  assert.equal(typeof accessToken,"string","Supabase cookie must contain an access token");
  assert.ok(session.refresh_token,"Supabase cookie must contain refresh token");
  const segments=accessToken.split(".");
  assert.equal(segments.length,3,"Access token must be a JWT");
  const payload=JSON.parse(Buffer.from(segments[1],"base64url").toString("utf8"));
  assert.ok(Number.isInteger(payload.exp),"JWT must have expiry");
  return {tokenHash:fingerprint(accessToken),expires:payload.exp*1000};
}

async function login(){
  const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-extensions"]});
  try{
    const context=await browser.newContext({viewport:{width:1366,height:768}});
    const page=await context.newPage();
    const landing=await page.goto(site+"/admin/login",{waitUntil:"domcontentloaded",timeout:60000});
    assert.equal(landing?.status(),200,"Production login endpoint must be available");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await Promise.all([
      page.waitForURL(u=>u.pathname==="/admin",{timeout:60000}),
      page.locator('button[type="submit"]').click(),
    ]);
    assert.match(await page.locator("body").innerText(),/contributor/i,"Authenticated contributor CMS dashboard must load");
    const before=readSession(await context.cookies(site));
    const state=await context.storageState();
    console.log("PASS: live production contributor login, authentic unexpired Supabase JWT");
    return {before,state};
  }finally{await browser.close();}
}

async function afterNaturalExpiry(before,state){
  const now=Date.now();
  assert.ok(before.expires>now,"Token must initially be valid");
  const elapsed=before.expires-now;
  assert.ok(elapsed<85*60_000,"JWT lifetime longer than the safe 85-minute limit");
  const waitUntil=before.expires+75_000;
  console.log("Waiting for the real JWT expiration (about "+Math.ceil((waitUntil-now)/60000)+" minutes). No TTL or clock modification.");
  while(Date.now()<waitUntil){
    const ms=Math.min(waitUntil-Date.now(),4*60_000);
    await sleep(ms);
    console.log("Natural-expiry test still waiting; approximately "+Math.max(0,Math.ceil((waitUntil-Date.now())/60000))+" minutes remaining.");
  }
  assert.ok(Date.now()>before.expires+60_000,"Original token must truly be expired");
  const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-extensions"]});
  try{
    const context=await browser.newContext({storageState:state,viewport:{width:1366,height:768}});
    const page=await context.newPage();
    // A real new browser with its actual session cookies after access JWT expiry.
    const response=await page.goto(site+"/admin",{waitUntil:"domcontentloaded",timeout:60000});
    assert.equal(response?.status(),200,"Admin page must return 200 after natural JWT expiry");
    assert.equal(new URL(page.url()).pathname,"/admin","CMS middleware must keep user logged in");
    assert.match(await page.locator("body").innerText(),/contributor/i,"Authenticated dashboard must still load");
    const after=readSession(await context.cookies(site));
    assert.notEqual(after.tokenHash,before.tokenHash,"Access JWT must rotate after real expiry");
    assert.ok(after.expires>Date.now()+5*60_000,"New access JWT must have future expiration");
    console.log("PASS: JWT really expired by clock, production CMS middleware renewed session and rotated JWT without new password");
    console.log("PASS: returning contributor dashboard continued after natural access-token expiry");
    await context.close();
  }finally{await browser.close();}
}

const {before,state}=await login();
await afterNaturalExpiry(before,state);
console.log("PASS: complete real natural-expiration E2E check (no simulated expiry).");

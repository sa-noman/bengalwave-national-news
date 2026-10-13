import assert from "node:assert/strict";
import {chromium} from "playwright";
import {createClient} from "@supabase/supabase-js";

// Credentials must come from GitHub Actions Secrets. Never log a password,
// JWT, refresh token, cookies or HTTP authorization headers.
const email=process.env.BW_TEST_EMAIL;
const password=process.env.BW_TEST_PASSWORD;
const url=process.env.BW_SUPABASE_URL;
const publishableKey=process.env.BW_SUPABASE_PUBLISHABLE_KEY;
const site=process.env.BW_TEST_SITE_URL||"https://bengalwave.news";
if(!email || !password || !url || !publishableKey){
  console.error("BLOCKED: BW_TEST_EMAIL/BW_TEST_PASSWORD or Supabase connection is not configured.");
  process.exit(2);
}
if(!site.startsWith("https://"))throw Error("HTTPS site required");

async function testSupabaseRefresh(){
  const client=createClient(url,publishableKey,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
  const {data,error}=await client.auth.signInWithPassword({email,password});
  assert.ifError(error);
  assert.ok(data.session?.refresh_token,"Supabase login must issue a refresh token");
  const {data:renewed,error:refreshError}=await client.auth.refreshSession({
    refresh_token:data.session.refresh_token,
  });
  assert.ifError(refreshError);
  assert.ok(renewed.session?.access_token,"New access token must exist");
  assert.ok(renewed.session?.refresh_token,"New refresh token must exist");
  const {data:userData,error:userError}=await client.auth.getUser();
  assert.ifError(userError);
  assert.equal(userData.user?.email?.toLowerCase(),email.toLowerCase());
  // Local sign-out only avoids disturbing unrelated sessions for the test user.
  const {error:exitError}=await client.auth.signOut({scope:"local"});
  assert.ifError(exitError);
  const {data:local}=await client.auth.getSession();
  assert.equal(local.session,null,"SDK session must be cleared");
  console.log("PASS: real Supabase password sign-in, refresh-token rotation, user validation and local sign-out");
}

async function testWebsite(){
  const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-extensions"]});
  try {
    const context=await browser.newContext({viewport:{width:1366,height:768}});
    const page=await context.newPage();
    const login=await page.goto(site+"/admin/login",{waitUntil:"domcontentloaded",timeout:45000});
    assert.equal(login?.status(),200,"Live login form must render");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await Promise.all([
      page.waitForURL(u=>u.pathname==="/admin",{timeout:45000}),
      page.locator('button[type="submit"]').click(),
    ]);
    assert.match(await page.locator("body").innerText(),/contributor/i,"Correct CMS contributor identity");
    console.log("PASS: actual website login and contributor dashboard");

    await page.reload({waitUntil:"domcontentloaded"});
    assert.equal(new URL(page.url()).pathname,"/admin","Refresh must preserve authenticated session");
    console.log("PASS: persisted CMS session after full page reload");

    const logout=page.getByRole("button",{name:"লগআউট"});
    await Promise.all([
      page.waitForURL(u=>u.pathname==="/admin/login",{timeout:45000}),
      logout.click(),
    ]);
    await page.goto(site+"/admin",{waitUntil:"domcontentloaded"});
    assert.equal(new URL(page.url()).pathname,"/admin/login","Old session must not re-enter CMS");
    console.log("PASS: logout and denied dashboard access with old browser session");
    await context.close();
  }finally{await browser.close();}
}

await testSupabaseRefresh();
await testWebsite();
console.log("All authorized real-account authentication E2E checks passed.");

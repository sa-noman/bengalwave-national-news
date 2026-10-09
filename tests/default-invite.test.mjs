import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("default Supabase invite redirects are supported as token fragments",()=>{
 const callback=read("src/components/auth/auth-return-handler.tsx");
 assert.match(callback,/fragment\.get\("access_token"\)/);
 assert.match(callback,/fragment\.get\("refresh_token"\)/);
 assert.match(callback,/supabase\.auth\.setSession/);
 assert.match(callback,/window\.history\.replaceState/);
 assert.match(callback,/supabase\.auth\.getUser/);
 assert.doesNotMatch(callback,/console\.log/);
});
test("SSR auth code exchange is supported",()=>{
 assert.match(read("src/components/auth/auth-return-handler.tsx"),/exchangeCodeForSession/);
 assert.match(read("src/app/auth/complete/page.tsx"),/AuthReturnHandler/);
});
test("original website root can forward invitation fragments without server access",()=>{
 assert.match(read("src/app/page.tsx"),/HomeInvitationRedirect/);
 assert.match(read("src/components/auth/home-invitation-redirect.tsx"),/location\.replace/);
});
test("owner permissions are never granted from invite callback",()=>{
 assert.doesNotMatch(read("src/components/auth/auth-return-handler.tsx"),/from\(["']profiles["']\)/);
});

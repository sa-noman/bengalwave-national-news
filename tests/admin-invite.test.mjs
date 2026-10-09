import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("invitation token verification uses the Supabase SSR auth client",()=>{
 const route=read("src/app/auth/confirm/route.ts");
 assert.match(route,/verifyOtp\(/);
 assert.match(route,/createSupabaseServerClient/);
 assert.match(route,/\["invite","recovery"\]/);
 assert.doesNotMatch(route,/next=/);
});
test("setting invited password requires a confirmed authenticated user",()=>{
 const action=read("src/app/admin/set-password/actions.ts");
 assert.match(action,/auth\.getUser\(\)/);
 assert.match(action,/user\.email_confirmed_at/);
 assert.match(action,/auth\.updateUser\(\{password\}\)/);
 assert.match(action,/password\.length<12/);
});
test("account onboarding does not assign owner role or log passwords",()=>{
 const files=["src/app/auth/confirm/route.ts","src/app/admin/set-password/actions.ts"];
 for(const file of files) {
   const source=read(file);
   assert.doesNotMatch(source,/\.from\(["']profiles["']\)/);
   assert.doesNotMatch(source,/console\.log\(/);
 }
});
test("login handles expired invitation",()=>{
 assert.match(read("src/app/admin/login/page.tsx"),/invite:"আমন্ত্রণের/);
});

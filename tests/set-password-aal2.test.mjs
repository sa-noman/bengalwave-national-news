import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("password change requires AAL2 when the account has enrolled MFA",()=>{
 const action=read("src/app/admin/set-password/actions.ts");
 assert.match(action,/supabase\.auth\.mfa\.getAuthenticatorAssuranceLevel\(\)/);
 assert.match(action,/aalError \|\| !aal \|\| \(aal\.nextLevel==="aal2" && aal\.currentLevel!=="aal2"\)\) redirect\("\/admin\/mfa"\)/);
 // The AAL check must run before the password is read or changed.
 assert.ok(action.indexOf("getAuthenticatorAssuranceLevel")<action.indexOf("updateUser({password})"));
});

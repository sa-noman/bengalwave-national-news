import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync(new URL('../src/lib/auth/turnstile.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
new Function('require','module','exports',code)(()=>({}),module,module.exports);
const {loginCaptcha}=module.exports;
test('CAPTCHA modes fail closed, validate provider claims and consume tokens only once',async()=>{
  const keys=['BW_LOGIN_CAPTCHA_MODE','TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','TURNSTILE_ALLOWED_HOSTNAMES'];
  const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
  const originalFetch=global.fetch;let calls=0;
  let payload={success:true,hostname:'isolated.example',action:'admin_login'};
  global.fetch=async(url,options)=>{
    calls++;assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(options.cache,'no-store');assert.ok(options.signal instanceof AbortSignal);
    return {ok:true,json:async()=>payload};
  };
  try{
    delete process.env.BW_LOGIN_CAPTCHA_MODE;
    assert.deepEqual(await loginCaptcha(null),{ok:true});assert.equal(calls,0);
    for(const mode of ['typo','', 'GATEWAY']){process.env.BW_LOGIN_CAPTCHA_MODE=mode;assert.deepEqual(await loginCaptcha('token'),{ok:false});}
    process.env.BW_LOGIN_CAPTCHA_MODE='gateway';
    process.env.TURNSTILE_SITE_KEY='test-site';process.env.TURNSTILE_SECRET_KEY='test-secret';
    process.env.TURNSTILE_ALLOWED_HOSTNAMES='isolated.example';
    for(const token of [null,'','x'.repeat(2049),new File(['bad'],'token')])assert.deepEqual(await loginCaptcha(token),{ok:false});
    assert.equal(calls,0);
    assert.deepEqual(await loginCaptcha('token'),{ok:true});assert.equal(calls,1);
    for(const wrong of [{success:false,hostname:'isolated.example',action:'admin_login'},{success:true,hostname:'evil.example',action:'admin_login'},{success:true,hostname:'isolated.example',action:'other'},null]){
      payload=wrong;assert.deepEqual(await loginCaptcha('token'),{ok:false});
    }
    for(const reason of ['invalid-input-response','timeout-or-duplicate','internal-error']){
      payload={success:false,'error-codes':[reason]};assert.deepEqual(await loginCaptcha('token'),{ok:false});
    }
    global.fetch=async()=>({ok:false});assert.deepEqual(await loginCaptcha('token'),{ok:false});
    global.fetch=async()=>{throw new DOMException('timeout','TimeoutError');};assert.deepEqual(await loginCaptcha('token'),{ok:false});
    process.env.BW_LOGIN_CAPTCHA_MODE='supabase';
    assert.deepEqual(await loginCaptcha('unconsumed-token'),{ok:true,captchaToken:'unconsumed-token'});
    delete process.env.TURNSTILE_SITE_KEY;assert.deepEqual(await loginCaptcha('token'),{ok:false});
  }finally{
    global.fetch=originalFetch;
    for(const key of keys){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}
  }
});

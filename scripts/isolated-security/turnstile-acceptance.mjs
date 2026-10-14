import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,appendFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
import {createServer,request} from 'node:http';
import {randomBytes,randomUUID,createHash,createHmac} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {chromium} from 'playwright';
// Official public test fixtures: they cannot validate real Production tokens.
const dummy='XXXX.DUMMY.TOKEN.XXXX';
const testSecrets=['1x0000000000000000000000000000000AA','2x0000000000000000000000000000000AA','3x0000000000000000000000000000000AA'];
const results=[];let phase='initialization';
const pass=label=>{results.push(label);console.log('PASS: '+label);};
const status=JSON.parse(readFileSync(join(process.env.BW_ISOLATED_ROOT,'status.json'),'utf8'));
const api='http://127.0.0.1:54321', origin='http://127.0.0.1:3301';
assert.equal(status.API_URL,api);assert.ok(status.ANON_KEY&&status.SERVICE_ROLE_KEY);
for(const value of [status.ANON_KEY,status.SERVICE_ROLE_KEY])console.log('::add-mask::'+value);
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(api,status.SERVICE_ROLE_KEY,options),anon=createClient(api,status.ANON_KEY,options);
const check=(r,label)=>{assert.equal(r.error,null,label);return r.data;};
const sql=q=>execFileSync('docker',['exec','-i','supabase_db_bw-turnstile-ci','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-At'],{input:q,stdio:['pipe','pipe','pipe'],encoding:'utf8'});
function totp(secret){const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const c of secret.replace(/=+$/,''))bits+=alphabet.indexOf(c).toString(2).padStart(5,'0');const bytes=Buffer.from((bits.match(/.{8}/g)||[]).map(b=>parseInt(b,2)));const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const digest=createHmac('sha1',bytes).update(counter).digest();return ((digest.readUInt32BE(digest[19]&15)&0x7fffffff)%1000000).toString().padStart(6,'0');}
let browser;const children=[];let proxy;
try{
 phase='real Cloudflare Siteverify';
 for(let i=0;i<testSecrets.length;i++){
  const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:testSecrets[i],response:dummy}),signal:AbortSignal.timeout(30000)});
  assert.equal(r.status,200);const data=await r.json();assert.equal(data.success,i===0);
  if(i===2)assert.ok(data['error-codes'].includes('timeout-or-duplicate'));
 }
 pass('Real Cloudflare Siteverify official pass, fail and spent-token fixtures');
 phase='isolated provider protection';
 const email='bw-captcha-'+randomUUID()+'@example.test',password=randomBytes(24).toString('hex');
 const user=check(await admin.auth.admin.createUser({email,password,email_confirm:true}),'disposable user').user;
 check(await admin.from('profiles').insert({id:user.id,role:'owner',is_active:true}),'isolated owner profile');
 sql('update private.cms_mfa_policy set require_editor_aal2=true;');
 const attestation=randomBytes(32).toString('hex');
 sql("insert into private.editor_login_rate_limit_guard(id,secret_digest) values(1,'"+createHash('sha256').update(attestation).digest('hex')+"') on conflict(id) do update set secret_digest=excluded.secret_digest;");
 assert.ok((await anon.auth.signInWithPassword({email,password})).error,'Direct Auth without CAPTCHA must fail');
 assert.ok((await anon.auth.signInWithPassword({email,password,options:{captchaToken:'invalid-test-token'}})).error,'Invalid CAPTCHA must fail');
 const seed=createClient(api,status.ANON_KEY,options);
 check(await seed.auth.signInWithPassword({email,password,options:{captchaToken:dummy}}),'provider verified login');
 const factor=check(await seed.auth.mfa.enroll({factorType:'totp',friendlyName:'CAPTCHA acceptance'}),'enroll test MFA');
 const verifiedCounter=Math.floor(Date.now()/30000);
 check(await seed.auth.mfa.challengeAndVerify({factorId:factor.id,code:totp(factor.totp.secret)}),'verify test MFA');
 pass('Real Supabase provider blocks direct Auth bypass and accepts verified CAPTCHA');
 phase='application setup';
 const env={...process.env,NEXT_PUBLIC_SUPABASE_URL:origin,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:status.ANON_KEY,EDITOR_LOGIN_RATE_LIMIT_SECRET:attestation,VERCEL_ENV:'preview',BW_LOGIN_CAPTCHA_MODE:'supabase',TURNSTILE_SITE_KEY:'1x00000000000000000000BB'};
 // A same-origin LOOPBACK proxy permits the browser to use local Supabase
 // without weakening the application's CSP or certificate validation.
 proxy=createServer((incoming,outgoing)=>{
  const isApi=/^\/(auth|rest|storage)\/v1\//.test(incoming.url||'');
  const upstream=request({hostname:'127.0.0.1',port:isApi?54321:3300,path:incoming.url,method:incoming.method,headers:incoming.headers},response=>{outgoing.writeHead(response.statusCode||502,response.headers);response.pipe(outgoing);});
  upstream.on('error',()=>{outgoing.writeHead(502);outgoing.end();});incoming.pipe(upstream);
 });
 await new Promise(r=>proxy.listen(3301,'127.0.0.1',r));
 execFileSync(process.execPath,['node_modules/next/dist/bin/next','build'],{env,stdio:'pipe',timeout:240000});
 for(const [port,mode] of [[3300,'supabase'],[3302,'off']]){
  const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port)],{env:{...env,BW_LOGIN_CAPTCHA_MODE:mode},stdio:'ignore'});children.push(child);
 }
 for(let i=0;i<60;i++){try{if((await fetch(origin+'/admin/login')).ok&&(await fetch('http://127.0.0.1:3302/admin/login')).ok)break;}catch{}if(i===59)throw Error('Local application unavailable');await new Promise(r=>setTimeout(r,500));}
 browser=await chromium.launch({headless:true});
 phase='unchanged login UI';
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const enabled=await browser.newPage({viewport,colorScheme:'light',reducedMotion:'reduce'}),disabled=await browser.newPage({viewport,colorScheme:'light',reducedMotion:'reduce'});
  for(const [page,base] of [[enabled,origin],[disabled,'http://127.0.0.1:3302']]){await page.goto(base+'/admin/login',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);}
  assert.deepEqual(await enabled.locator('.auth-panel').screenshot(),await disabled.locator('.auth-panel').screenshot(),'Invisible CAPTCHA must not change login pixels');
  await enabled.close();await disabled.close();
 }
 pass('Desktop/mobile login pixels identical with Invisible CAPTCHA off/on');
 phase='real browser login and MFA';
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const csp=[];page.on('console',message=>{if(/violates.*Content Security Policy|Refused to (load|connect|frame)/i.test(message.text()))csp.push('CSP rejection');});
 await page.goto(origin+'/admin/login',{waitUntil:'networkidle'});
 await page.getByLabel('ইমেইল',{exact:true}).fill(email);
 await page.getByLabel('পাসওয়ার্ড',{exact:true}).fill('deliberately-incorrect-test-password');
 await page.getByRole('button',{name:'প্রবেশ করুন',exact:true}).click();
 await page.waitForURL('**/admin/login?error=credentials',{timeout:45000});
 await page.getByLabel('ইমেইল',{exact:true}).fill(email);
 await page.getByLabel('পাসওয়ার্ড',{exact:true}).fill(password);
 await page.getByRole('button',{name:'প্রবেশ করুন',exact:true}).click();
 await page.waitForURL('**/admin/mfa',{timeout:45000});
 await page.getByLabel('Authenticator Code',{exact:true}).waitFor({state:'visible'});
 if(Math.floor(Date.now()/30000)===verifiedCounter)await new Promise(r=>setTimeout(r,31000-(Date.now()%30000)));
 await page.getByLabel('Authenticator Code',{exact:true}).fill(totp(factor.totp.secret));
 await page.getByRole('button',{name:'যাচাই করুন',exact:true}).click();
 await page.waitForURL(origin+'/admin',{timeout:45000});
 assert.equal(csp.length,0);await page.close();
 pass('Real Invisible widget, failed-password retry, server action, mandatory TOTP and CMS login');
 phase='provider CAPTCHA recovery compatibility';
 assert.ok((await anon.auth.resetPasswordForEmail(email)).error,'Direct recovery without CAPTCHA must fail');
 check(await anon.auth.resetPasswordForEmail(email,{captchaToken:dummy}),'CAPTCHA-protected recovery email');
 let html;
 for(let i=0;i<30;i++){const response=await fetch('http://127.0.0.1:54324/view/latest.html?query='+encodeURIComponent('to:'+email));if(response.ok){html=await response.text();break;}await new Promise(r=>setTimeout(r,300));}
 const hash=html?.match(/token_hash=([^&"\s<]+)/)?.[1];assert.ok(hash,'Actual SMTP token-hash message');
 const response=await fetch(origin+'/auth/confirm?type=recovery&token_hash='+encodeURIComponent(hash),{redirect:'manual'});
 assert.equal(response.status,307);assert.equal(new URL(response.headers.get('location')).pathname,'/admin/set-password');
 assert.ok(response.headers.getSetCookie().length);
 pass('Provider CAPTCHA recovery request, SMTP delivery and existing token-hash callback work together');
 const path=join(mkdtempSync(join(tmpdir(),'bw-captcha-results-')),'results.json');
 writeFileSync(path,JSON.stringify({kind:'official Cloudflare TEST keys + real isolated Supabase/browser',passed:results,productionWidgetVerified:false},null,2));
 appendFileSync(process.env.GITHUB_ENV,'BW_CAPTCHA_RESULTS='+path+'\n');
}catch(error){
 // No passwords, OTPs, cookies, tokens or recovery URLs in failure output.
 console.error('FAIL: '+phase+' ('+(error?.name||'Error')+')');process.exitCode=1;
}finally{
 await browser?.close();for(const child of children)child.kill();proxy?.closeAllConnections();proxy?.close();
}

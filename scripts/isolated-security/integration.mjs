import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {randomBytes,randomUUID,createHmac} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import sharp from 'sharp';
import ts from 'typescript';
const nativeRequire=createRequire(import.meta.url);
const status=JSON.parse(readFileSync('/tmp/bw-local-status.json','utf8'));
const url=status.API_URL, key=status.ANON_KEY, secret=status.SERVICE_ROLE_KEY;
assert.equal(new URL(url).hostname,'127.0.0.1','Tests accept only runner-loopback services');
assert.ok(key&&secret,'Local credentials required');
for(const value of [key,secret])console.log('::add-mask::'+value);
process.env.NEXT_PUBLIC_SUPABASE_URL=url;
process.env.SUPABASE_UPLOAD_SECRET_KEY=secret;
process.env.BW_STRICT_UPLOAD_GATEWAY='true';process.env.VERCEL_ENV='preview';
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(url,secret,options),anon=createClient(url,key,options);
const check=(r,label)=>{assert.equal(r.error,null,label);return r.data;};
const report=[]; const pass=label=>{report.push(label);console.log('PASS: '+label);};
function sql(query){return execFileSync('docker',['exec','-i','supabase_db_bw-security-ci','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-At'],{input:query,encoding:'utf8',stdio:['pipe','pipe','pipe']});}
function load(path){const code=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const module={exports:{}};new Function('require','module','exports',code)(name=>name==='server-only'?{}:name==='@/lib/supabase/server'?{}:name.startsWith('@/')?load('src/'+name.slice(2)+'.ts'):nativeRequire(name),module,module.exports);return module.exports;}
function totp(secret){const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const c of secret.replace(/=+$/,''))bits+=chars.indexOf(c).toString(2).padStart(5,'0');const bytes=Buffer.from((bits.match(/.{8}/g)||[]).map(b=>parseInt(b,2)));const count=Buffer.alloc(8);count.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const hash=createHmac('sha1',bytes).update(count).digest();const offset=hash[19]&15;return ((hash.readUInt32BE(offset)&0x7fffffff)%1000000).toString().padStart(6,'0');}
const email='bw-security-'+randomUUID()+'@example.test',password=randomBytes(24).toString('hex');
const user=check(await admin.auth.admin.createUser({email,password,email_confirm:true}),'create disposable user').user;
check(await admin.from('profiles').insert({id:user.id,role:'owner',is_active:true}),'seed isolated owner');
sql('update private.cms_mfa_policy set require_editor_aal2=true;');
const client=createClient(url,key,options);check(await client.auth.signInWithPassword({email,password}),'password login');
const {uploadNewsImage}=load('src/lib/news-media.ts');
const photo=await sharp({create:{width:1600,height:1000,channels:3,background:'#286340'}}).png().toBuffer();
const fields={alt:'Isolated image',caption:'',credit:''};
assert.equal((await uploadNewsImage(new File([photo],'photo.png',{type:'image/png'}),fields,user.id,client)).ok,false);
assert.equal((await uploadNewsImage(new File([photo],'photo.png',{type:'image/png'}),fields,user.id,anon)).ok,false);
pass('Real anonymous and owner AAL1 gateway requests rejected');
const factor=check(await client.auth.mfa.enroll({factorType:'totp',friendlyName:'Isolated CI factor'}),'enroll disposable TOTP');
check(await client.auth.mfa.challengeAndVerify({factorId:factor.id,code:totp(factor.totp.secret)}),'verify disposable TOTP');
assert.equal(check(await client.auth.mfa.getAuthenticatorAssuranceLevel(),'assurance').currentLevel,'aal2');
pass('Real password login and mandatory owner TOTP/AAL2');
// Activate only inside this disposable local database, after an actual gateway upload.
assert.equal((await uploadNewsImage(new File([photo],'before.png',{type:'image/png'}),fields,user.id,client)).ok,true);
sql(readFileSync('supabase/manual/strict-upload-gateway.sql','utf8'));
const bucket='bengalwave-preview-news-images';let media;
for(const [format,mime] of [['jpeg','image/jpeg'],['png','image/png'],['webp','image/webp'],['avif','image/avif']]){
 const bytes=await sharp(photo).toFormat(format).toBuffer();
 const result=await uploadNewsImage(new File([bytes],'photo.'+format,{type:mime}),fields,user.id,client);assert.equal(result.ok,true,format);
 media=check(await client.from('media_assets').select('*').eq('id',result.mediaId).single(),'read media');
 for(const [name,width,height] of [['full',1600,1000],['thumb',760,475]]){
  const path=media.storage_path.slice(bucket.length+1).replace('full.webp',name+'.webp');
  const response=await fetch(url+'/storage/v1/object/public/'+bucket+'/'+path);assert.equal(response.status,200);
  const info=await sharp(Buffer.from(await response.arrayBuffer())).metadata();assert.equal(info.format,'webp');assert.equal(info.width,width);assert.equal(info.height,height);assert.equal(info.exif,undefined);
 }
 pass('Real '+format+' gateway upload, WebP thumbnail and anonymous public delivery');
}
const direct=user.id+'/'+randomUUID()+'/full.webp';
assert.ok((await client.storage.from(bucket).upload(direct,await sharp(photo).webp().toBuffer(),{contentType:'image/webp'})).error);
assert.ok((await client.storage.from(bucket).upload(direct,await sharp(photo).webp().toBuffer(),{contentType:'image/webp',upsert:true})).error);
pass('Authenticated direct Storage INSERT and upsert denied after restrictive policies');
const article=check(await client.from('articles').insert({slug:'isolated-'+randomUUID(),headline:'Isolated test article',author_id:user.id,hero_media_id:media.id}).select('id').single(),'create isolated draft');
check(await client.from('articles').update({headline:'Edited isolated article',hero_media_id:media.id}).eq('id',article.id),'edit image association');
pass('Real RLS-scoped draft creation and image edit');
sql("create function public.ci_reject_media() returns trigger language plpgsql as $$ begin if new.alt_text='CI_FORCE_FAILURE' then raise exception 'isolated failure'; end if; return new; end $$; create trigger ci_reject_media before insert on public.media_assets for each row execute function public.ci_reject_media();");
const before=check(await admin.storage.from(bucket).list(user.id),'list before cleanup');
assert.deepEqual(await uploadNewsImage(new File([photo],'cleanup.png',{type:'image/png'}),{...fields,alt:'CI_FORCE_FAILURE'},user.id,client),{ok:false,error:'metadata'});
const after=check(await admin.storage.from(bucket).list(user.id),'list after cleanup');
// Storage removes objects; empty prefixes are not objects and must not grow the listing.
assert.equal(after.length,before.length);pass('Actual metadata failure removes newly uploaded full and thumbnail objects');
// Actual recovery email delivered to the local SMTP capture service.
check(await anon.auth.resetPasswordForEmail(email),'send isolated recovery email');
let mail;
for(let i=0;i<30;i++){
 const messages=await (await fetch('http://127.0.0.1:54324/api/v1/mailbox/'+email.split('@')[0])).json();
 if(messages.length){mail=await (await fetch('http://127.0.0.1:54324/api/v1/mailbox/'+email.split('@')[0]+'/'+messages.at(-1).id)).json();break;}
 await new Promise(r=>setTimeout(r,300));
}
assert.ok(mail,'Recovery SMTP delivery');
const body=mail.body.html||mail.body.text;const hash=body.match(/token_hash=([^&"\s<]+)/)?.[1];assert.ok(hash,'Real configured token-hash template');
const recovered=createClient(url,key,options);
assert.ok((await recovered.auth.verifyOtp({token_hash:hash.slice(0,-1)+'z',type:'recovery'})).error);
check(await recovered.auth.verifyOtp({token_hash:hash,type:'recovery'}),'verify fresh recovery');
assert.ok((await createClient(url,key,options).auth.verifyOtp({token_hash:hash,type:'recovery'})).error);
assert.ok(check(await recovered.auth.mfa.listFactors(),'preserved factors').totp.some(f=>f.id===factor.id&&f.status==='verified'));
assert.equal((await uploadNewsImage(new File([photo],'aal1.png',{type:'image/png'}),fields,user.id,recovered)).ok,false);
// A recovered MFA owner may need AAL2 again before changing password; retain that protection.
if(check(await recovered.auth.mfa.getAuthenticatorAssuranceLevel(),'recovery assurance').currentLevel!=='aal2'){
 await new Promise(r=>setTimeout(r,31000));
 check(await recovered.auth.mfa.challengeAndVerify({factorId:factor.id,code:totp(factor.totp.secret)}),'MFA after recovery');
}
const nextPassword=randomBytes(24).toString('hex');check(await recovered.auth.updateUser({password:nextPassword}),'reset password');
assert.ok((await createClient(url,key,options).auth.signInWithPassword({email,password})).error);
check(await createClient(url,key,options).auth.signInWithPassword({email,password:nextPassword}),'new password login');
pass('Real recovery SMTP, modified/reused token rejection, password reset and preserved TOTP');
// Expire a freshly generated token using ONLY this disposable database clock field.
const generated=check(await admin.auth.admin.generateLink({type:'recovery',email}),'isolated expiring recovery');
sql("update auth.users set recovery_sent_at=now()-interval '2 hours' where id='"+user.id+"';");
assert.ok((await createClient(url,key,options).auth.verifyOtp({token_hash:generated.properties.hashed_token,type:'recovery'})).error);
pass('Actual expired recovery token rejected');
writeFileSync('/tmp/bw-isolated-results.json',JSON.stringify({target:'loopback disposable Supabase',passed:report},null,2));

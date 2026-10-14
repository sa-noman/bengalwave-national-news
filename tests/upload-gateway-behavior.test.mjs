import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import sharp from 'sharp';
const nativeRequire=createRequire(import.meta.url);
function load(path,mocks={}){
  const code=ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
  }).outputText;
  const module={exports:{}};
  new Function('require','module','exports',code)(name=>name==='server-only'?{}:
    Object.hasOwn(mocks,name)?mocks[name]:nativeRequire(name),module,module.exports);
  return module.exports;
}
const userId='00000000-0000-0000-0000-000000000001';
function client(role='owner',aal='aal2',active=true,id=userId){
  return {storage:{legacy:true},auth:{
    getUser:async()=>({data:{user:{id}},error:null}),
    mfa:{getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:aal},error:null})},
  },from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{role,is_active:active},error:null})})})})};
}
test('strict gateway verifies identity/role/MFA and fails closed without credentials',async()=>{
  const old={...process.env};let privilegedCalls=0;
  const {uploadStorage}=load('src/lib/supabase/upload-storage.ts',{
    '@supabase/supabase-js':{createClient:()=>{privilegedCalls++;return {storage:{privileged:true}};}},
  });
  try{
    delete process.env.BW_STRICT_UPLOAD_GATEWAY;
    assert.deepEqual(await uploadStorage(client(),userId),{legacy:true});
    process.env.BW_STRICT_UPLOAD_GATEWAY='false';
    assert.deepEqual(await uploadStorage(client(),userId),{legacy:true});
    for(const mode of ['', 'TRUE', 'tru', '1']){
      process.env.BW_STRICT_UPLOAD_GATEWAY=mode;
      await assert.rejects(uploadStorage(client(),userId),/unavailable/);
    }
    assert.equal(privilegedCalls,0);
    process.env.BW_STRICT_UPLOAD_GATEWAY='true';
    process.env.NEXT_PUBLIC_SUPABASE_URL='https://isolated.example';
    process.env.SUPABASE_UPLOAD_SECRET_KEY='test-only';
    for(const c of [client('owner','aal1'),client('editor','aal1'),client('reader'),client('owner','aal2',false),client('owner','aal2',true,'wrong')]){
      await assert.rejects(uploadStorage(c,userId),/unauthorized/);
    }
    assert.equal(privilegedCalls,0);
    assert.deepEqual(await uploadStorage(client(),userId),{privileged:true});
    assert.deepEqual(await uploadStorage(client('contributor','aal1'),userId),{privileged:true});
    delete process.env.SUPABASE_UPLOAD_SECRET_KEY;
    await assert.rejects(uploadStorage(client(),userId),/unavailable/);
    assert.equal(privilegedCalls,2);
  }finally{
    for(const key of ['BW_STRICT_UPLOAD_GATEWAY','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_UPLOAD_SECRET_KEY']){
      if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];
    }
  }
});
test('actual file bytes are checked and only valid re-encoded WebP reaches storage',async()=>{
  const old=process.env.VERCEL_ENV;process.env.VERCEL_ENV='preview';
  const uploads=[];const removals=[];
  const bucket={upload:async(path,data)=>{uploads.push({path,data});return {error:null};},remove:async paths=>{removals.push(paths);return {error:null};}};
  let metadataFails=false;
  const scoped={from:()=>({insert:()=>({select:()=>({single:async()=>metadataFails?{error:{message:'failed'}}:{data:{id:'media-id'},error:null}})})})};
  const {uploadNewsImage}=load('src/lib/news-media.ts',{
    '@/lib/supabase/server':{},
    '@/lib/supabase/upload-storage':{uploadStorage:async()=>({from:()=>bucket})},
    '@/lib/news-media-paths':{NEWS_MEDIA_BUCKET:'isolated-test'},
  });
  const fields={alt:'Photo',caption:'',credit:''};
  try{
    const png=await sharp({create:{width:800,height:600,channels:3,background:'#00ff00'}}).png().toBuffer();
    const tiny=await sharp({create:{width:64,height:64,channels:3,background:'#00ff00'}}).png().toBuffer();
    for(const file of [new File([png],'fake.jpg',{type:'image/jpeg'}),new File(['<svg>'+ 'x'.repeat(200)+'</svg>'],'fake.png',{type:'image/png'}),new File([Buffer.alloc(4*1024*1024+1)],'big.png',{type:'image/png'})]){
      assert.equal((await uploadNewsImage(file,fields,userId,scoped)).ok,false);
    }
    assert.equal(uploads.length,0);
    // Small but complete news photos are now accepted. Keep their source
    // pixels; the existing CSS controls how they appear in article frames.
    assert.deepEqual(await uploadNewsImage(new File([tiny],'tiny.png',{type:'image/png'}),fields,userId,scoped),{ok:true,mediaId:'media-id'});
    assert.equal(uploads.length,2);
    for(const output of uploads){
      const info=await sharp(output.data).metadata();
      assert.equal(info.format,'webp');
      assert.equal(info.width,64);
      assert.equal(info.height,64);
    }
    const file=new File([png],'valid.png',{type:'image/png'});
    assert.deepEqual(await uploadNewsImage(file,fields,userId,scoped),{ok:true,mediaId:'media-id'});
    assert.equal(uploads.length,4);
    for(const output of uploads){assert.equal((await sharp(output.data).metadata()).format,'webp');assert.match(output.path,/^00000000-0000-0000-0000-000000000001\/[a-f0-9-]{36}\/(full|thumb)\.webp$/);}
    metadataFails=true;
    assert.deepEqual(await uploadNewsImage(file,fields,userId,scoped),{ok:false,error:'metadata'});
    assert.equal(removals.length,1);assert.equal(removals[0].length,2);
    metadataFails=false;
    for(const [format,mime] of [['jpeg','image/jpeg'],['png','image/png'],['webp','image/webp'],['avif','image/avif']]){
      const bytes=await sharp({create:{width:1600,height:1000,channels:3,background:'#286340'}})
        .toFormat(format).toBuffer();
      const start=uploads.length;
      assert.equal((await uploadNewsImage(new File([bytes],'photo.'+format,{type:mime}),fields,userId,scoped)).ok,true,format);
      const full=await sharp(uploads[start].data).metadata();
      const thumb=await sharp(uploads[start+1].data).metadata();
      assert.equal(full.format,'webp');assert.equal(thumb.format,'webp');
      assert.equal(full.width,1600);assert.equal(full.height,1000);
      assert.equal(thumb.width,760);assert.equal(thumb.height,475);
      assert.equal(full.exif,undefined);assert.equal(thumb.exif,undefined);
    }
  }finally{if(old===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=old;}
});

import test from "node:test";
import assert from "node:assert/strict";
import {readdirSync,readFileSync,existsSync} from "node:fs";
import {join,resolve} from "node:path";
import sharp from "sharp";

const folder=resolve("public/news");
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
const crcTable=Array.from({length:256},(_,i)=>{
 let c=i;
 for(let n=0;n<8;n++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);
 return c>>>0;
});
function crc32(buffer){
 let c=0xffffffff;
 for(const byte of buffer)c=(c>>>8)^crcTable[(c^byte)&255];
 return (c^0xffffffff)>>>0;
}
function verifyPng(bytes,name){
 assert.ok(bytes.subarray(0,8).equals(signature),name+": invalid PNG header");
 let pos=8;
 let ended=false;
 while(pos<bytes.length){
  assert.ok(pos+12<=bytes.length,name+": incomplete PNG chunk");
  const length=bytes.readUInt32BE(pos);
  assert.ok(pos+12+length<=bytes.length,name+": truncated PNG chunk");
  const kind=bytes.toString("ascii",pos+4,pos+8);
  const actual=bytes.readUInt32BE(pos+8+length);
  const expected=crc32(bytes.subarray(pos+4,pos+8+length));
  assert.equal(actual,expected,name+": "+kind+" CRC mismatch");
  pos+=12+length;
  if(kind==="IEND"){ended=true;break;}
 }
 assert.ok(ended,name+": no IEND chunk");
 assert.equal(pos,bytes.length,name+": trailing unexpected bytes");
}
function verifyWebp(bytes,name){
 assert.ok(bytes.length>=20,name+": WebP file too short");
 assert.equal(bytes.toString("ascii",0,4),"RIFF",name+": missing RIFF header");
 assert.equal(bytes.toString("ascii",8,12),"WEBP",name+": missing WEBP header");
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length,name+": truncated RIFF payload");
}
function verifyJpeg(bytes,name){
 assert.equal(bytes.readUInt16BE(0),0xffd8,name+": JPEG SOI missing");
 assert.equal(bytes.readUInt16BE(bytes.length-2),0xffd9,name+": JPEG EOI missing");
}
test("all committed news photos are structurally complete",()=>{
 const files=readdirSync(folder).filter(f=>/\.(png|jpe?g|webp)$/i.test(f));
 assert.ok(files.length>0);
 for(const name of files){
  const bytes=readFileSync(join(folder,name));
  if(name.endsWith(".png"))verifyPng(bytes,name);
  else if(name.endsWith(".webp"))verifyWebp(bytes,name);
  else verifyJpeg(bytes,name);
 }
});
test("all four repaired reports have verified replacements",()=>{
 for(const name of [
  "israel-iran-attack-report-2026",
  "postal-service-week-2026",
  "delhi-protest-security-2026",
  "mithun-cultural-adviser-2026",
 ]){
  const file=join(folder,name+"-fixed.webp");
  assert.ok(existsSync(file),name+": restored WebP missing");
  verifyWebp(readFileSync(file),name);
  assert.ok(!existsSync(join(folder,name+".png")),name+": corrupted original still present");
 }
});

test("full article photos have enough real pixels to avoid blurry desktop upscaling",async()=>{
 for(const name of [
  "israel-iran-attack-report-2026",
  "postal-service-week-2026",
  "delhi-protest-security-2026",
  "mithun-cultural-adviser-2026",
 ]){
  const full=join(folder,name+"-article.webp");
  const preview=join(folder,name+"-fixed.webp");
  assert.ok(existsSync(full),name+": missing high-quality full photo");
  assert.ok(existsSync(preview),name+": missing lightweight thumbnail");
  verifyWebp(readFileSync(full),name+" article");
  const info=await sharp(full,{failOn:"error"}).metadata();
  assert.equal(info.format,"webp");
  assert.ok((info.width||0)>=1100,name+": article image too narrow");
  assert.ok((info.height||0)>=600,name+": article image too short");
  assert.ok(info.width*info.height>=700000,name+": article image is undersized");
 }
});

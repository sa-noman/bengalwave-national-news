import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import ts from "typescript";

const read=file=>readFileSync(new URL("../"+file,import.meta.url),"utf8");

function loadNewsDate(){
  const source=read("src/lib/news-date.ts");
  const js=ts.transpileModule(source,{compilerOptions:{
    module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,
  }}).outputText;
  const exports={};
  runInNewContext(js,{exports,Date,Number,Math,Intl});
  return exports;
}

test("relative news timestamps use Bengali numerals and natural units",()=>{
  const {formatNewsCardDate}=loadNewsDate();
  const now=new Date("2026-10-12T12:00:00Z");
  const ago=minutes=>new Date(now.getTime()-minutes*60_000).toISOString();
  assert.equal(formatNewsCardDate(ago(0),now),"এইমাত্র");
  assert.equal(formatNewsCardDate(ago(30),now),"৩০ মিনিট আগে");
  assert.equal(formatNewsCardDate(ago(90),now),"১ ঘণ্টা আগে");
  assert.equal(formatNewsCardDate(ago(23*60),now),"২৩ ঘণ্টা আগে");
  assert.equal(formatNewsCardDate(ago(24*60),now),"১ দিন আগে");
  assert.equal(formatNewsCardDate(ago(2*24*60),now),"২ দিন আগে");
  assert.equal(formatNewsCardDate(ago(3*24*60),now),"৩ দিন আগে");
  assert.equal(formatNewsCardDate(ago(4*24*60-1),now),"৩ দিন আগে");
  assert.equal(formatNewsCardDate(ago(4*24*60),now),"৮ অক্টোবর, ২০২৬");
});

test("old news uses full day, month and year in Dhaka time",()=>{
  const {formatNewsCardDate,formatFullNewsDate}=loadNewsDate();
  const now=new Date("2026-10-20T00:00:00Z");
  assert.equal(formatNewsCardDate("2026-10-10T18:30:00Z",now),"১১ অক্টোবর, ২০২৬");
  assert.equal(formatFullNewsDate("2026-10-10T18:30:00Z"),"১১ অক্টোবর, ২০২৬");
  assert.equal(formatNewsCardDate(undefined,now),"সংবাদ");
  assert.equal(formatNewsCardDate("not-a-date",now),"সংবাদ");
  assert.equal(formatNewsCardDate("2026-10-21T00:00:00Z",now),"এইমাত্র");
});

test("news cards use relative timestamps while preserving demo and article date metadata",()=>{
  const card=read("src/components/news-card.tsx");
  const css=read("src/app/typography.css");
  assert.match(card,/formatNewsCardDate\(item\.publishedAt\)/);
  assert.match(card,/<time dateTime=\{item\.publishedAt\} title=\{formatFullNewsDate\(item\.publishedAt\)\}>/);
  assert.match(card,/নমুনা প্রতিবেদন · প্রকাশিত নয়/);
  assert.match(css,/\.bw-website \.bw-card-meta\s*\{[^}]*font-size:12px/s);
  assert.match(read("src/app/news/[slug]/page.tsx"),/timeStyle:"short"/);
});

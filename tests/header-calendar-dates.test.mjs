import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import ts from "typescript";

const read=(file)=>readFileSync(new URL("../"+file,import.meta.url),"utf8");

function loadDateFormatter(){
  const source=read("src/lib/header-calendar-dates.ts");
  const output=ts.transpileModule(source,{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},
  }).outputText;
  const exports={};
  runInNewContext(output,{exports,Date,Math,Intl,Number,Error});
  return exports;
}

test("Bangladesh Bengali civil date follows the 2019 revised calendar",()=>{
  const format=loadDateFormatter().formatBengaliCivilDate;
  assert.equal(format(new Date("2026-10-11T06:00:00Z")),"২৬ আশ্বিন ১৪৩৩ বঙ্গাব্দ");
  assert.equal(format(new Date("2026-04-14T06:00:00Z")),"১ বৈশাখ ১৪৩৩ বঙ্গাব্দ");
  assert.equal(format(new Date("2024-02-21T06:00:00Z")),"৮ ফাল্গুন ১৪৩০ বঙ্গাব্দ");
  assert.equal(format(new Date("2024-02-29T06:00:00Z")),"১৬ ফাল্গুন ১৪৩০ বঙ্গাব্দ");
  assert.equal(format(new Date("2024-03-15T06:00:00Z")),"১ চৈত্র ১৪৩০ বঙ্গাব্দ");
});

test("Dhaka time zone updates at midnight even when server/browser is elsewhere",()=>{
  const format=loadDateFormatter().formatBengaliCivilDate;
  assert.equal(format(new Date("2026-10-10T17:59:59Z")),"২৫ আশ্বিন ১৪৩৩ বঙ্গাব্দ");
  assert.equal(format(new Date("2026-10-10T18:00:00Z")),"২৬ আশ্বিন ১৪৩৩ বঙ্গাব্দ");
});

test("Hijri date and numbers use Bengali script, without ICU era suffix",()=>{
  const {getHeaderDates}=loadDateFormatter();
  const dates=getHeaderDates(new Date("2026-10-11T06:00:00Z"));
  assert.match(dates.gregorian,/রবিবার.*১১.*অক্টোবর.*২০২৬/);
  assert.equal(dates.bengali,"২৬ আশ্বিন ১৪৩৩ বঙ্গাব্দ");
  assert.match(dates.hijri,/^[০-৯]+ [^0-9]+ [০-৯]+ হিজরি$/);
  assert.doesNotMatch(dates.hijri,/যুগ|[0-9]/);
});

test("only the top bar motto and latest label become calendar text",()=>{
  const header=read("src/components/site-header.tsx");
  const topbar=header.slice(header.indexOf('<div className="bw-topbar">'),header.indexOf('</div></div>',header.indexOf('<div className="bw-topbar">')));
  assert.match(topbar,/headerDates\.bengali/);
  assert.match(topbar,/headerDates\.hijri/);
  assert.doesNotMatch(topbar,/বাংলার কণ্ঠ, বিশ্বের খবর|bw-top-latest|> সর্বশেষ</);
  assert.match(header,/getHeaderDates\(new Date\(\)\)/);
  assert.match(header,/setInterval\(refresh,60_000\)/);
  // The main /latest navigation and brand text must remain unchanged.
  assert.match(header,/label:"সর্বশেষ",href:"\/latest"/);
  assert.match(header,/বাংলার কণ্ঠ, বিশ্বের খবর/);
});

test("header-specific styles contain no new colors or other-section selectors",()=>{
  const css=read("src/app/header-calendar.css");
  assert.match(css,/\.bw-top-hijri/);
  assert.match(css,/\.bw-top-motto \{display:block/);
  assert.doesNotMatch(css,/#(?:[\da-f]{3,8})\b|background\s*:|\bcolor\s*:/i);
  assert.doesNotMatch(css,/\.bw-(?:article|card|footer|nav|masthead|section)/);
  assert.match(read("src/app/layout.tsx"),/import "\.\/header-calendar\.css"/);
});
// This feature branch runs the full CI for the date-only preview change.

import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("compact footer uses two rows, navigation and thin gold divider",()=>{
 const footer=read("src/components/site-footer.tsx");
 const css=read("src/app/newsroom.css");
 for(const className of ["bw-footer-top","bw-footer-lower","bw-footer-nav","bw-footer-legal","bw-footer-social","bw-footer-divider"]){
  assert.match(footer,new RegExp(className));
 }
 for(const name of ["প্রচ্ছদ","সর্বশেষ","জাতীয়","আন্তর্জাতিক","খেলাধুলা","অর্থনীতি","প্রযুক্তি","বিনোদন"]){
  assert.ok(footer.includes(name),name);
 }
 assert.match(css,/\.bw-footer-top\{[^}]*padding:44px 0 35px/);
 assert.match(css,/\.bw-footer-divider\{[^}]*height:1px;background:#c5a150/);
 assert.doesNotMatch(footer,/NewsletterDemo/);
});
test("the gold wave remains and the footer meets the preceding banner",()=>{
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-footer\{[^}]*margin-top:0/);
 const scene=read("src/components/footer-riverscape.tsx");
 assert.match(css,/\.bw-footer-wave\{[^}]*top:-29px/);
 assert.match(scene,/stroke="#FBB040"/);
});
test("Facebook icon points to the requested official page; other social icons have no invented links",()=>{
 const footer=read("src/components/site-footer.tsx");
 for(const name of ["facebook","youtube","x","instagram"])assert.match(footer,new RegExp(name));
 assert.match(footer,/href="https:\/\/www\.facebook\.com\/BengalWaveOfficial"/);
 assert.match(footer,/Join with Us :/);
 assert.match(footer,/অফিশিয়াল লিংক এখনো যুক্ত হয়নি/);
 assert.doesNotMatch(footer,/https?:\/\/(?:www\.)?(?:youtube|instagram|x)\.com/);
});

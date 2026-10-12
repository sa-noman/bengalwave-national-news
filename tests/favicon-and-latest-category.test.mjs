import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,root),"utf8");

test("only the homepage latest-list categories turn red and lose their dot at all widths",()=>{
  const css=read("src/app/newsroom.css");
  const marker=css.indexOf("Latest-news category labels are red and bullet-free on desktop and phone.");
  assert.ok(marker>0);
  const phoneMedia=css.indexOf("@media(max-width:760px){",marker);
  assert.ok(phoneMedia>marker,"global category rule must appear before the next phone-only media query");
  const latestSelector=".bw-home .bw-lead-band .bw-hero-latest .bw-card-latest .bw-tag";
  assert.ok(css.includes(latestSelector+"{color:var(--bw-red)}"));
  assert.ok(css.includes(latestSelector+"::before{content:none}"));
  assert.ok(css.includes(".bw-card-latest .bw-tag::before{content:\"●\";"),"unrelated category bullets stay unchanged");
});

test("the supplied Bengal Wave favicon is a real multi-resolution ICO",()=>{
  const ico=readFileSync(new URL("src/app/favicon.ico",root));
  assert.equal(ico.readUInt16LE(0),0);
  assert.equal(ico.readUInt16LE(2),1);
  assert.equal(ico.readUInt16LE(4),2);
  assert.ok(ico.byteLength>1000);
  const sizes=[ico[6]||256,ico[22]||256].sort((a,b)=>a-b);
  assert.deepEqual(sizes,[16,32]);
  const layout=read("src/app/layout.tsx");
  assert.match(layout,/export const metadata:Metadata=/);
});

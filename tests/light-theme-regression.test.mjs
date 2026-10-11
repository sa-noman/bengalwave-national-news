import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("site always uses the existing light palette irrespective of device dark mode",()=>{
  const styles=["globals.css","newsroom.css","typography.css","header-calendar.css","heritage-stories.css"]
    .map(name=>read("src/app/"+name));
  const css=styles[1];
  for(const stylesheet of styles){
    assert.doesNotMatch(stylesheet,/prefers-color-scheme\s*:\s*dark/i);
    assert.doesNotMatch(stylesheet,/prefers-color-scheme\s*:\s*light/i);
  }
  assert.match(css,/:root\{[^}]*color-scheme:light;/);
  assert.match(css,/--bw-bg:#FDFBF6/);
  assert.match(css,/--bw-ink:#1c1c1c/);
  assert.match(css,/body\{background:var\(--bw-bg\);color:var\(--bw-ink\)/);
  assert.match(css,/\.bw-website\{background:var\(--bw-bg\);color:var\(--bw-ink\)/);
});

test("homepage latest title remains visible and category/article views stay light",()=>{
  const home=read("src/app/page.tsx");
  const css=read("src/app/newsroom.css");
  const type=read("src/app/typography.css");
  assert.match(home,/<SectionHeading title="সর্বশেষ সংবাদ" href="\/latest"\/>/);
  assert.match(css,/\.bw-home \.bw-lead-band\{background:#fff;[^}]*color:#192820/);
  assert.match(css,/\.bw-home \.bw-section\{[^}]*background:#fff;[^}]*color:#192820/);
  assert.match(type,/\.bw-section-heading h2 > a\s*\{\s*color:inherit;/);
  assert.match(css,/\.bw-section-heading h2,\.bw-section-heading h1\{[^}]*border-left:5px/);
  assert.match(css,/\.bw-listing\{[^}]*min-height:45vh/);
  assert.match(css,/\.bw-article\{[^}]*padding-top:25px/);
});

test("dark green branding stays intentional and future theme may explicitly override",()=>{
  const css=read("src/app/newsroom.css");
  assert.match(css,/\.bw-footer\{[^}]*background:linear-gradient\(180deg,#04382f,#03342b\)/);
  assert.match(css,/\.bw-drawer\{[^}]*background:var\(--bw-dark\)/);
  assert.doesNotMatch(css,/@media\s*\(\s*prefers-color-scheme/);
});

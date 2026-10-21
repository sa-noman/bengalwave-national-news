import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("story body is a single editable document, not a stack of repeated forms",()=>{
 const form=read("src/components/admin/article-form.tsx");
 const editor=read("src/components/admin/article-body-editor.tsx");
 assert.match(form,/<ArticleBodyEditor initialBody=/);
 assert.match(editor,/className="bw-doc-surface" contentEditable/);
 assert.match(editor,/data-placeholder="এখানে সম্পূর্ণ সংবাদ লিখুন বা পেস্ট করুন/);
 assert.match(editor,/<input type="hidden" name="body" value=\{body\} readOnly\/>/);
 assert.doesNotMatch(editor,/className="bw-rich-editor-blocks"/);
 assert.doesNotMatch(editor,/<textarea name="body"/);
 for(const button of ["＋ ছবি","ছবি ও লেখা","২ ছবি","❝ বড় উদ্ধৃতি","হাইলাইট বক্স","শিরোনাম","উপশিরোনাম"]){
  assert.ok(editor.includes(button),"missing action: "+button);
 }
 assert.match(editor,/onPaste=\{event=>/);
 assert.match(editor,/event.clipboardData.getData\("text\/plain"\)/);
});

test("structured stories and existing plain-text articles remain readable without raw HTML injection",()=>{
 const renderer=read("src/components/rich-article-body.tsx");
 const parser=read("src/lib/rich-article.ts");
 const editor=read("src/components/admin/article-body-editor.tsx");
 for(const route of ["src/app/news/[slug]/page.tsx","src/app/admin/articles/[id]/preview/page.tsx"]){
   assert.match(read(route),/<RichArticleBody body=\{/);
 }
 assert.match(renderer,/parseRichBody\(body\)\|\|legacyStoryBlocks\(body\)/);
 assert.doesNotMatch(renderer,/dangerouslySetInnerHTML/);
 assert.match(renderer,/bw-rich-split/);
 assert.match(renderer,/bw-rich-gallery/);
 assert.match(renderer,/bw-rich-quote/);
 assert.match(renderer,/bw-rich-callout/);
 assert.match(parser,/url.protocol==="https:"/);
 assert.match(parser,/new Set\(ids\).size!==ids.length/);
 assert.match(editor,/parseRichBody\(initialBody\)\|\|legacyStoryBlocks\(initialBody\)/);
 assert.match(editor,/document.createElement/);
 assert.doesNotMatch(editor,/dangerouslySetInnerHTML/);
});

test("images use the authenticated existing upload path and gallery files map correctly",()=>{
 const actions=read("src/app/admin/actions.ts");
 const uploads=read("src/lib/story-inline-images.ts");
 const editor=read("src/components/admin/article-body-editor.tsx");
 assert.match(actions,/resolveStoryInlineImages\(input.body,formData,user.id,supabase\)/);
 assert.match(actions,/body:rich.body/);
 assert.match(actions,/if\(!rich.ok\)redirect/);
 assert.match(actions,/hasPublishableStoryText/);
 assert.match(uploads,/if\(newImages>6\)/);
 assert.match(uploads,/await uploadNewsImage/);
 assert.match(uploads,/publicNewsImageUrl\(supabase,data.storage_path,"full"\)/);
 assert.match(editor,/hidden.name="inline_image_"\+id/);
 assert.match(editor,/secondInput.name="inline_image_"\+firstId\+"_second"/);
 assert.match(editor,/hidden.files=dt.files/);
 assert.match(editor,/save\(\)/);
 assert.match(read("next.config.ts"),/bodySizeLimit: "30mb"/);
});

test("visual quoted-excerpt style matches requested large grey pullquote with red marks and byline",()=>{
 const css=read("src/app/rich-article.css");
 const editor=read("src/components/admin/article-body-editor.tsx");
 assert.match(css,/\.bw-rich-quote:before/);
 assert.match(css,/color:#ce0000/);
 assert.match(css,/\.bw-rich-quote cite/);
 assert.match(css,/\.bw-doc-surface blockquote\.bw-doc-pullquote/);
 assert.match(editor,/cite.contentEditable="true"/);
 assert.match(editor,/applyQuote\("quote"\)/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(read("src/app/layout.tsx"),/import "\.\/rich-article.css"/);
});

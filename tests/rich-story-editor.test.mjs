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

test("visual quoted-excerpt style uses Bengal Wave brand-green marks and byline",()=>{
 const css=read("src/app/rich-article.css");
 const editor=read("src/components/admin/article-body-editor.tsx");
 assert.match(css,/\.bw-rich-quote:before/);
 assert.match(css,/\.bw-rich-quote:before\{[\s\S]*?color:var\(--bw-green\)/);
 assert.match(css,/\.bw-rich-quote cite/);
 assert.match(css,/\.bw-doc-surface blockquote\.bw-doc-pullquote/);
 assert.match(editor,/cite.contentEditable="true"/);
 assert.match(editor,/applyQuote\("quote"\)/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(read("src/app/layout.tsx"),/import "\.\/rich-article.css"/);
});

test("pre-publication editor preview uses unsaved form content, never publishes",()=>{
 const editor=read("src/components/admin/article-body-editor.tsx");
 assert.match(editor,/openDraftPreview=\(\)=>/);
 assert.match(editor,/role="dialog" aria-modal="true"/);
 assert.match(editor,/<RichArticleBody body=\{preview.body\} allowLocalImages\/>/);
 assert.match(editor,/type="button" className="bw-doc-preview-action"/);
 assert.match(editor,/previewCoverRef/);
});
test("font-size, paste-format and copy modes persist to safe article markup",()=>{
 const editor=read("src/components/admin/article-body-editor.tsx");
 const reader=read("src/components/rich-article-body.tsx");
 for(const text of ["ফরম্যাটসহ কপি","Plain Text","Markdown","ফরম্যাট কপি","ফরম্যাট বসান","নির্বাচিত লেখার ফন্ট সাইজ"]){
  assert.ok(editor.includes(text),"missing "+text);
 }
 assert.match(editor,/style\.fontSize=value\+"px"/);
 assert.match(editor,/\\[\\[fs:/);
 assert.match(reader,/fontPattern/);
 assert.doesNotMatch(reader,/dangerouslySetInnerHTML/);
});
test("SEO descriptions are generated only by authenticated editors and AI draft needs credentials",()=>{
 const summary=read("src/components/admin/article-summary-field.tsx");
 const action=read("src/app/admin/seo-summary-action.ts");
 const form=read("src/components/admin/article-form.tsx");
 assert.match(form,/<ArticleSummaryField initialSummary=/);
 assert.match(action,/await requireStaff\(\)/);
 assert.match(action,/process\.env\.OPENAI_API_KEY/);
 assert.match(action,/store:false/);
 assert.match(action,/https:\/\/api\.openai\.com\/v1\/responses/);
 assert.match(action,/কোনো নতুন তথ্য/);
 assert.match(summary,/AI দিয়ে তৈরি \/ নতুন করে লিখুন/);
 assert.match(summary,/AI দিয়ে তৈরি নয়/);
});

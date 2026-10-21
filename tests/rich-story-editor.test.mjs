import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Tiptap replaces the custom contentEditable and keeps one article editor",()=>{
 const form=read("src/components/admin/article-form.tsx");
 const editor=read("src/components/admin/article-body-editor.tsx");
 assert.match(form,/<ArticleBodyEditor initialBody=/);
 assert.match(editor,/useEditor\(/);
 assert.match(editor,/<EditorContent editor=\{editor\}\/>/);
 assert.match(editor,/immediatelyRender:false/);
 assert.match(editor,/name="body" type="hidden" value=\{body\}/);
 assert.doesNotMatch(editor,/className="bw-doc-surface" contentEditable/);
 for(const name of ["Undo","Redo","স্লাইডশো","ছবি ও লেখা","হাইলাইট","প্রকাশের আগে প্রিভিউ"]){
  assert.ok(editor.includes(name)||editor.includes(name.toLowerCase()),"missing "+name);
 }
});

test("Tiptap version 2 body works with legacy and V1 published article pages",()=>{
 const reader=read("src/components/rich-article-body.tsx");
 const newsroom=read("src/components/newsroom-article-body.tsx");
 const doc=read("src/lib/newsroom-document.ts");
 for(const route of ["src/app/news/[slug]/page.tsx","src/app/admin/articles/[id]/preview/page.tsx"]){
  assert.match(read(route),/<RichArticleBody body=\{/);
 }
 assert.match(reader,/NEWSROOM_PREFIX/);
 assert.match(reader,/parseRichBody\(body\)\|\|legacyStoryBlocks\(body\)/);
 assert.match(doc,/existingBodyToNewsJSON/);
 assert.match(doc,/parseRichBody\(raw\)\|\|legacyStoryBlocks\(raw\)/);
 assert.doesNotMatch(newsroom,/dangerouslySetInnerHTML/);
 assert.match(newsroom,/ArticleSlideshow/);
});

test("Media must pass server-side validation before write",()=>{
 const actions=read("src/app/admin/actions.ts");
 const uploads=read("src/lib/story-inline-images.ts");
 const validation=read("src/lib/validation/article.ts");
 assert.match(actions,/resolveStoryInlineImages\(input.body,formData,user.id,supabase\)/);
 assert.match(actions,/body:rich.body/);
 assert.match(actions,/newsroomPublishableText\(input.body\)/);
 assert.match(validation,/validateNewsroomBody\(body,form\)/);
 assert.match(uploads,/NEWSROOM_PREFIX/);
 assert.match(uploads,/newsroom_media_/);
 assert.match(uploads,/await uploadNewsImage/);
 assert.match(uploads,/publicNewsImageUrl\(supabase,data.storage_path,"full"\)/);
});

test("SEO generation is staff-only and does not pretend fallback is AI",()=>{
 const summary=read("src/components/admin/article-summary-field.tsx");
 const action=read("src/app/admin/seo-summary-action.ts");
 assert.match(action,/await requireStaff\(\)/);
 assert.match(action,/process\.env\.OPENAI_API_KEY/);
 assert.match(action,/store:false/);
 assert.match(action,/textContent\(doc\)/);
 assert.match(summary,/AI দিয়ে তৈরি নয়/);
 assert.match(summary,/parseNewsroomBody/);
});

test("Mobile and desktop paragraph gaps use controlled spacing",()=>{
 const css=read("src/app/newsroom-editor.css");
 assert.match(css,/\.bw-nr-editable p/);
 assert.match(css,/margin:0 0 \.7em/);
 assert.match(css,/\.bw-newsroom-published-body>p/);
 assert.match(css,/@media\(max-width:760px\)/);
});

test("Tiptap dependencies are pinned to patched releases",()=>{
 const pkg=JSON.parse(read("package.json"));
 for(const [name,version] of Object.entries(pkg.dependencies)){
  if(name.startsWith("@tiptap/"))assert.equal(version,"3.32.0");
 }
});

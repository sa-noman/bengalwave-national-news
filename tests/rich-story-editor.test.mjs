import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("CMS article body uses a structured editor but continues to save through the original form",()=>{
 const form=read("src/components/admin/article-form.tsx");
 const editor=read("src/components/admin/article-body-editor.tsx");
 assert.match(form,/<ArticleBodyEditor initialBody=/);
 assert.match(editor,/<input type="hidden" name="body" value=\{serializeRichBody\(blocks\)\} readOnly\/>/);
 assert.doesNotMatch(editor,/<textarea name="body"/);
 for(const type of ["paragraph","heading","subheading","quote","callout","list","image","split","gallery","divider"]){
   assert.match(editor,new RegExp('type:"'+type+'"'));
 }
 assert.match(editor,/onClick=\{\(\)=>shift\(index,-1\)\}/);
 assert.match(editor,/onClick=\{\(\)=>shift\(index,1\)\}/);
 assert.match(editor,/inline_image_/);
});

test("legacy paragraphs and versioned new stories use a safe component renderer without HTML injection",()=>{
 const renderer=read("src/components/rich-article-body.tsx");
 const parser=read("src/lib/rich-article.ts");
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
});

test("inline images are validated and uploaded before saving or publishing an article",()=>{
 const action=read("src/app/admin/actions.ts");
 const uploads=read("src/lib/story-inline-images.ts");
 const photo=read("src/lib/news-media.ts");
 assert.match(action,/resolveStoryInlineImages\(input.body,formData,user.id,supabase\)/);
 assert.match(action,/body:rich.body/);
 assert.match(action,/if\(!rich.ok\)redirect/);
 assert.match(action,/hasPublishableStoryText/);
 assert.match(uploads,/if\(newImages>6\)/);
 assert.match(uploads,/await uploadNewsImage/);
 assert.match(uploads,/publicNewsImageUrl\(supabase,data.storage_path,"full"\)/);
 assert.match(photo,/limitInputPixels:25000000/);
 assert.match(read("next.config.ts"),/bodySizeLimit: "30mb"/);
});

test("rich media layouts collapse responsively instead of distorting photos",()=>{
 const css=read("src/app/rich-article.css");
 assert.match(css,/object-fit:contain/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.12fr\)/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(read("src/app/layout.tsx"),/import "\.\/rich-article.css"/);
});

test("serialized JSON stays hidden and multiple images have direct action buttons",()=>{
 const editor=read("src/components/admin/article-body-editor.tsx");
 const css=read("src/app/rich-article.css");
 for(const block of ["image","split","gallery"]){
   assert.ok(editor.includes('onClick={()=>add("'+block+'")}'),block+" shortcut is missing");
 }
 assert.match(editor,/onClick=\{\(\)=>add\("image",index\)\}/);
 assert.match(editor,/type="file" name=\{fieldName\}/);
 assert.match(editor,/inline_image_/);
 assert.match(css,/\.admin-form input\[type="hidden"\]/);
 assert.match(css,/display:none!important/);
});

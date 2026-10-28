import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("multi-image CMS publish uploads photos in separate authenticated requests",()=>{
 const editor=read("src/components/admin/article-body-editor.tsx");
 assert.match(editor,/totalBytes<=3_600_000/);
 assert.match(editor,/fetch\("\/admin\/newsroom-upload"/);
 assert.match(editor,/credentials:"same-origin"/);
 assert.match(editor,/headers:\{"x-bw-editor-upload":"1"\}/);
 assert.match(editor,/form\.addEventListener\("submit",publishWithImages,true\)/);
 assert.match(editor,/form\.requestSubmit\(submitter\|\|undefined\)/);
 assert.match(editor,/event\.preventDefault\(\)/);
 assert.match(editor,/input\.remove\(\)/);
 assert.match(editor,/editor\.commands\.setContent\(doc\)/);
 assert.match(editor,/src:output\.url!/);
});

test("authenticated photo endpoint reuses validated media pipeline and blocks preview writes",()=>{
 const route=read("src/app/admin/newsroom-upload/route.ts");
 assert.match(route,/export const runtime="nodejs"/);
 assert.match(route,/process\.env\.VERCEL_ENV!=="production"/);
 assert.match(route,/request\.headers\.get\("origin"\)/);
 assert.match(route,/origin!==new URL\(request\.url\)\.origin/);
 assert.match(route,/request\.headers\.get\("x-bw-editor-upload"\)!=="1"/);
 assert.match(route,/length>4_450_000/);
 assert.match(route,/await requireStaff\(\)/);
 assert.match(route,/await uploadNewsImage\(file/);
 assert.match(route,/publicNewsImageUrl\(supabase,data\.storage_path,"full"\)/);
 assert.match(route,/MAX_IMAGE_BYTES/);
 assert.match(route,/no-store/);
});

test("existing server actions still support saving, reviewing, approving and publishing",()=>{
 const editor=read("src/components/admin/article-body-editor.tsx");
 const actions=read("src/app/admin/actions.ts");
 assert.match(actions,/export async function createAndPublishArticle/);
 assert.match(actions,/export async function createDraft/);
 assert.match(actions,/export async function publishArticle/);
 assert.match(actions,/export async function updateArticle/);
 assert.match(editor,/resubmittingRef\.current=true/);
 assert.match(editor,/uploadingRef\.current=false/);
 assert.match(editor,/setMessage\("ছবি "/);
});

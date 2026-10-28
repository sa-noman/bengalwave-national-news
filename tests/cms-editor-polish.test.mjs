import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("source name and safe source URL survive form, editor preview, saved preview and published page",()=>{
 const form=read("src/components/admin/article-form.tsx");
 const editor=read("src/components/admin/article-body-editor.tsx");
 const draft=read("src/app/admin/articles/[id]/preview/page.tsx");
 const article=read("src/app/news/[slug]/page.tsx");
 const source=read("src/components/article-source.tsx");
 assert.match(form,/name="source_name"/);
 assert.match(form,/name="source_url"/);
 assert.match(editor,/sourceName:field\("source_name"\),sourceUrl:field\("source_url"\)/);
 assert.match(editor,/<ArticleSource sourceName=\{preview\.sourceName\} sourceUrl=\{preview\.sourceUrl\}/);
 assert.match(draft,/source_name,source_url/);
 assert.match(draft,/<ArticleSource sourceName=\{item\.source_name\} sourceUrl=\{item\.source_url\}/);
 assert.match(article,/<ArticleSource sourceName=\{item\.sourceName\} sourceUrl=\{item\.sourceUrl\}/);
 assert.match(source,/if\(!label\)return null/);
 assert.match(source,/url\.protocol==="https:"\|\|url\.protocol==="http:"/);
 assert.match(source,/rel="noopener noreferrer nofollow"/);
 assert.match(source,/:<span>\{label\}<\/span>/);
});

test("AI slug reuses existing Gemini SEO key and model without publishing",()=>{
 const action=read("src/app/admin/seo-summary-action.ts");
 const slug=read("src/components/admin/article-slug-field.tsx");
 assert.match(action,/process\.env\.Gemini_Seo_Key \|\| process\.env\.GEMINI_API_KEY/);
 assert.match(action,/const seoGeminiModel="gemini-3\.5-flash-lite"/);
 assert.match(action,/export async function generateSeoSlug/);
 assert.match(action,/await requireStaff\(\)/);
 assert.match(action,/\.eq\("slug",candidate\)\.maybeSingle\(\)/);
 assert.match(slug,/generateSeoSlug\(headline,articleId\)/);
 assert.match(slug,/name="slug" required pattern=/);
});

test("highlight accent retains editor-picked color and quote controls remain separated",()=>{
 const css=read("src/app/newsroom-editor.css");
 const nodes=read("src/components/admin/newsroom-nodes.tsx");
 const render=read("src/components/newsroom-article-body.tsx");
 assert.doesNotMatch(css,/\.bw-newsroom-published-body \.bw-rich-callout\{border-left:4px solid #0b4838!important/);
 assert.match(css,/border-left-width:4px!important;border-left-style:solid!important/);
 assert.match(nodes,/updateAttributes\(\{borderColor:e\.target\.value\}\)/);
 assert.match(render,/style=\{\{borderLeftColor:border\}\}/);
 assert.match(css,/\.bw-nr-callout-controls\{display:flex/);
});

test("20px article body, caption and hover/visited links",()=>{
 const css=read("src/app/typography.css");
 const editor=read("src/app/newsroom-editor.css");
 const rich=read("src/app/rich-article.css");
 assert.match(css,/\.bw-article \.bw-article-body\{font:400 20px/);
 assert.match(editor,/\.bw-nr-main \.bw-nr-editable\{font-size:20px/);
 assert.match(rich,/\.bw-article \.bw-rich-article-body \.bw-rich-figure figcaption/);
 assert.match(rich,/a:visited:hover/);
 assert.match(editor,/a:visited:hover/);
});

test("slideshow crossfades blurred same-image gutters with reduced motion support",()=>{
 const slide=read("src/components/article-slideshow.tsx");
 const css=read("src/app/rich-article.css");
 assert.match(slide,/setOutgoing\(index\);setIndex\(target\)/);
 assert.match(slide,/JSON\.stringify\(source\)/);
 assert.match(slide,/className="bw-story-slider-backdrop"/);
 assert.match(css,/@keyframes bw-slide-in/);
 assert.match(css,/bw-story-slider-layer>img\.bw-story-slider-photo/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("published articles have an accessible, nonempty share toolbar with draft-safe preview",()=>{
 const share=read("src/components/article-share-bar.tsx");
 const article=read("src/app/news/[slug]/page.tsx");
 const preview=read("src/app/admin/articles/[id]/preview/page.tsx");
 assert.match(share,/facebook\.com\/sharer\/sharer\.php/);
 assert.match(share,/twitter\.com\/intent\/tweet/);
 assert.match(share,/api\.whatsapp\.com\/send/);
 assert.match(share,/t\.me\/share\/url/);
 assert.match(share,/navigator\.clipboard\.writeText/);
 assert.match(share,/navigator\.share/);
 assert.match(share,/window\.print\(\)/);
 assert.match(article,/<ArticleShareBar url=\{articleUrl\} title=\{item\.title\}/);
 assert.match(preview,/title=\{item\.headline\} preview/);
});

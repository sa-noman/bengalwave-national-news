import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import ts from "typescript";

const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

function loadNewsroomParser(){
 const source=read("src/lib/newsroom-document.ts");
 const javascript=ts.transpileModule(source,{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
 }).outputText;
 const module={exports:{}};
 const requireMock=(name)=>{
  if(name==="@/lib/rich-article")return {
   legacyStoryBlocks:()=>[],
   parseRichBody:()=>null,
   safeStoryImageUrl:src=>src.startsWith("https://")?src:null
  };
  throw new Error("Unexpected dependency: "+name);
 };
 new Function("require","module","exports",javascript)(requireMock,module,module.exports);
 return module.exports;
}

test("published newsroom articles support HTML form CRLF and original LF markers",()=>{
 const reader=loadNewsroomParser();
 const doc={type:"doc",content:[{type:"paragraph",content:[{
  type:"text",text:"ইয়েমেনে হামলার পর সৌদি আরবে উড়োজাহাজের ভাড়া বেড়েছে।"
 }]}]};
 const lf="BW_NEWSROOM_V2\n"+JSON.stringify(doc);
 const crlf="BW_NEWSROOM_V2\r\n"+JSON.stringify(doc);
 assert.equal(reader.isNewsroomBody(lf),true);
 assert.equal(reader.isNewsroomBody(crlf),true);
 assert.deepEqual(reader.parseNewsroomBody(lf),doc);
 assert.deepEqual(reader.parseNewsroomBody(crlf),doc);
 assert.equal(reader.newsroomPublishableText(crlf),true);
 assert.equal(reader.parseNewsroomBody("BW_NEWSROOM_V2"+JSON.stringify(doc)),null);
 assert.equal(reader.parseNewsroomBody("BW_NEWSROOM_V2\r\n{bad json"),null);
});

test("public article viewer chooses structured renderer for a CRLF body",()=>{
 const reader=read("src/components/rich-article-body.tsx");
 assert.match(reader,/import \{isNewsroomBody\} from "@\/lib\/newsroom-document"/);
 assert.match(reader,/if\(isNewsroomBody\(body\)\)return <NewsroomArticleBody/);
 assert.doesNotMatch(reader,/if\(body\.startsWith\(NEWSROOM_PREFIX\)\)/);
 const writer=read("src/lib/story-inline-images.ts");
 const validator=read("src/lib/validation/article.ts");
 assert.match(writer,/if\(isNewsroomBody\(body\)\)/);
 assert.match(validator,/isNewsroomBody\(body\)\?validateNewsroomBody/);
});

test("nested V2 documents are decoded instead of printed as JSON",()=>{
 const reader=loadNewsroomParser();
 const inner={type:"doc",content:[
  {type:"paragraph",content:[{type:"text",text:"প্রথম অনুচ্ছেদে সংবাদ।"}]},
  {type:"paragraph",content:[{type:"text",text:"দ্বিতীয় অনুচ্ছেদে বিবরণ।"}]}
 ]};
 const encoded="BW_NEWSROOM_V2\n"+JSON.stringify(inner);
 const double={type:"doc",content:[{type:"paragraph",content:[{type:"text",text:encoded}]}]};
 const outer="BW_NEWSROOM_V2\r\n"+JSON.stringify(double);
 assert.deepEqual(reader.parseNewsroomBody(outer),inner);
 assert.deepEqual(reader.existingBodyToNewsJSON(outer),inner);
 assert.equal(reader.newsroomPublishableText(outer),true);
 const triple={type:"doc",content:[{type:"paragraph",content:[{type:"text",text:outer}]}]};
 assert.deepEqual(reader.parseNewsroomBody("BW_NEWSROOM_V2\n"+JSON.stringify(triple)),inner);
 const malformed={type:"doc",content:[{type:"paragraph",content:[{type:"text",text:"BW_NEWSROOM_V2\n{bad-json"}]}]};
 assert.equal(reader.parseNewsroomBody("BW_NEWSROOM_V2\n"+JSON.stringify(malformed)),null);
});

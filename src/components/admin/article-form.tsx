import {createDraft,updateArticle} from "@/app/admin/actions";
import {ArticleImageField} from "./article-image-field";
import {ArticleSubmitControls} from "./article-submit-controls";
import {ArticleBodyEditor} from "./article-body-editor";
import {ArticleSummaryField} from "./article-summary-field";
type Category={id:string;label_bn:string};
type Article={
 id:string;slug:string;headline:string;summary:string;body:string;
 status:string;category_id:string|null;source_name:string|null;source_url:string|null;
 is_featured:boolean;hero_media_id?:string|null;
};
export function ArticleForm({categories,article,role,media}:{
  categories:Category[];article?:Article;role:string;
  media?:{url:string;alt:string;caption:string;credit:string}|null;
}) {
  const isEditor=role==="owner"||role==="editor";
  const previewOnly=process.env.VERCEL_ENV==="preview"||process.env.NODE_ENV==="development";
  return <form className="admin-form article-editor" action={article?updateArticle:createDraft}>
    {article && <input type="hidden" name="id" value={article.id}/>}
    <div className="admin-grid-form">
      <label>শিরোনাম <span className="required">*</span>
        <input name="headline" required minLength={5} maxLength={300} defaultValue={article?.headline} placeholder="সংবাদের শিরোনাম"/>
      </label>
      <label>URL Slug (ইংরেজি ছোট হাতের অক্ষর) <span className="required">*</span>
        <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={150} defaultValue={article?.slug} placeholder="example-news-headline"/>
      </label>
      <label>বিভাগ
        <select name="category_id" defaultValue={article?.category_id||""}>
          <option value="">বিভাগ নির্বাচন</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.label_bn}</option>)}
        </select>
      </label>
      <label>সংবাদ উৎস
        <input name="source_name" maxLength={150} defaultValue={article?.source_name||""} placeholder="প্রতিষ্ঠানের নাম"/>
      </label>
      <ArticleSummaryField initialSummary={article?.summary||""}/>
      <ArticleBodyEditor initialBody={article?.body||""} initialCoverUrl={media?.url}/>
      <label className="full-span">উৎসের URL (ঐচ্ছিক)
        <input name="source_url" type="url" defaultValue={article?.source_url||""} placeholder="https://example.com/article"/>
      </label>
      <ArticleImageField
        currentUrl={media?.url}
        currentAlt={media?.alt}
        currentCaption={media?.caption}
        currentCredit={media?.credit}
        hasCurrentImage={Boolean(article?.hero_media_id)}
      />
      {isEditor && <label className="admin-checkbox full-span">
        <input type="checkbox" name="is_featured" defaultChecked={article?.is_featured||false}/> নির্বাচিত সংবাদ হিসেবে চিহ্নিত করুন
      </label>}
    </div>
    <ArticleSubmitControls status={article?.status} isEditor={isEditor} previewOnly={previewOnly}/>
    <p className="admin-note">প্রকাশের আগে শিরোনাম, তথ্য, উৎস ও ছবির স্বত্ব যাচাই করুন। সংরক্ষিত প্রতিটি পরিবর্তনের ইতিহাস ডেটাবেজে থাকবে।</p>
  </form>;
}

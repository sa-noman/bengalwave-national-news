import {createDraft,updateArticle} from "@/app/admin/actions";
type Category={id:string;label_bn:string};
type Article={
 id:string;slug:string;headline:string;summary:string;body:string;
 status:string;category_id:string|null;source_name:string|null;source_url:string|null;
 is_featured:boolean;
};
export function ArticleForm({categories,article,role}:{categories:Category[];article?:Article;role:string}) {
  const isEditor=role==="owner"||role==="editor";
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
      <label className="full-span">সংক্ষিপ্ত বিবরণ
        <textarea name="summary" maxLength={700} rows={3} defaultValue={article?.summary||""} placeholder="হোমপেজ ও সংবাদ কার্ডে দেখানো হবে"/>
      </label>
      <label className="full-span">সম্পূর্ণ সংবাদ
        <textarea name="body" rows={15} maxLength={80000} defaultValue={article?.body||""} placeholder="যাচাইকৃত বাংলা সংবাদ লিখুন"/>
      </label>
      <label className="full-span">উৎসের URL (ঐচ্ছিক)
        <input name="source_url" type="url" defaultValue={article?.source_url||""} placeholder="https://example.com/article"/>
      </label>
      {isEditor && <label className="admin-checkbox full-span">
        <input type="checkbox" name="is_featured" defaultChecked={article?.is_featured||false}/> নির্বাচিত সংবাদ হিসেবে চিহ্নিত করুন
      </label>}
    </div>
    <div className="admin-controls">
      <button className="admin-primary" type="submit" name="intent" value="save">খসড়া সংরক্ষণ / পরিবর্তন সংরক্ষণ</button>
      {article?.status==="draft" && <button className="admin-secondary" type="submit" name="intent" value="submit">পর্যালোচনার জন্য পাঠান</button>}
      {article && isEditor && ["draft","in_review"].includes(article.status) &&
        <button className="admin-secondary" type="submit" name="intent" value="approve">অনুমোদন করুন</button>}
      {article?.status==="approved" && isEditor &&
        <button className="admin-primary" type="submit" name="intent" value="publish">সংবাদ প্রকাশ করুন</button>}
      {article?.status==="published" && isEditor &&
        <button className="admin-danger" type="submit" name="intent" value="unpublish">প্রকাশনা বন্ধ করুন</button>}
    </div>
    <p className="admin-note">প্রকাশের আগে শিরোনাম, তথ্য, উৎস ও ছবির স্বত্ব যাচাই করুন। সংরক্ষিত প্রতিটি পরিবর্তনের ইতিহাস ডেটাবেজে থাকবে।</p>
  </form>;
}

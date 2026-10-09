import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {requireStaff} from "@/lib/auth/require-staff";
import {ArticleForm} from "@/components/admin/article-form";
export const metadata:Metadata={title:"সংবাদ সম্পাদনা",robots:{index:false,follow:false}};
const errorLabels:Record<string,string>={
 validation:"ফর্মের তথ্য আবার যাচাই করুন।",save:"পরিবর্তন সংরক্ষণ করা যায়নি।",
 transition:"এই অবস্থায় উল্লিখিত প্রকাশনা কার্যক্রম অনুমোদিত নয়।",
 publish:"প্রকাশের আগে অন্তত ৩০ অক্ষরের সংবাদ, ১০ অক্ষরের বিবরণ ও বিভাগ নির্বাচন প্রয়োজন।"
};
export default async function EditArticle({params,searchParams}:{
  params:Promise<{id:string}>;searchParams:Promise<{error?:string;success?:string;created?:string}>
}){
  const {id}=await params;
  const {supabase,role}=await requireStaff();
  const {data:article}=await supabase.from("articles").select("id,slug,headline,summary,body,status,category_id,source_name,source_url,is_featured").eq("id",id).maybeSingle();
  if(!article)notFound();
  const {data:categories}=await supabase.from("categories").select("id,label_bn").eq("is_active",true).order("sort_order");
  const query=await searchParams;
  return <main className="container admin-surface">
    <Link className="back-link" href="/admin">← ড্যাশবোর্ড</Link>
    <div className="admin-panel">
      <span className="category">বর্তমান অবস্থা: {article.status}</span><h1>সংবাদ সম্পাদনা</h1>
      {query.error && <p className="admin-alert" role="alert">{errorLabels[query.error]||"পরিবর্তন সম্পন্ন হয়নি।"}</p>}
      {(query.success||query.created) && <p className="admin-success" role="status">সংবাদ সংরক্ষিত হয়েছে।</p>}
      <ArticleForm article={article} categories={categories||[]} role={role}/>
    </div>
  </main>;
}

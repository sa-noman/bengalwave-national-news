import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {requireStaff} from "@/lib/auth/require-staff";
import {ArticleForm} from "@/components/admin/article-form";
import {publicNewsImageUrl} from "@/lib/news-media-paths";
export const metadata:Metadata={title:"সংবাদ সম্পাদনা",robots:{index:false,follow:false}};
const errorLabels:Record<string,string>={
 validation:"ফর্মের তথ্য আবার যাচাই করুন।",save:"পরিবর্তন সংরক্ষণ করা যায়নি।",
 approval:"সংবাদ খসড়া হিসেবে সংরক্ষিত, কিন্তু অনুমোদন সম্পন্ন হয়নি। আবার চেষ্টা করুন।",
 "publish-step":"সংবাদ সংরক্ষিত, কিন্তু লাইভ প্রকাশ সম্পন্ন হয়নি। স্ট্যাটাস দেখুন এবং আবার প্রকাশ করুন।",
 "image-required":"ছবি আপলোড ব্যর্থ হওয়ায় সংবাদটি খসড়ায় রাখা হয়েছে, লাইভে প্রকাশ করা হয়নি।",
 transition:"অনুমোদন বা প্রকাশের অবস্থা পরিবর্তন হয়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।",
 publish:"প্রকাশের আগে অন্তত ৩০ অক্ষরের সংবাদ, ১০ অক্ষরের বিবরণ ও বিভাগ নির্বাচন প্রয়োজন।",
 "preview-protected":"Preview মূল সাইটের একই ডাটাবেজ ব্যবহার করে। লাইভ সংবাদ প্রকাশ বা পরিবর্তন এখানে নিরাপত্তার জন্য বন্ধ রাখা হয়েছে।"
};
export default async function EditArticle({params,searchParams}:{
  params:Promise<{id:string}>;searchParams:Promise<{error?:string;success?:string;created?:string;image_error?:string}>
}){
  const {id}=await params;
  const {supabase,role}=await requireStaff();
  const {data:article}=await supabase.from("articles").select("id,slug,headline,summary,body,status,category_id,source_name,source_url,is_featured,hero_media_id").eq("id",id).maybeSingle();
  if(!article)notFound();
  const {data:categories}=await supabase.from("categories").select("id,label_bn").eq("is_active",true).order("sort_order");
  let media:{url:string;alt:string;caption:string;credit:string}|null=null;
  if(article.hero_media_id){
    const {data:image}=await supabase.from("media_assets")
      .select("id,storage_path,alt_text,caption,credit")
      .eq("id",article.hero_media_id).maybeSingle();
    if(image){
      const url=publicNewsImageUrl(supabase,image.storage_path,"thumb");
      if(url)media={
        url,alt:image.alt_text||"",caption:image.caption||"",credit:image.credit||"",
      };
    }
  }
  const query=await searchParams;
  return <main className="container admin-surface">
    <Link className="back-link" href="/admin">← ড্যাশবোর্ড</Link>
    <div className="admin-panel">
      <span className="category">বর্তমান অবস্থা: {article.status}</span><h1>সংবাদ সম্পাদনা</h1>
      {query.error && <p className="admin-alert" role="alert">{errorLabels[query.error]||"পরিবর্তন সম্পন্ন হয়নি।"}</p>}
      {(query.success||query.created) && <p className="admin-success" role="status">{
        query.created?"নতুন খসড়া তৈরি হয়েছে।":
        query.success==="approve"?"সংবাদ অনুমোদিত হয়েছে। এখন প্রকাশের জন্য প্রস্তুত।":
        query.success==="submit"?"সংবাদটি পর্যালোচনার জন্য পাঠানো হয়েছে।":
        query.success==="publish"?"সংবাদ প্রকাশিত হয়েছে।":
        query.success==="unpublish"?"সংবাদটির প্রকাশনা বন্ধ হয়েছে।":
        "সংবাদে পরিবর্তন সংরক্ষিত হয়েছে।"
      }</p>}
      {(article.status==="draft"||article.status==="approved") &&
        (!article.summary?.trim() || article.summary.trim().length<10) &&
        <p className="admin-note" role="note">প্রকাশের আগে সংক্ষিপ্ত বিবরণে অন্তত ১০ অক্ষর লিখতে হবে। অনুমোদন ও প্রকাশ দুটি আলাদা ধাপ।</p>}
      {query.image_error && <p className="admin-alert" role="alert">{({
        invalid_file:"JPG, PNG, WebP অথবা AVIF ছবি দিন।",
        invalid_image:"ছবিটি পড়া যাচ্ছে না অথবা ফাইলটি অসম্পূর্ণ। সঠিক JPG, PNG, WebP বা AVIF ছবি নির্বাচন করুন।",
        too_large:"ছবি সর্বোচ্চ ৪ MB হতে পারবে।",
        missing_bucket:"Image Storage পাওয়া যায়নি। Supabase Storage সেটআপ পরীক্ষা করুন।",
        storage:"ছবি আপলোড করা যায়নি। আবার চেষ্টা করুন।",
        metadata:"ছবি সংরক্ষণের তথ্য আপডেট হয়নি। আবার চেষ্টা করুন।",
        not_ready:"ছবি আপলোড সাময়িকভাবে বন্ধ।",
      } as Record<string,string>)[query.image_error]||"ছবি সংরক্ষণ করা যায়নি।"}</p>}
      <div className="admin-editor-preview-action">
        <Link className="admin-secondary" href={"/admin/articles/"+article.id+"/preview"}>
          <span aria-hidden="true">◉</span> ওয়েবসাইটের মতো প্রিভিউ দেখুন (লাইভ নয়)
        </Link>
        <p>Approved মানে প্রকাশিত নয়। প্রিভিউতে সম্পূর্ণ সংবাদ ও ছবিটি যাচাই করে তারপর প্রকাশের সিদ্ধান্ত নিন।</p>
      </div>
      <ArticleForm article={article} categories={categories||[]} role={role} media={media}/>
    </div>
  </main>;
}

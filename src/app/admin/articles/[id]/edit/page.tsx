import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {requireStaff} from "@/lib/auth/require-staff";
import {ArticleForm} from "@/components/admin/article-form";
import {publicNewsImageUrl} from "@/lib/news-media-paths";
export const metadata:Metadata={title:"সংবাদ সম্পাদনা",robots:{index:false,follow:false}};
const errorLabels:Record<string,string>={
 validation:"ফর্মের তথ্য আবার যাচাই করুন।",save:"পরিবর্তন সংরক্ষণ করা যায়নি।",
 transition:"এই অবস্থায় উল্লিখিত প্রকাশনা কার্যক্রম অনুমোদিত নয়।",
 publish:"প্রকাশের আগে অন্তত ৩০ অক্ষরের সংবাদ, ১০ অক্ষরের বিবরণ ও বিভাগ নির্বাচন প্রয়োজন।"
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
      {(query.success||query.created) && <p className="admin-success" role="status">সংবাদ সংরক্ষিত হয়েছে।</p>}
      {query.image_error && <p className="admin-alert" role="alert">{({
        invalid_file:"শুধু JPG, PNG অথবা WebP ফাইল আপলোড করুন।",
        invalid_image:"ছবি অসম্পূর্ণ, নষ্ট অথবা রেজোলিউশন কম। অন্তত 940 × 450 পিক্সেলের সম্পূর্ণ ছবি দিন।",
        too_large:"ছবি সর্বোচ্চ ৪ MB হতে পারবে।",
        missing_bucket:"Preview Image Storage প্রস্তুত হয়নি। Supabase Storage সেটআপ প্রয়োজন।",
        storage:"ছবি আপলোড করা যায়নি। আবার চেষ্টা করুন।",
        metadata:"ছবি সংরক্ষণের তথ্য আপডেট হয়নি। আবার চেষ্টা করুন।",
        not_ready:"ছবি আপলোড শুধু Preview সংস্করণে চালু আছে।",
      } as Record<string,string>)[query.image_error]||"ছবি সংরক্ষণ করা যায়নি।"}</p>}
      <ArticleForm article={article} categories={categories||[]} role={role} media={media}/>
    </div>
  </main>;
}

import type {Metadata} from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/require-staff";
import { ArticleForm } from "@/components/admin/article-form";
export const metadata:Metadata={title:"নতুন সংবাদ",robots:{index:false,follow:false}};
export default async function NewArticle({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const {supabase,role}=await requireStaff();
  const {data:categories}=await supabase.from("categories").select("id,label_bn").eq("is_active",true).order("sort_order");
  const {error}=await searchParams;
  return <main className="container admin-surface">
    <Link className="back-link" href="/admin">← ড্যাশবোর্ড</Link>
    <div className="admin-panel">
      <h1>নতুন সংবাদ লিখুন</h1>
      {error && <p className="admin-alert" role="alert">{error==="validation"?"ফর্মের তথ্য যাচাই করুন।":error==="images-disabled"?"ছবি আপলোড সাময়িকভাবে বন্ধ।":error==="permission"?"শুধু অনুমোদিত Owner বা Editor লাইভ সংবাদ প্রকাশ করতে পারবেন।":error==="publish-validation"?"লাইভ প্রকাশ করতে বিভাগ, ১০ অক্ষরের সংক্ষিপ্ত বিবরণ ও ৩০ অক্ষরের সম্পূর্ণ সংবাদ দিন।":"সংবাদ সংরক্ষণ করা যায়নি। Slug অন্য সংবাদের সঙ্গে মিলে গেছে কি না দেখুন।"}</p>}
      <ArticleForm categories={categories||[]} role={role}/>
    </div>
  </main>;
}

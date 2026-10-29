import type {Metadata} from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/require-staff";
import { signOut } from "@/app/admin/login/actions";
export const metadata:Metadata={title:"নিউজরুম ড্যাশবোর্ড",robots:{index:false,follow:false}};
const statusLabels:Record<string,string>={draft:"খসড়া",in_review:"পর্যালোচনায়",approved:"অনুমোদিত",scheduled:"নির্ধারিত",published:"প্রকাশিত",unpublished:"প্রকাশনা বন্ধ",archived:"আর্কাইভ"};
export default async function AdminDashboard() {
  const {supabase,user,role,displayName}=await requireStaff();
  const {data:articles,error}=await supabase.from("articles")
    .select("id,headline,status,updated_at,slug").order("updated_at",{ascending:false}).limit(40);
  // Staff-only RPC returns aggregated counts, never unique visitor fingerprints.
  const articleIds=(articles||[]).map(article=>article.id);
  const {data:viewRows,error:viewError}=articleIds.length
    ?await supabase.rpc("get_staff_article_view_counts",{p_article_ids:articleIds})
    :{data:[],error:null};
  const viewCounts=new Map<string,number>(
    (viewRows||[]).map(row=>[row.article_id,Number(row.view_count)||0])
  );
  const bnCount=(count:number)=>new Intl.NumberFormat("bn-BD").format(count);
  return <main className="container admin-surface">
    <div className="admin-heading">
      <div><span className="category">BENGAL WAVE CMS</span><h1>নিউজরুম ড্যাশবোর্ড</h1><p>{displayName||user.email} · {role}</p></div>
      <form action={signOut}><button className="admin-secondary" type="submit">লগআউট</button></form>
    </div>
    <div className="admin-panel">
      <div className="admin-toolbar"><h2>সাম্প্রতিক সংবাদ</h2><Link className="admin-primary" href="/admin/articles/new">+ নতুন সংবাদ</Link></div>
      {error && <p className="admin-alert" role="alert">সংবাদ তালিকা আনা যায়নি। পরে চেষ্টা করুন।</p>}
      {viewError && <p className="admin-alert" role="alert">সংবাদের পাঠসংখ্যা আনা যাচ্ছে না। সংবাদ তালিকা স্বাভাবিক রয়েছে।</p>}
      {!viewError && <p className="admin-view-note">প্রকাশিত সংবাদের পাশে মোট পাঠসংখ্যা দেখানো হচ্ছে। একই ব্রাউজারে একই সংবাদ দিনে একবার গণনা হয়।</p>}
      {!articles?.length && !error && <p>এখনো কোনো সংবাদ যোগ করা হয়নি। ‘নতুন সংবাদ’ থেকে শুরু করুন।</p>}
      <div className="admin-article-list">{articles?.map(a=><div className="admin-article-row" key={a.id}><div>
        <strong>{a.headline}</strong><small>{statusLabels[a.status]||a.status} · {new Date(a.updated_at).toLocaleDateString("bn-BD",{timeZone:"Asia/Dhaka"})}</small>
        {a.status==="published"&&!viewError&&<small className="admin-view-count" aria-label={"পাঠসংখ্যা "+bnCount(viewCounts.get(a.id)||0)}>পাঠসংখ্যা: <strong>{bnCount(viewCounts.get(a.id)||0)}</strong></small>}
      </div>
        <Link href={"/admin/articles/"+a.id+"/edit"}>সম্পাদনা ↗</Link>
      </div>)}</div>
    </div>
  </main>;
}

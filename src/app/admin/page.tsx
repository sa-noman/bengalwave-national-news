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
  return <main className="container admin-surface">
    <div className="admin-heading">
      <div><span className="category">BENGAL WAVE CMS</span><h1>নিউজরুম ড্যাশবোর্ড</h1><p>{displayName||user.email} · {role}</p></div>
      <form action={signOut}><button className="admin-secondary" type="submit">লগআউট</button></form>
    </div>
    <div className="admin-panel">
      <div className="admin-toolbar"><h2>সাম্প্রতিক সংবাদ</h2><Link className="admin-primary" href="/admin/articles/new">+ নতুন সংবাদ</Link></div>
      {error && <p className="admin-alert" role="alert">সংবাদ তালিকা আনা যায়নি। পরে চেষ্টা করুন।</p>}
      {!articles?.length && !error && <p>এখনো কোনো সংবাদ যোগ করা হয়নি। ‘নতুন সংবাদ’ থেকে শুরু করুন।</p>}
      <div className="admin-article-list">{articles?.map(a=><div className="admin-article-row" key={a.id}><div>
        <strong>{a.headline}</strong><small>{statusLabels[a.status]||a.status} · {new Date(a.updated_at).toLocaleDateString("bn-BD",{timeZone:"Asia/Dhaka"})}</small></div>
        <Link href={"/admin/articles/"+a.id+"/edit"}>সম্পাদনা ↗</Link>
      </div>)}</div>
    </div>
  </main>;
}

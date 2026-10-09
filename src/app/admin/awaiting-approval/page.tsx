import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {isSupabaseConfigured} from "@/lib/supabase/config";
import {signOut} from "@/app/admin/login/actions";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"অ্যাকাউন্ট অনুমোদনের অপেক্ষায়",robots:{index:false,follow:false}};

export default async function AwaitingApproval(){
  if(!isSupabaseConfigured()) redirect("/admin/login?error=setup");
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  return <main className="container admin-surface"><div className="admin-panel auth-panel">
    <span className="category">BENGAL WAVE CMS</span>
    <h1>ইমেইল যাচাই সম্পন্ন</h1>
    <p>পাসওয়ার্ড নির্ধারণ করা হয়েছে। এখন প্রশাসনিকভাবে আপনার Owner Permission নিশ্চিত করতে হবে। অনুমোদন না পাওয়া পর্যন্ত সংবাদ সম্পাদনা বা প্রকাশ করা যাবে না।</p>
    <form action={signOut}><button className="admin-secondary" type="submit">লগআউট</button></form>
  </div></main>;
}

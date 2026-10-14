import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {MfaChallenge} from "./mfa-challenge";

export const metadata:Metadata={title:"অ্যাডমিন দুই-ধাপ যাচাই",robots:{index:false,follow:false}};

export default async function AdminMfaPage(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const {data:profile}=await supabase.from("profiles")
    .select("role,is_active").eq("id",user.id).maybeSingle();
  if(!profile?.is_active || !["owner","editor"].includes(profile.role))
    redirect("/admin/access-denied");
  return <main className="container admin-surface">
    <div className="admin-panel auth-panel">
      <span className="category">BENGAL WAVE CMS</span>
      <h1>দুই-ধাপ নিরাপত্তা যাচাই</h1>
      <p>অ্যাডমিন অ্যাকাউন্ট সুরক্ষিত রাখতে Authenticator অ্যাপের কোড যাচাই করুন।</p>
      <MfaChallenge />
    </div>
  </main>;
}

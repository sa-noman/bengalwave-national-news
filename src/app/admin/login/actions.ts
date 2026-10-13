"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signIn(formData:FormData) {
  if(!isSupabaseConfigured()) redirect("/admin/login?error=setup");
  const email=String(formData.get("email")||"").trim();
  const password=String(formData.get("password")||"");
  if(!email || !password) redirect("/admin/login?error=credentials");
  const supabase=await createSupabaseServerClient();
  // Atomic, database-backed counters work across all serverless instances.
  // Hash identifiers before storing them; never store passwords or raw IPs.
  const requestHeaders=await headers();
  const ip=(requestHeaders.get("x-real-ip")||requestHeaders.get("x-forwarded-for")?.split(",")[0]||"unknown").trim();
  const digest=(value:string)=>createHash("sha256").update(value).digest("hex");
  const {data:allowed,error:limitError}=await supabase.rpc("check_editor_login_rate_limit",{
    p_ip_key:digest("ip:"+ip),
    p_account_key:digest("account:"+email.toLowerCase()),
  });
  // Fail closed if the migration isn't installed or database is unavailable.
  if(limitError || allowed!==true) redirect("/admin/login?error=limited");
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error) redirect("/admin/login?error=credentials");
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login?error=credentials");
  const {data:profile}=await supabase.from("profiles")
    .select("is_active,role").eq("id",user.id).maybeSingle();
  if(!profile?.is_active || !["owner","editor","contributor"].includes(profile.role)){
    await supabase.auth.signOut();
    redirect("/admin/login?error=access");
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase=await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

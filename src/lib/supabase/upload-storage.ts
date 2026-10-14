import "server-only";
import {createClient} from "@supabase/supabase-js";
import type {SupabaseClient} from "@supabase/supabase-js";

/** Opt-in until isolated upload tests and the matching Storage policies pass. */
export async function uploadStorage(client:SupabaseClient,userId:string){
  const mode=process.env.BW_STRICT_UPLOAD_GATEWAY;
  if(mode===undefined||mode==="false")return client.storage;
  if(mode!=="true")throw new Error("Upload gateway unavailable");
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user||user.id!==userId)throw new Error("Upload unauthorized");
  const {data:profile,error:profileError}=await client.from("profiles")
    .select("role,is_active").eq("id",user.id).maybeSingle();
  if(profileError||!profile?.is_active||
    !["owner","editor","contributor"].includes(profile.role))throw new Error("Upload unauthorized");
  if(profile.role==="owner"||profile.role==="editor"){
    const {data:aal,error:aalError}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if(aalError||aal?.currentLevel!=="aal2")throw new Error("Upload unauthorized");
  }
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_UPLOAD_SECRET_KEY;
  // No fallback in strict mode: missing credentials must never reopen direct writes.
  if(!url||!key)throw new Error("Upload gateway unavailable");
  return createClient(url,key,{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
  }).storage;
}

"use client";

import {createBrowserClient} from "@supabase/ssr";
import {useEffect,useState} from "react";

/**
 * Supabase's DEFAULT recovery email redirects to Site URL with a # fragment
 * containing access_token and refresh_token. Server routes cannot read #.
 * This browser-only page consumes the fragment, sets SSR cookies, and only
 * then moves to the existing password form. No custom SMTP/template required.
 */
export default function RecoveryPage(){
  const [message,setMessage]=useState("রিকভারি লিংক যাচাই করা হচ্ছে…");
  const [failed,setFailed]=useState(false);

  useEffect(()=>{
    let active=true;
    async function finishRecovery(){
      const hash=new URLSearchParams(window.location.hash.slice(1));
      const query=new URLSearchParams(window.location.search);
      const failure=hash.get("error")||query.get("error");
      const code= query.get("code");
      const accessToken=hash.get("access_token");
      const refreshToken=hash.get("refresh_token");
      const kind=hash.get("type")||query.get("type");
      if(failure||(!code&&(!accessToken||!refreshToken))||(!code&&kind!=="recovery")){
        if(active){setFailed(true);setMessage("পাসওয়ার্ড রিসেটের লিংকটি অবৈধ বা মেয়াদ শেষ। Supabase থেকে নতুন Recovery Email পাঠান।");}
        window.history.replaceState(null,"",window.location.pathname);
        return;
      }
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if(!url||!key){
        if(active){setFailed(true);setMessage("অ্যাডমিন লগইনের সেটআপ অসম্পূর্ণ।");}
        return;
      }
      // Prevent a credential-bearing URL from leaking through further navigation.
      const supabase=createBrowserClient(url,key,{
        auth:{detectSessionInUrl:false},
      });
      try {
        const {error}=code
          ? await supabase.auth.exchangeCodeForSession(code)
          : await supabase.auth.setSession({
              access_token:accessToken!,
              refresh_token:refreshToken!,
            });
        if(error) throw error;
        const {data:{user},error:userError}=await supabase.auth.getUser();
        if(userError||!user?.email_confirmed_at) throw new Error("Invalid verified account");
        if(active)window.location.replace("/admin/set-password");
      }catch{
        window.history.replaceState(null,"",window.location.pathname);
        if(active){setFailed(true);setMessage("রিকভারি লিংক কাজ করেনি। নতুন ইমেইল পাঠিয়ে শুধু সর্বশেষ লিংকটি ব্যবহার করুন।");}
      }
    }
    void finishRecovery();
    return ()=>{active=false;};
  },[]);

  return <main className="container admin-surface">
    <div className="admin-panel auth-panel">
      <span className="category">BENGAL WAVE CMS</span>
      <h1>পাসওয়ার্ড রিসেট</h1>
      <p role="status">{message}</p>
      {failed&&<p className="admin-note">
        Supabase Dashboard → Authentication → Users থেকে আপনার অ্যাকাউন্টে আবার
        Send password recovery দিন। নতুন লিংকটি এই ব্রাউজারেই খুলুন।
      </p>}
    </div>
  </main>;
}

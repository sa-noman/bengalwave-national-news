"use client";
import {useEffect,useState} from "react";
import {createBrowserClient} from "@supabase/ssr";

export function AuthReturnHandler(){
  const [message,setMessage]=useState("আমন্ত্রণ যাচাই করা হচ্ছে…");
  useEffect(()=>{
    let cancelled=false;
    async function exchange(){
      const current=new URL(window.location.href);
      const fragment=new URLSearchParams(current.hash.slice(1));
      const accessToken=fragment.get("access_token");
      const refreshToken=fragment.get("refresh_token");
      const code=current.searchParams.get("code");
      const error=fragment.get("error")||current.searchParams.get("error");

      // Strip sensitive credentials from the address bar before any additional navigation.
      window.history.replaceState(null,"",current.pathname);
      if(error || (!code && !(accessToken&&refreshToken))){
        if(!cancelled)setMessage("আমন্ত্রণটি পাওয়া যায়নি বা মেয়াদ শেষ হয়েছে। নতুন Invitation প্রয়োজন।");
        return;
      }
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if(!url || !key){
        if(!cancelled)setMessage("Supabase Connection এখনো সম্পূর্ণ হয়নি।");
        return;
      }
      try{
        const supabase=createBrowserClient(url,key,{
          auth:{detectSessionInUrl:false,flowType:"pkce"}
        });
        const outcome=code
          ? await supabase.auth.exchangeCodeForSession(code)
          : await supabase.auth.setSession({access_token:accessToken!,refresh_token:refreshToken!});

        if(outcome.error)throw outcome.error;
        const {data:{user},error:identityError}=await supabase.auth.getUser();
        if(identityError || !user?.email_confirmed_at)
          throw new Error("A verified email session is required");
        if(!cancelled)window.location.replace("/admin/set-password");
      }catch{
        if(!cancelled)setMessage("আমন্ত্রণ যাচাই করা যায়নি। মেয়াদ শেষ হলে নতুন Invitation নিন।");
      }
    }
    void exchange();
    return ()=>{cancelled=true;};
  },[]);
  return <main className="container admin-surface"><div className="admin-panel auth-panel">
    <span className="category">BENGAL WAVE CMS</span>
    <h1>ইমেইল যাচাই</h1>
    <p role="status">{message}</p>
    <p className="admin-note">এই পেজে কখনো পাসওয়ার্ড বা যাচাইকরণ কোড শেয়ার করতে হবে না।</p>
  </div></main>;
}

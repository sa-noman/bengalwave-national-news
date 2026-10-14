"use client";

import {createBrowserClient} from "@supabase/ssr";
import {useEffect,useMemo,useState} from "react";

type TotpEnrollment={factorId:string;qr:string;secret:string};
export function MfaChallenge(){
  const supabase=useMemo(()=>{
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    return url&&key?createBrowserClient(url,key):null;
  },[]);
  const [factorId,setFactorId]=useState("");
  const [enrollment,setEnrollment]=useState<TotpEnrollment|null>(null);
  const [code,setCode]=useState("");
  const [status,setStatus]=useState("দুই-ধাপ যাচাই প্রস্তুত হচ্ছে…");
  const [busy,setBusy]=useState(true);

  useEffect(()=>{
    if(!supabase){setStatus("নিরাপত্তা সেটআপ পাওয়া যায়নি।");setBusy(false);return;}
    let active=true;
    const ready=async()=>{
      try{
        const {data:{user},error:userError}=await supabase.auth.getUser();
        if(userError||!user)throw Error("আপনাকে আবার লগইন করতে হবে।");
        const {data:level,error:levelError}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if(levelError)throw levelError;
        if(level.currentLevel==="aal2"){
          if(active)window.location.replace("/admin");
          return;
        }
        const {data:factors,error:factorsError}=await supabase.auth.mfa.listFactors();
        if(factorsError)throw factorsError;
        const verified=factors.totp.find(f=>f.status==="verified");
        if(verified){
          if(active){setFactorId(verified.id);setStatus("Authenticator অ্যাপে দেখানো ৬ সংখ্যার কোড লিখুন।");}
        }else{
          const {data:created,error:enrollError}=await supabase.auth.mfa.enroll({factorType:"totp"});
          if(enrollError||!created?.totp)throw enrollError||Error("TOTP সেটআপ ব্যর্থ।");
          if(active){
            setFactorId(created.id);
            setEnrollment({factorId:created.id,qr:created.totp.qr_code,secret:created.totp.secret});
            setStatus("Authenticator অ্যাপে নিচের QR কোড স্ক্যান করুন, তারপর ৬ সংখ্যার কোড দিন।");
          }
        }
      }catch{
        if(active)setStatus("যাচাই প্রস্তুত করা যায়নি। পেজটি রিফ্রেশ করুন অথবা আবার লগইন করুন।");
      }finally{if(active)setBusy(false);}
    };
    void ready();
    return ()=>{active=false;};
  },[supabase]);

  async function verify(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!supabase||!factorId||!/^[0-9]{6}$/.test(code))return;
    setBusy(true);
    setStatus("কোড যাচাই হচ্ছে…");
    try{
      const {error}=await supabase.auth.mfa.challengeAndVerify({factorId,code});
      if(error)throw error;
      const {data:level,error:levelError}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if(levelError||level.currentLevel!=="aal2")throw Error("MFA incomplete");
      // @supabase/ssr writes the upgraded session in browser cookies.
      window.location.replace("/admin");
    }catch{
      setStatus("কোডটি সঠিক নয় অথবা মেয়াদ শেষ হয়েছে। নতুন কোড দিয়ে আবার চেষ্টা করুন।");
      setBusy(false);
      setCode("");
    }
  }

  return <>
    <p className="admin-note" role="status">{status}</p>
    {enrollment&&<div>
      {/* Supabase provides a data URL, never a third-party tracking URL. */}
      <img src={enrollment.qr} alt="Authenticator অ্যাপের TOTP QR কোড"
        width={180} height={180} style={{maxWidth:"100%",height:"auto"}}/>
      <p className="admin-note">QR স্ক্যান সম্ভব না হলে অ্যাপে এই Setup Key লিখুন:</p>
      <code style={{overflowWrap:"anywhere"}}>{enrollment.secret}</code>
    </div>}
    {factorId&&<form className="admin-form" onSubmit={verify}>
      <label htmlFor="mfa-code">Authenticator Code</label>
      <input id="mfa-code" type="text" inputMode="numeric" autoComplete="one-time-code"
        pattern="[0-9]{6}" maxLength={6} required value={code}
        onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/>
      <button type="submit" className="admin-primary" disabled={busy||code.length!==6}>যাচাই করুন</button>
    </form>}
  </>;
}

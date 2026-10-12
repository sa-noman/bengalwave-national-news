"use client";

import Link from "next/link";
import Script from "next/script";
import {useEffect,useState} from "react";

const STORAGE_KEY="bw-analytics-consent-v1";
const SETTINGS_EVENT="bw:analytics-preferences";
type Choice="accepted"|"rejected"|null;

export function AnalyticsConsent({measurementId}:{measurementId:string}){
 const [ready,setReady]=useState(false);
 const [choice,setChoice]=useState<Choice>(null);
 const [showPreferences,setShowPreferences]=useState(false);

 useEffect(()=>{
  try{
   const saved=window.localStorage.getItem(STORAGE_KEY);
   setChoice(saved==="accepted"||saved==="rejected"?saved:null);
  }catch{setChoice(null);}
  setReady(true);
  const openPreferences=()=>setShowPreferences(true);
  window.addEventListener(SETTINGS_EVENT,openPreferences);
  return ()=>window.removeEventListener(SETTINGS_EVENT,openPreferences);
 },[]);

 const select=(value:Exclude<Choice,null>)=>{
  const wasAccepted=choice==="accepted";
  try{window.localStorage.setItem(STORAGE_KEY,value);}catch{/* private storage may be unavailable */}
  setChoice(value);
  setShowPreferences(false);
  // Unmounting a script does not undo a running gtag instance. Reload on
  // withdrawal so this page cannot continue to collect analytics events.
  if(value==="rejected"&&wasAccepted){window.location.reload();}
 };

 if(!ready)return null;
 return <>
  {choice==="accepted"&&<>
   <Script id="bw-ga4-consent-config" strategy="afterInteractive">{`
     window.dataLayer=window.dataLayer||[];
     function gtag(){dataLayer.push(arguments);}
     gtag('consent','default',{
       analytics_storage:'granted',
       ad_storage:'denied',
       ad_user_data:'denied',
       ad_personalization:'denied'
     });
     gtag('js',new Date());
     gtag('config',${JSON.stringify(measurementId)});
   `}</Script>
   <Script
    src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
    strategy="afterInteractive"
   />
  </>}
  {(choice===null||showPreferences)&&
   <section className="bw-analytics-consent" aria-label="ভিজিটর পরিসংখ্যানের অনুমতি">
    <p>পাঠকের অভিজ্ঞতা উন্নত করতে আমরা Google Analytics ব্যবহার করতে চাই। আপনার সম্মতি ছাড়া Analytics চালু হবে না। <Link href="/privacy">গোপনীয়তা নীতি</Link></p>
    <div className="bw-analytics-consent-actions">
     <button type="button" onClick={()=>select("rejected")}>প্রত্যাখ্যান</button>
     <button type="button" onClick={()=>select("accepted")}>সম্মতি দিন</button>
    </div>
   </section>}
 </>;
}

/** Accessible from /privacy so visitors can change their earlier choice. */
export function AnalyticsPreferencesButton(){
 return <button type="button" className="bw-analytics-preferences-button" onClick={()=>{
  window.dispatchEvent(new Event(SETTINGS_EVENT));
 }}>Analytics অনুমতি পরিবর্তন করুন</button>;
}

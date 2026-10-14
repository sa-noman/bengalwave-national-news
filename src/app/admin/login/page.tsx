import { headers } from "next/headers";
import { loginCaptchaMode } from "@/lib/auth/turnstile";
import { LoginTurnstile } from "./turnstile";
import type {Metadata} from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signIn } from "./actions";
export const metadata:Metadata={title:"অ্যাডমিন লগইন",robots:{index:false,follow:false}};
const errors:Record<string,string>={
  captcha:"নিরাপত্তা যাচাই সফল হয়নি। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।",
  setup:"Supabase-এর নিরাপদ Environment Variables এখনো যুক্ত করা হয়নি।",
  credentials:"ইমেইল বা পাসওয়ার্ড সঠিক হয়নি।",
  limited:"অল্প সময়ে অনেকবার লগইন চেষ্টা হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।",
  access:"আপনার অ্যাকাউন্টে সম্পাদকীয় অনুমতি নেই।",
  invite:"আমন্ত্রণের লিংকটি অবৈধ বা মেয়াদোত্তীর্ণ। নতুন আমন্ত্রণ নিতে হবে।",
};
export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const {error}=await searchParams;
  const ready=isSupabaseConfigured();
  const captchaEnabled=loginCaptchaMode()!=="off";
  const nonce=captchaEnabled ? (await headers()).get("x-nonce")||"" : "";
  return <main className="container admin-surface">
    <div className="admin-panel auth-panel">
      <span className="category">BENGAL WAVE CMS</span>
      <h1>সম্পাদকীয় লগইন</h1>
      <p>শুধুমাত্র অনুমোদিত Bengal Wave সম্পাদকদের জন্য। সাধারণ পাঠকদের নিবন্ধন এখানে নেই।</p>
      {!ready && <p className="admin-alert" role="status">{errors.setup}</p>}
      {error && errors[error] && <p className="admin-alert" role="alert">{errors[error]}</p>}
      <form action={signIn} className="admin-form">
        {captchaEnabled && <LoginTurnstile siteKey={process.env.TURNSTILE_SITE_KEY||""} nonce={nonce}/>}
        <label htmlFor="email">ইমেইল</label>
        <input id="email" name="email" type="email" autoComplete="username" required disabled={!ready}/>
        <label htmlFor="password">পাসওয়ার্ড</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required disabled={!ready}/>
        <button className="admin-primary" type="submit" disabled={!ready}>প্রবেশ করুন</button>
      </form>
      <p className="admin-note">Owner ইমেইল নিশ্চিত হলে প্রশাসনিকভাবে অ্যাকাউন্ট চালু করা হবে।</p>
    </div>
  </main>;
}

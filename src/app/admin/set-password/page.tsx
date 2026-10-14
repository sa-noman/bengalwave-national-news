import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {isSupabaseConfigured} from "@/lib/supabase/config";
import {setInvitedPassword} from "./actions";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Admin Password Setup",robots:{index:false,follow:false}};

export default async function SetPassword({searchParams}:{
  searchParams:Promise<{error?:string}>
}){
  if(!isSupabaseConfigured()) redirect("/admin/login?error=setup");
  const supabase=await createSupabaseServerClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user||!user.email_confirmed_at) redirect("/admin/login?error=invite");
  const {error:formError}=await searchParams;
  return <main className="container admin-surface"><div className="admin-panel auth-panel">
    <span className="category">BENGAL WAVE CMS</span>
    <h1>নিরাপদ পাসওয়ার্ড নির্ধারণ</h1>
    <p>ইমেইল যাচাই সম্পন্ন হয়েছে। আপনার পাসওয়ার্ড এখানে সেট করুন। এটি কাউকে পাঠাবেন না।</p>
    {formError && <p className="admin-alert" role="alert">
      {formError==="password"?
        "১২ থেকে ১২৮ অক্ষরের একই পাসওয়ার্ড দুবার দিন।":
        formError==="compromised"?
        "এই পাসওয়ার্ডটি আগে তথ্য ফাঁসে পাওয়া গেছে। আরও শক্তিশালী ও নতুন একটি পাসওয়ার্ড দিন।":
        "পাসওয়ার্ড পরিবর্তন করা যায়নি। আবার চেষ্টা করুন।"}
    </p>}
    <form action={setInvitedPassword} className="admin-form">
      <label htmlFor="password">নতুন পাসওয়ার্ড
        <input id="password" name="password" type="password"
          autoComplete="new-password" minLength={12} maxLength={128} required/>
      </label>
      <label htmlFor="confirm-password">পাসওয়ার্ড নিশ্চিত করুন
        <input id="confirm-password" name="confirm_password" type="password"
          autoComplete="new-password" minLength={12} maxLength={128} required/>
      </label>
      <button className="admin-primary" type="submit">পাসওয়ার্ড সংরক্ষণ করুন</button>
    </form>
    <p className="admin-note">কেবল আমন্ত্রিত ও যাচাইকৃত ব্যবহারকারী এই ধাপ সম্পন্ন করতে পারবেন।</p>
  </div></main>;
}

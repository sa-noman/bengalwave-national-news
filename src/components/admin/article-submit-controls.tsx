"use client";

import {useFormStatus} from "react-dom";
import {useState} from "react";
import type {MouseEvent} from "react";
import {hasPublishableStoryText} from "@/lib/rich-article";
import {
  approveArticle,
  createAndPublishArticle,
  submitArticleForReview,
  publishArticle,
  unpublishArticle,
} from "@/app/admin/actions";

export function ArticleSubmitControls({status,isEditor,previewOnly=false}:{
  status?:string;
  isEditor:boolean;
  previewOnly?:boolean;
}){
  const {pending}=useFormStatus();
  const [publishError,setPublishError]=useState("");
  function validateDirectPublish(event:MouseEvent<HTMLButtonElement>){
    const form=event.currentTarget.form;
    const summary=form?.elements.namedItem("summary") as HTMLTextAreaElement|null;
    const body=form?.elements.namedItem("body") as HTMLInputElement|null;
    const category=form?.elements.namedItem("category_id") as HTMLSelectElement|null;
    if(!category?.value || (summary?.value.trim().length||0)<10 || !hasPublishableStoryText(body?.value||"")){
      event.preventDefault();
      setPublishError("লাইভ প্রকাশের আগে বিভাগ, অন্তত ১০ অক্ষরের সংক্ষিপ্ত বিবরণ এবং ৩০ অক্ষরের সম্পূর্ণ সংবাদ লিখুন।");
      return;
    }
    setPublishError("");
  }

  return <>
    <div className="admin-controls">
      <button className="admin-secondary" type="button" disabled={pending}
       onClick={()=>window.dispatchEvent(new Event("bw:open-draft-preview"))}>
        ◉ প্রকাশের আগে সংবাদ প্রিভিউ দেখুন
      </button>
      <button className="admin-primary" type="submit" disabled={pending||(previewOnly&&status==="published")}>
        {pending?"সংরক্ষণ হচ্ছে…":status?"পরিবর্তন সংরক্ষণ করুন":"খসড়া হিসেবে সংরক্ষণ করুন"}
      </button>
      {!status && isEditor && !previewOnly &&
        <button className="admin-primary" type="submit" formAction={createAndPublishArticle}
          onClick={validateDirectPublish} disabled={pending}>
          ছবি ও সংবাদ সরাসরি লাইভ প্রকাশ করুন
        </button>}
      {status==="draft"&&
        <button className="admin-secondary" type="submit" formAction={submitArticleForReview} disabled={pending}>
          পর্যালোচনার জন্য পাঠান
        </button>}
      {status&&isEditor&&["draft","in_review"].includes(status)&&
        <button className="admin-secondary" type="submit" formAction={approveArticle} disabled={pending}>
          অনুমোদন করুন
        </button>}
      {status==="approved"&&isEditor&&
        <button className="admin-primary" type="submit" formAction={publishArticle} disabled={pending||previewOnly}>
          সংবাদ প্রকাশ করুন
        </button>}
      {status==="published"&&isEditor&&
        <button className="admin-danger" type="submit" formAction={unpublishArticle} disabled={pending||previewOnly}>
          প্রকাশনা বন্ধ করুন
        </button>}
    </div>
    {publishError && <p className="admin-alert" role="alert">{publishError}</p>}
    {!status&&isEditor&&!previewOnly&&<p className="admin-note">লাইভ প্রকাশ করলে নির্বাচিত ছবিটি আগে সংরক্ষণ ও যাচাই করা হবে। কোনো সমস্যা হলে সংবাদ খসড়ায় থাকবে, প্রকাশিত হবে না।</p>}
    {previewOnly && (status==="approved"||status==="published") && <p className="admin-note" role="status">
      Preview ব্রাঞ্চ মূল সাইটের ডাটাবেজ ব্যবহার করে। তাই এখানে লাইভ প্রকাশ বা প্রকাশিত সংবাদ সম্পাদনা বন্ধ।
      প্রিভিউ বাটন দিয়ে সংবাদ যাচাই করুন। লাইভ প্রকাশ করতে আলাদা অনুমোদন প্রয়োজন।
    </p>}
    {pending&&<p className="admin-image-selected" role="status">
      সংবাদ ও ছবি যাচাই, অপ্টিমাইজ এবং সংরক্ষণ করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।
    </p>}
  </>;
}

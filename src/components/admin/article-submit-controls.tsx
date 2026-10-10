"use client";

import {useFormStatus} from "react-dom";
import {
  approveArticle,
  submitArticleForReview,
  publishArticle,
  unpublishArticle,
} from "@/app/admin/actions";

export function ArticleSubmitControls({status,isEditor}:{
  status?:string;
  isEditor:boolean;
}){
  const {pending}=useFormStatus();
  return <>
    <div className="admin-controls">
      <button className="admin-primary" type="submit"  disabled={pending}>
        {pending?"সংরক্ষণ হচ্ছে…":"খসড়া সংরক্ষণ / পরিবর্তন সংরক্ষণ"}
      </button>
      {status==="draft"&&
        <button className="admin-secondary" type="submit" formAction={submitArticleForReview} disabled={pending}>
          পর্যালোচনার জন্য পাঠান
        </button>}
      {status&&isEditor&&["draft","in_review"].includes(status)&&
        <button className="admin-secondary" type="submit" formAction={approveArticle} disabled={pending}>
          অনুমোদন করুন
        </button>}
      {status==="approved"&&isEditor&&
        <button className="admin-primary" type="submit" formAction={publishArticle} disabled={pending}>
          সংবাদ প্রকাশ করুন
        </button>}
      {status==="published"&&isEditor&&
        <button className="admin-danger" type="submit" formAction={unpublishArticle} disabled={pending}>
          প্রকাশনা বন্ধ করুন
        </button>}
    </div>
    {pending&&<p className="admin-image-selected" role="status">
      সংবাদ ও ছবি যাচাই, অপ্টিমাইজ এবং সংরক্ষণ করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।
    </p>}
  </>;
}

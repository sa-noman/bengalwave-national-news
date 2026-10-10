"use client";

import {useFormStatus} from "react-dom";
import {
  approveArticle,
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
  return <>
    <div className="admin-controls">
      <button className="admin-primary" type="submit" disabled={pending||(previewOnly&&status==="published")}>
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
        <button className="admin-primary" type="submit" formAction={publishArticle} disabled={pending||previewOnly}>
          সংবাদ প্রকাশ করুন
        </button>}
      {status==="published"&&isEditor&&
        <button className="admin-danger" type="submit" formAction={unpublishArticle} disabled={pending||previewOnly}>
          প্রকাশনা বন্ধ করুন
        </button>}
    </div>
    {previewOnly && (status==="approved"||status==="published") && <p className="admin-note" role="status">
      Preview ব্রাঞ্চ মূল সাইটের ডাটাবেজ ব্যবহার করে। তাই এখানে লাইভ প্রকাশ বা প্রকাশিত সংবাদ সম্পাদনা বন্ধ।
      প্রিভিউ বাটন দিয়ে সংবাদ যাচাই করুন। লাইভ প্রকাশ করতে আলাদা অনুমোদন প্রয়োজন।
    </p>}
    {pending&&<p className="admin-image-selected" role="status">
      সংবাদ ও ছবি যাচাই, অপ্টিমাইজ এবং সংরক্ষণ করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।
    </p>}
  </>;
}

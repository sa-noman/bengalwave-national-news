export function PreviewNotice({samples=false}:{samples?:boolean}){
 return <div className="bw-preview-notice" role="status"><div className="bw-wrap">
   <span className="bw-preview-indicator" aria-hidden="true"/>
   <strong>GitHub Preview · লাইভ নয়</strong>
   <span>{samples
     ?"এখানকার নমুনা সংবাদগুলো শুধুই লেআউট পরীক্ষার জন্য।"
     :"এই প্রিভিউতে শুধুমাত্র প্রকাশিত সংবাদ দেখানো হয়। অনুমোদিত কিন্তু অপ্রকাশিত সংবাদ দেখতে Admin-এর ব্যক্তিগত Preview ব্যবহার করুন।"}
   </span>
 </div></div>;
}

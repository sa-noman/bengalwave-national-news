"use client";

import {useEffect,useState} from "react";

const MAX_SIZE=12*1024*1024;
const accepted=["image/jpeg","image/png","image/webp"];

export function ArticleImageField({
  currentUrl,
  currentAlt="",
  currentCaption="",
  currentCredit="",
  hasCurrentImage=false,
}:{
  currentUrl?:string|null;
  currentAlt?:string;
  currentCaption?:string;
  currentCredit?:string;
  hasCurrentImage?:boolean;
}){
  const [file,setFile]=useState<File|null>(null);
  const [preview,setPreview]=useState<string|null>(null);
  const [error,setError]=useState("");
  const [remove,setRemove]=useState(false);

  useEffect(()=>{
    if(!file){setPreview(null);return;}
    const url=URL.createObjectURL(file);
    setPreview(url);
    return ()=>URL.revokeObjectURL(url);
  },[file]);

  const imageUrl=remove?null:(preview||currentUrl||null);

  return <section className="admin-image-section full-span" aria-labelledby="article-image-heading">
    <div className="admin-image-heading">
      <div>
        <h2 id="article-image-heading">সংবাদের ছবি</h2>
        <p>কম্পিউটার বা ফোন থেকে একটি ছবি দিন। বড় প্রতিবেদনের জন্য পরিষ্কার ছবি, কার্ডের জন্য ছোট ছবি তৈরি হবে।</p>
      </div>
      <span className="admin-image-optional">ঐচ্ছিক</span>
    </div>

    <div className="admin-image-layout">
      <div className="admin-image-preview" aria-live="polite">
        {imageUrl
          ? <img src={imageUrl} alt={file?"নতুন নির্বাচিত ছবির প্রিভিউ":currentAlt||"বর্তমান সংবাদ ছবি"}/>
          : <div className="admin-image-empty" aria-label="এখনো ছবি নির্বাচন করা হয়নি">
              <span aria-hidden="true">▧</span>
              <strong>ছবি নির্বাচন করা হয়নি</strong>
              <small>প্রকাশের আগে ছবি যুক্ত করতে পারবেন</small>
            </div>}
      </div>
      <div className="admin-image-options">
        <label className="admin-image-file-label" htmlFor="article-image-file">
          ছবি নির্বাচন করুন
          <input
            id="article-image-file"
            type="file"
            name="image_file"
            accept="image/jpeg,image/png,image/webp"
            onChange={event=>{
              const selected=event.currentTarget.files?.[0]||null;
              setError("");
              if(selected&&(!accepted.includes(selected.type)||selected.size>MAX_SIZE)){
                setError("JPG, PNG বা WebP দিন। ফাইল সর্বোচ্চ ১২ MB হতে পারবে।");
                event.currentTarget.value="";
                setFile(null);
                return;
              }
              setRemove(false);
              setFile(selected);
            }}
          />
        </label>
        <p className="admin-image-hint">JPG, PNG, WebP · সর্বোচ্চ ১২ MB · পরিষ্কার ছবির জন্য অন্তত 940 × 450 পিক্সেল</p>
        {file && <p className="admin-image-selected">নির্বাচিত: {file.name} ({(file.size/1048576).toFixed(1)} MB)</p>}
        {error&&<p className="admin-alert" role="alert">{error}</p>}
        {hasCurrentImage&&<label className="admin-image-remove">
          <input type="checkbox" name="remove_image" value="on"
            checked={remove} onChange={event=>{setRemove(event.target.checked);if(event.target.checked)setFile(null);}}/>
          বর্তমান ছবিটি সরিয়ে দিন
        </label>}
        <p className="admin-image-hint">ছবি পরিবর্তন করলে আগের ফাইল মুছে ফেলা হবে না; সংবাদে নতুন ছবিটি দেখা যাবে।</p>
      </div>
    </div>

    <div className="admin-image-details">
      <label>ছবির বিকল্প বিবরণ (Alt Text)
        <input name="image_alt" maxLength={300} defaultValue={currentAlt}
          placeholder="ছবিতে কী দেখা যাচ্ছে সংক্ষেপে লিখুন"/>
      </label>
      <label>ছবির ক্যাপশন
        <input name="image_caption" maxLength={500} defaultValue={currentCaption}
          placeholder="ছবির নিচে প্রদর্শিত হবে (ঐচ্ছিক)"/>
      </label>
      <label>ফটো ক্রেডিট / উৎস
        <input name="image_credit" maxLength={200} defaultValue={currentCredit}
          placeholder="ফটোগ্রাফার বা প্রতিষ্ঠানের নাম (ঐচ্ছিক)"/>
      </label>
    </div>
  </section>;
}

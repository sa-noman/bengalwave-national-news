"use client";
import {useState} from "react";
export function NewsletterDemo(){
 const [message,setMessage]=useState("");
 return <div className="bw-newsletter">
  <div><strong>নিউজলেটারে যুক্ত হোন</strong><span>প্রতিদিনের গুরুত্বপূর্ণ খবর সরাসরি ইনবক্সে।</span></div>
  <form onSubmit={e=>{e.preventDefault();setMessage("এটি ডিজাইন প্রিভিউ। এখনো কোনো ইমেইল সংরক্ষণ করা হচ্ছে না।");}}>
   <label className="bw-visually-hidden" htmlFor="bw-newsletter-email">আপনার ইমেইল</label>
   <input id="bw-newsletter-email" type="email" placeholder="আপনার ইমেইল ঠিকানা" required/>
   <button type="submit">সাবস্ক্রাইব</button>
  </form>
  {message&&<p className="bw-newsletter-message" role="status">{message}</p>}
 </div>;
}

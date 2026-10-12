import type {Metadata} from "next";

export const metadata:Metadata={title:"গোপনীয়তা নীতি"};

export default function Privacy(){
 return <main className="bw-website"><section className="bw-wrap bw-content-page">
  <span className="bw-tag">সাইটের তথ্য</span><h1>গোপনীয়তা নীতি</h1>
  <p>বেঙ্গল ওয়েভ পাঠকের অভিজ্ঞতা উন্নত করতে Google Analytics 4 ব্যবহার করে। এতে পৃষ্ঠা দেখা, ভিজিটের উৎস, ডিভাইসের ধরন ও আনুমানিক অবস্থান-সংক্রান্ত পরিসংখ্যান পাওয়া যেতে পারে।</p>
  <p>আমাদের Google Analytics সেটিংসে বিজ্ঞাপন ও Analytics কুকি সংরক্ষণের অনুমতি বন্ধ রাখা হয়েছে। তবে কুকি ছাড়া সীমিত ভিজিট-সংক্রান্ত সংকেত Google-এর কাছে পাঠানো হতে পারে। এ কারণে পরিসংখ্যান সম্পূর্ণ নাও হতে পারে। Google-এর তথ্য ব্যবহারের নিয়ম জানতে <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a> দেখুন।</p>
  <p>এই ওয়েবসাইটে এখন স্বতন্ত্র Analytics অনুমতির পপআপ দেখানো হয় না। প্রয়োজনীয় অঞ্চলে অতিরিক্ত সম্মতি বা নিয়ন্ত্রণের বিধান প্রযোজ্য হতে পারে।</p>
  <p>বর্তমান নিউজলেটার ফর্মটি ডিজাইন প্রিভিউ। এতে জমা দেওয়া ইমেইল সংরক্ষণ করা হয় না।</p>
 </section></main>;
}

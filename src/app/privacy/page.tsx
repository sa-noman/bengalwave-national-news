import type {Metadata} from "next";
import {AnalyticsPreferencesButton} from "@/components/analytics-consent";

export const metadata:Metadata={title:"গোপনীয়তা নীতি"};
export default function Privacy(){
 const analyticsAvailable=process.env.VERCEL_ENV==="production"&&/^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID||"");
 return <main className="bw-website"><section className="bw-wrap bw-content-page">
 <span className="bw-tag">সাইটের তথ্য</span><h1>গোপনীয়তা নীতি</h1>
 <p>বেঙ্গল ওয়েভের সংবাদ পড়তে Google Analytics-এ সম্মতি দেওয়া বাধ্যতামূলক নয়। পাঠকদের অনুমতি থাকলে আমরা Google Analytics 4 দিয়ে পৃষ্ঠা দেখা, ভিজিটের উৎস, ডিভাইসের ধরন ও আনুমানিক অবস্থান-সংক্রান্ত পরিসংখ্যান সংগ্রহ করি। এ তথ্য ওয়েবসাইটের পাঠক অভিজ্ঞতা উন্নত করতে ব্যবহৃত হয়।</p>
 <p>সম্মতি না দিলে Google Analytics-এর ট্র্যাকিং স্ক্রিপ্ট চালু করা হয় না। সম্মতি দিলে Google Analytics কুকি ব্যবহার করতে পারে এবং ভিজিট-সংক্রান্ত তথ্য Google-এর কাছে পাঠাতে পারে। বিজ্ঞাপনের জন্য ব্যক্তিগতকরণ অনুমোদিত নয়।</p>
 <p>আপনি চাইলে যেকোনো সময় নিচের বাটন থেকে Analytics-এর অনুমতি পরিবর্তন করতে পারবেন।</p>
 {analyticsAvailable&&<AnalyticsPreferencesButton/>}
 <p>বর্তমান নিউজলেটার ফর্মটি ডিজাইন প্রিভিউ। এতে জমা দেওয়া ইমেইল সংরক্ষণ করা হয় না।</p>
 </section></main>;
}

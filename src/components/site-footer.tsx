import Link from "next/link";

const links=[
  {name:"প্রচ্ছদ",href:"/"},
  {name:"সর্বশেষ",href:"/latest"},
  {name:"জাতীয়",href:"/category/national"},
  {name:"আন্তর্জাতিক",href:"/category/international"},
  {name:"খেলাধুলা",href:"/category/sports"},
  {name:"অর্থনীতি",href:"/category/economy"},
  {name:"প্রযুক্তি",href:"/category/technology"},
  {name:"বিনোদন",href:"/category/entertainment"},
];

function SocialIcon({type}:{type:"facebook"|"youtube"|"x"|"instagram"}){
  if(type==="facebook")return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"/></svg>;
  if(type==="youtube")return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.75 12 4.75 12 4.75s-5.9 0-7.6.45a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.7.45 7.6.45 7.6.45s5.9 0 7.6-.45a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg>;
  if(type==="x")return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.3-8.5L1.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z"/></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.8" cy="6.4" r="1" fill="currentColor" stroke="none"/></svg>;
}

export function SiteFooter(){
 return <footer className="bw-footer">
   <div className="bw-footer-inner">
    <div className="bw-footer-top">
      <Link href="/" className="bw-footer-identity" aria-label="Bengal Wave প্রচ্ছদ">
       <span className="bw-footer-mark"><img src="/brand/logo-prototype.webp" alt="Bengal Wave"/></span>
       <span className="bw-footer-wordmark">Bengal<i>Wave</i></span>
      </Link>
      <nav className="bw-footer-nav" aria-label="ফুটার প্রধান মেনু">
       {links.map(link=><Link key={link.href} href={link.href}>{link.name}</Link>)}
      </nav>
    </div>
    <div className="bw-footer-divider" aria-hidden="true"/>
    <div className="bw-footer-lower">
     <div className="bw-footer-legal">
      <span>© ২০২৬ বেঙ্গল ওয়েভ</span>
      <Link href="/about">আমাদের সম্পর্কে</Link>
      <Link href="/privacy">গোপনীয়তা নীতি</Link>
      <Link href="/contact">যোগাযোগ</Link>
     </div>
     <div className="bw-footer-social">
      <span>আমাদেরকে অনুসরণ করুন :</span>
      <div className="bw-footer-icons" aria-label="সামাজিক যোগাযোগমাধ্যমের আইকন">
       {(["facebook","youtube","x","instagram"] as const).map(type=>
        <span key={type} className="bw-social-placeholder"
         title="অফিশিয়াল লিংক এখনো যুক্ত হয়নি"
         aria-label={type+"-এর লিংক এখনো যুক্ত হয়নি"}><SocialIcon type={type}/></span>
       )}
      </div>
     </div>
    </div>
   </div>
 </footer>;
}

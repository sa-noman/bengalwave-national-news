import type {Metadata,Viewport} from "next";
import {Noto_Serif_Bengali} from "next/font/google";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {GoogleAnalytics} from "@/components/google-analytics";
import "./globals.css";
import "./newsroom.css";
import "./typography.css";
import "./header-calendar.css";
import "./heritage-stories.css";
import "./dark-theme.css";
const bengaliFont=Noto_Serif_Bengali({subsets:["bengali","latin"],weight:["400","500","600","700"],display:"swap",variable:"--bw-local-font"});
export const metadata:Metadata={
 title:{default:"Bengal Wave | বাংলা নিউজ",template:"%s | Bengal Wave"},
 description:"Bengal Wave | ইতিহাস, সংবাদ ও সংস্কৃতির প্রতিচ্ছবি",
 metadataBase:new URL("https://bengalwave.news"),
 robots:{index:process.env.VERCEL_ENV==="production",follow:process.env.VERCEL_ENV==="production"},
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#053d36"};
// Apply saved preference or system setting before React hydrates, avoiding
// a flash of the wrong theme and respecting manual light mode on dark devices.
const themeInitScript=`(function(){
 try{
  var saved=localStorage.getItem("bw-theme-preference");
  var isDark=saved==="dark"||(saved!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme=isDark?"dark":"light";
 }catch(e){
  document.documentElement.dataset.theme=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
 }
})();`;
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="bn" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeInitScript}}/></head><body><SiteHeader/>{children}<SiteFooter/><GoogleAnalytics/></body></html>;
}

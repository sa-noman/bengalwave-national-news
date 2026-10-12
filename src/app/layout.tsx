import type {Metadata,Viewport} from "next";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {GoogleAnalytics} from "@/components/google-analytics";
import "./globals.css";
import "./newsroom.css";
import "./typography.css";
import "./header-calendar.css";
import "./heritage-stories.css";
import "./dark-theme.css";
export const metadata:Metadata={
 title:{default:"Bengal Wave | বাংলা নিউজ",template:"%s | Bengal Wave"},
 description:"Bengal Wave বাংলা ডিজিটাল নিউজপোর্টালের উন্নয়নাধীন সংস্করণ।",
 robots:{index:false,follow:false},
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

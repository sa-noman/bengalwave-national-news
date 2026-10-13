import assert from "node:assert/strict";
import {chromium} from "playwright";
import {mkdirSync} from "node:fs";

const ports={baseline:"http://127.0.0.1:3200",candidate:"http://127.0.0.1:3201"};
const views=[{name:"desktop",width:1440,height:900},{name:"mobile",width:390,height:844}];
const paths=[{name:"home",url:"/",selectors:["body",".bw-topbar",".bw-masthead",".bw-navbar",".bw-hero",".bw-feature-panel",".bw-footer",".bw-bottom-nav"]},{name:"latest",url:"/latest",selectors:["body",".bw-navbar",".bw-listing",".bw-footer",".bw-bottom-nav"]},{name:"category",url:"/category/national",selectors:["body",".bw-navbar",".bw-listing",".bw-footer",".bw-bottom-nav"]},{name:"admin-login",url:"/admin/login",selectors:["body",".bw-navbar",".admin-panel",".bw-footer",".bw-bottom-nav"]}];
mkdirSync("visual-artifacts",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const differences=[];
try {
 for(const view of views){
  for(const route of paths){
   const result={};
   for(const kind of ["baseline","candidate"]){
    const page=await browser.newPage({viewport:{width:view.width,height:view.height},deviceScaleFactor:1,reducedMotion:"reduce"});
    try {
     const response=await page.goto(ports[kind]+route.url,{waitUntil:"networkidle",timeout:45000});
     assert.equal(response?.status(),200,kind+" "+route.url+" HTTP status");
     await page.evaluate(()=>document.fonts.ready);
     await page.screenshot({path:"visual-artifacts/"+kind+"-"+view.name+"-"+route.name+".png",fullPage:true,animations:"disabled"});
     const measurements={};
     for(const selector of route.selectors){
      const locator=page.locator(selector).first();
      if(await locator.count()){
       measurements[selector]=await locator.evaluate(el=>{
        const r=el.getBoundingClientRect();const s=getComputedStyle(el);
        return {x:r.x,y:r.y,width:r.width,height:r.height,color:s.color,background:s.backgroundColor,fontSize:s.fontSize,display:s.display};
       });
      }
     }
     result[kind]=measurements;
    } finally{await page.close();}
   }
   for(const selector of route.selectors){
    const a=result.baseline[selector],b=result.candidate[selector];
    if(Boolean(a)!==Boolean(b)){differences.push(view.name+" "+route.name+" "+selector+" presence mismatch");continue;}
    if(!a)continue;
    for(const axis of ["x","y","width","height"]){
     if(Math.abs(a[axis]-b[axis])>4){
      differences.push(view.name+" "+route.name+" "+selector+" "+axis+" changed "+a[axis]+" -> "+b[axis]);
     }
    }
    for(const style of ["color","background","fontSize","display"]){
     if(a[style]!==b[style])differences.push(view.name+" "+route.name+" "+selector+" "+style+" changed "+a[style]+" -> "+b[style]);
    }
   }
   console.log("Compared",view.name,route.url,"baseline vs candidate");
  }
 }
} finally {await browser.close();}
if(differences.length){
 console.error("VISUAL LAYOUT CHANGES:\n"+differences.join("\n"));
 process.exitCode=1;
}else{
 console.log("PASS: matching layout rectangles and colors across 8 desktop/mobile page comparisons.");
}

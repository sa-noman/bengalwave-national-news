/**
 * Bengal Wave card timestamps. Work in elapsed time for relative labels and
 * Asia/Dhaka for the long-form publication date.
 */
const banglaNumber=new Intl.NumberFormat("bn-BD",{useGrouping:false});
const longDate=new Intl.DateTimeFormat("bn-BD",{
  timeZone:"Asia/Dhaka",day:"numeric",month:"long",year:"numeric",
});
const MINUTE=60_000;
const HOUR=60*MINUTE;
const DAY=24*HOUR;

export function formatFullNewsDate(publishedAt:string):string {
  const date=new Date(publishedAt);
  return Number.isNaN(date.getTime())?"":longDate.format(date);
}

/**
 * Three-day relative display: "৩ দিন আগে" applies during the third
 * completed day (72h–96h); from the fourth day show a full date.
 */
export function formatNewsCardDate(publishedAt:string|undefined,now:Date=new Date()):string {
  if(!publishedAt)return "সংবাদ";
  const publishedMs=new Date(publishedAt).getTime();
  const nowMs=now.getTime();
  if(!Number.isFinite(publishedMs)||!Number.isFinite(nowMs))return "সংবাদ";
  const elapsed=Math.max(0,nowMs-publishedMs);
  if(elapsed<MINUTE)return "এইমাত্র";
  if(elapsed<HOUR)return banglaNumber.format(Math.floor(elapsed/MINUTE))+" মিনিট আগে";
  if(elapsed<DAY)return banglaNumber.format(Math.floor(elapsed/HOUR))+" ঘণ্টা আগে";
  if(elapsed<4*DAY)return banglaNumber.format(Math.floor(elapsed/DAY))+" দিন আগে";
  return longDate.format(new Date(publishedMs));
}

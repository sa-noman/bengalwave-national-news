/**
 * Three date conventions in Bengali text, always calculated for Asia/Dhaka.
 * Bengali civil calendar: Bangladesh Bangla Academy revision (2019).
 * Hijri: tabular estimate; local moon sighting may differ by a day.
 */
const dhakaZone="Asia/Dhaka";
const bengaliMonths=[
  "বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন",
  "কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র",
];
const numberFormatter=new Intl.NumberFormat("bn-BD",{useGrouping:false});
const bengaliNumber=(value:number)=>numberFormatter.format(value);
const DAY_MS=24*60*60*1000;

function gregorianPartsForDhaka(instant:Date){
  const parts=new Intl.DateTimeFormat("en-GB",{
    timeZone:dhakaZone,year:"numeric",month:"2-digit",day:"2-digit",
  }).formatToParts(instant);
  const get=(kind:"year"|"month"|"day")=>{
    const raw=parts.find(p=>p.type===kind)?.value;
    if(!raw)throw new Error("Missing Dhaka calendar date");
    return Number(raw);
  };
  return {year:get("year"),month:get("month"),day:get("day")};
}

function isLeapYear(year:number){
  return year%4===0&&(year%100!==0||year%400===0);
}

export function formatBengaliCivilDate(instant:Date){
  const {year,month,day}=gregorianPartsForDhaka(instant);
  const startingYear=month>4||(month===4&&day>=14)?year:year-1;
  let dayIndex=Math.round((Date.UTC(year,month-1,day)-Date.UTC(startingYear,3,14))/DAY_MS);
  // Falgun gains one day when February in the ending Gregorian year is leap.
  const lengths=[31,31,31,31,31,31,30,30,30,30,isLeapYear(startingYear+1)?30:29,30];
  for(let monthIndex=0;monthIndex<lengths.length;monthIndex++){
    if(dayIndex<lengths[monthIndex]){
      return `${bengaliNumber(dayIndex+1)} ${bengaliMonths[monthIndex]} ${bengaliNumber(startingYear-593)} বঙ্গাব্দ`;
    }
    dayIndex-=lengths[monthIndex];
  }
  throw new Error("Unable to calculate Bengali civil date");
}

export function formatHijriDateInBengali(instant:Date){
  // Tabular Hijri is an estimate: the observed Bangladesh moon may vary.
  const options:Intl.DateTimeFormatOptions={
    timeZone:dhakaZone,day:"numeric",month:"long",year:"numeric",
  };
  const format=new Intl.DateTimeFormat("bn-BD-u-ca-islamic-tbla",options);
  const parts=format.formatToParts(instant);
  const get=(kind:"day"|"month"|"year")=>parts.find(p=>p.type===kind)?.value||"";
  return `${get("day")} ${get("month")} ${get("year")} হিজরি`;
}

export function formatGregorianDateInBengali(instant:Date){
  return new Intl.DateTimeFormat("bn-BD",{
    timeZone:dhakaZone,weekday:"long",day:"numeric",month:"long",year:"numeric",
  }).format(instant);
}

export function getHeaderDates(instant:Date){
  return {
    gregorian:formatGregorianDateInBengali(instant),
    bengali:formatBengaliCivilDate(instant),
    hijri:formatHijriDateInBengali(instant),
  };
}

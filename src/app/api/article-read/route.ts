import {createHmac,randomUUID} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {createSupabasePublicClient} from "@/lib/supabase/public";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const COOKIE_NAME="bw_anonymous_reader";
const COOKIE_MAX_AGE=60*60*24*180;
const SLUG_PATTERN=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function reply(status:number){
 return new NextResponse(null,{status,headers:{"Cache-Control":"private, no-store"}});
}

/** One real visible article read, rather than every reload, per anonymous browser/day. */
export async function POST(request:NextRequest){
 // Preview shares production database; never record preview traffic.
 if(process.env.VERCEL_ENV!=="production")return reply(204);
 const origin=request.headers.get("origin");
 if(!origin||origin!==new URL(request.url).origin)return reply(403);
 const fetchSite=request.headers.get("sec-fetch-site");
 if(fetchSite&&fetchSite!=="same-origin")return reply(403);
 const ua=request.headers.get("user-agent")||"";
 if(/bot|crawl|spider|headless|preview|facebookexternalhit|whatsapp|telegram/i.test(ua))return reply(204);
 const length=Number(request.headers.get("content-length")||"0");
 if(length>512)return reply(413);

 let slug="";
 try{
  const data=await request.json() as {slug?:unknown};
  slug=typeof data.slug==="string"?data.slug:"";
 }catch{return reply(400);}
 if(slug.length>150||!SLUG_PATTERN.test(slug))return reply(400);

 const secret=process.env.EDITOR_LOGIN_RATE_LIMIT_SECRET;
 const supabase=createSupabasePublicClient();
 if(!secret||!supabase)return reply(503);
 const existing=request.cookies.get(COOKIE_NAME)?.value||"";
 const visitorId=/^[a-f0-9-]{36}$/.test(existing)?existing:randomUUID();
 const dhakaDate=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 // Privacy: only a 64-character one-way daily HMAC is stored, not the cookie or IP.
 const visitorHash=createHmac("sha256",secret).update(visitorId+"|"+dhakaDate).digest("hex");
 const {error}=await supabase.rpc("record_published_article_read",{
  p_slug:slug,p_visitor_hash:visitorHash
 });
 if(error){
  console.warn("BengalWave article read counter unavailable",{code:error.code});
  return reply(503);
 }
 const response=reply(204);
 if(!existing||existing!==visitorId)response.cookies.set(COOKIE_NAME,visitorId,{
  httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:COOKIE_MAX_AGE
 });
 return response;
}

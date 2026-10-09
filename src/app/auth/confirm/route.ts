import {type EmailOtpType} from "@supabase/supabase-js";
import {NextRequest, NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {isSupabaseConfigured} from "@/lib/supabase/config";

export const dynamic="force-dynamic";

export async function GET(request:NextRequest) {
  const tokenHash=request.nextUrl.searchParams.get("token_hash");
  const type=request.nextUrl.searchParams.get("type");
  const loginUrl=new URL("/admin/login?error=invite",request.url);

  // Only invitation and password-recovery links are used by the private CMS.
  // No public self-service signup route is exposed.
  if(!tokenHash || !["invite","recovery"].includes(type||"") ||
      !isSupabaseConfigured()){
    return NextResponse.redirect(loginUrl);
  }

  const supabase=await createSupabaseServerClient();
  const {error}=await supabase.auth.verifyOtp({
    token_hash:tokenHash,
    type:type as EmailOtpType
  });
  if(error) return NextResponse.redirect(loginUrl);

  return NextResponse.redirect(new URL("/admin/set-password",request.url));
}

import {createServerClient} from "@supabase/ssr";
import {NextRequest,NextResponse} from "next/server";

export async function refreshSupabaseSession(request:NextRequest,requestHeaders?:Headers) {
  const forwardedHeaders=requestHeaders||new Headers(request.headers);
  let response=NextResponse.next({request:{headers:forwardedHeaders}});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const inAdmin=request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login");
  if(!url||!key) {
    if(inAdmin) {
      const login=request.nextUrl.clone();login.pathname="/admin/login";login.search="";
      return NextResponse.redirect(login);
    }
    return response;
  }
  const supabase=createServerClient(url,key,{
    cookies:{
      getAll(){return request.cookies.getAll();},
      setAll(toSet){
        toSet.forEach(({name,value})=>request.cookies.set(name,value));
        forwardedHeaders.set("cookie",request.headers.get("cookie")||"");
        response=NextResponse.next({request:{headers:forwardedHeaders}});
        toSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));
      },
    },
  });
  const {data:{user}}=await supabase.auth.getUser();
  if(inAdmin && !user) {
    const login=request.nextUrl.clone();login.pathname="/admin/login";login.search="";
    return NextResponse.redirect(login);
  }
  return response;
}

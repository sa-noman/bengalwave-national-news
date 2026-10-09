"use client";
import {useEffect} from "react";

// Supabase's unmodified Invite template redirects to the configured Site URL.
// Support the original website root as Site URL without exposing any session
// fragments to the server.
export function HomeInvitationRedirect(){
  useEffect(()=>{
    const current=new URL(window.location.href);
    const fragment=new URLSearchParams(current.hash.slice(1));
    const type=fragment.get("type");
    const hasTokens=Boolean(fragment.get("access_token")&&fragment.get("refresh_token"));
    const hasCode=Boolean(current.searchParams.get("code"));
    if((hasTokens && (type==="invite" || type==="recovery")) || hasCode){
      window.location.replace("/auth/complete"+current.search+current.hash);
    }
  },[]);
  return null;
}

import type {Metadata} from "next";
import {AuthReturnHandler} from "@/components/auth/auth-return-handler";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Admin Invitation Verification",robots:{index:false,follow:false}};

export default function AuthCompletePage(){
  return <AuthReturnHandler/>;
}

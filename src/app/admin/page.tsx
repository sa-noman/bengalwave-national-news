import type { Metadata } from "next";
import { notFound } from "next/navigation";
export const metadata: Metadata={robots:{index:false,follow:false}};
export default function Admin() {notFound();}
/* The admin route intentionally remains disabled until Supabase Auth and
   server-side role checks are implemented. Never expose a fake login. */ 

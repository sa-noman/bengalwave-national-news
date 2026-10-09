import type {Metadata} from "next";
import { signOut } from "../login/actions";
export const metadata:Metadata={title:"অনুমতি প্রয়োজন",robots:{index:false,follow:false}};
export default function AccessDenied() {
  return <main className="container admin-surface"><div className="admin-panel auth-panel">
    <h1>অ্যাক্সেস অনুমোদিত নয়</h1>
    <p>আপনার অ্যাকাউন্টে এখনো অনুমোদিত সম্পাদকীয় ভূমিকা নেই। Owner অনুমোদন ছাড়া এখানে সংবাদ পরিবর্তন করা যাবে না।</p>
    <form action={signOut}><button className="admin-primary" type="submit">লগআউট করুন</button></form>
  </div></main>;
}

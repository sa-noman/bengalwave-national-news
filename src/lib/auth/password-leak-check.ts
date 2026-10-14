import "server-only";
import {createHash} from "node:crypto";

/**
 * Free HIBP Pwned Passwords k-anonymity check. No user email or raw password
 * is transmitted; only the first 5 characters of a SHA-1 hash are queried.
 * This check complements mandatory MFA, not a replacement for it.
 *
 * Network failures return "unknown" rather than denying account recovery.
 */
export async function isKnownCompromisedPassword(password:string):Promise<boolean|null>{
  const digest=createHash("sha1").update(password,"utf8").digest("hex").toUpperCase();
  const prefix=digest.slice(0,5);
  const suffix=digest.slice(5);
  try {
    const response=await fetch("https://api.pwnedpasswords.com/range/"+prefix,{
      cache:"no-store",
      headers:{"Add-Padding":"true","User-Agent":"BengalWave-CMS-Password-Safety/1.0"},
      signal:AbortSignal.timeout(6000),
    });
    if(!response.ok)return null;
    const list=await response.text();
    return list.split(/\r?\n/).some(line=>line.split(":")[0]===suffix);
  }catch{
    return null;
  }
}

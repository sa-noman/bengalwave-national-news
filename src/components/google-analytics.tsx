import Script from "next/script";
import {headers} from "next/headers";

/**
 * Cookie-less GA4: never write analytics/ad cookies and never show an opt-in
 * banner. Consent Mode still permits limited cookieless pings; reporting may
 * be incomplete and this does not substitute for applicable legal advice.
 */
export async function GoogleAnalytics(){
 const measurementId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
 if(process.env.VERCEL_ENV!=="production"||!measurementId||!/^G-[A-Z0-9]+$/.test(measurementId))return null;

 const nonce=(await headers()).get("x-nonce")||undefined;
 return <>
  <Script nonce={nonce} id="bw-ga4-cookie-free-config" strategy="afterInteractive">{`
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent','default',{
      analytics_storage:'denied',
      ad_storage:'denied',
      ad_user_data:'denied',
      ad_personalization:'denied'
    });
    gtag('js',new Date());
    gtag('config',${JSON.stringify(measurementId)});
  `}</Script>
  <Script nonce={nonce} src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} strategy="afterInteractive"/>
 </>;
}

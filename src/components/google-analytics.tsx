import Script from "next/script";

/**
 * Cookie-less GA4: never write analytics/ad cookies and never show an opt-in
 * banner. Consent Mode still permits limited cookieless pings; reporting may
 * be incomplete and this does not substitute for applicable legal advice.
 */
export function GoogleAnalytics(){
 const measurementId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
 if(process.env.VERCEL_ENV!=="production"||!measurementId||!/^G-[A-Z0-9]+$/.test(measurementId))return null;

 return <>
  <Script id="bw-ga4-cookie-free-config" strategy="afterInteractive">{`
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
  <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} strategy="afterInteractive"/>
 </>;
}

import Script from "next/script";

/**
 * GA4 is opt-in at deployment time: never collect preview/development traffic,
 * and never emit a Google tracking script without a valid Measurement ID.
 *
 * GA4 Web Enhanced Measurement should have "Page changes based on browser
 * history events" enabled to track Next.js client-side route changes.
 */
export function GoogleAnalytics() {
  const measurementId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  if(process.env.VERCEL_ENV!=="production" || !measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) {
    return null;
  }

  return <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
      strategy="afterInteractive"
    />
    <Script id="bengalwave-google-analytics" strategy="afterInteractive">{`
      window.dataLayer=window.dataLayer||[];
      function gtag(){dataLayer.push(arguments);}
      gtag('js',new Date());
      gtag('config',${JSON.stringify(measurementId)});
    `}</Script>
  </>;
}

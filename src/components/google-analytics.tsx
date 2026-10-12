import {AnalyticsConsent} from "./analytics-consent";

/** Enable GA4 only on production when a real Measurement ID is configured. */
export function GoogleAnalytics(){
 const measurementId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
 if(process.env.VERCEL_ENV!=="production"||!measurementId||!/^G-[A-Z0-9]+$/.test(measurementId))return null;
 return <AnalyticsConsent measurementId={measurementId}/>;
}

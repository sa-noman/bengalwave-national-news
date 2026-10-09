/** Inline SVG background taken from the user's footer-background.html; no raster assets. */
export function FooterRiverscape(){
 return <>
  <div className="bw-footer-artwork" aria-hidden="true">
   <svg className="bw-footer-scene" viewBox="0 0 1600 360" preserveAspectRatio="xMidYMid meet" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <defs>
     <g id="bw-footer-palm">
      <path d="M0 0Q8 -45 -2 -95" stroke="#02291f" strokeWidth="5" fill="none"/>
      <path fill="#02291f" d="M-2 -95Q-32 -118 -66 -96Q-34 -104 -2 -95 M-2 -95Q28 -120 64 -98Q32 -104 -2 -95 M-2 -95Q-24 -132 -48 -134Q-26 -122 -2 -95 M-2 -95Q22 -134 48 -136Q26 -124 -2 -95 M-2 -95Q-8 -122 -4 -140Q4 -120 -2 -95"/>
     </g>
    </defs>
    <rect y="236" width="1600" height="124" fill="#fff" opacity=".05"/>
    <path d="M0 238Q200 218 400 234T800 230T1200 238T1600 228V250H0Z" fill="#02291f" opacity=".55"/>
    <circle cx="1490" cy="150" r="46" fill="#d9a441" opacity=".34"/>
    <ellipse cx="1490" cy="262" rx="70" ry="6" fill="#d9a441" opacity=".12"/>
    <use href="#bw-footer-palm" transform="translate(190 238) scale(1.15)" opacity=".6"/>
    <use href="#bw-footer-palm" transform="translate(470 240) scale(.7)" opacity=".5"/>
    <use href="#bw-footer-palm" transform="translate(790 236) scale(.95)" opacity=".55"/>
    <use href="#bw-footer-palm" transform="translate(1090 236) scale(.6)" opacity=".45"/>
    <use href="#bw-footer-palm" transform="translate(1550 234) scale(1.05)" opacity=".55"/>
    <g stroke="#02291f" strokeWidth="3" fill="none" opacity=".75">
     <path d="M1290 120L1190 248M1290 120L1480 240M1290 120Q1380 150 1480 240 M1290 120Q1250 170 1190 248M1290 120L1340 200"/>
    </g>
    <path d="M1180 262Q1330 296 1570 252L1548 266Q1340 306 1204 276Z" fill="#02291f" opacity=".85"/>
    <circle cx="1262" cy="236" r="9" fill="#02291f" opacity=".85"/>
    <path d="M1250 262L1256 244H1270L1276 262Z" fill="#02291f" opacity=".85"/>
    <g stroke="#fff" opacity=".07" strokeWidth="2">
     <path d="M0 290H520M700 304H1500M120 326H900M1000 332H1600M300 346H1300"/>
    </g>
   </svg>
  </div>
  <svg className="bw-footer-wave" viewBox="0 0 1440 30" preserveAspectRatio="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
   <path fill="#04382f" d="M0 30V16C180 0 360 0 540 14S900 30 1080 14 1320 2 1440 12V30Z"/>
   <path fill="none" stroke="#FBB040" strokeWidth="3" vectorEffect="non-scaling-stroke" d="M0 16C180 0 360 0 540 14S900 30 1080 14 1320 2 1440 12"/>
  </svg>
 </>;
}

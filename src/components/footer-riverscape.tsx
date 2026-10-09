/** Pure inline SVG, with no image/raster assets or remote requests. */
export function FooterRiverscape(){
 return <svg className="bw-footer-scene" viewBox="0 0 1600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
  <defs>
   <linearGradient id="bw-footer-sky" x1="0" y1="0" x2=".16" y2="1">
    <stop offset="0" stopColor="#01382f"/>
    <stop offset=".48" stopColor="#0b5142"/>
    <stop offset="1" stopColor="#06382f"/>
   </linearGradient>
   <radialGradient id="bw-footer-sunset" cx="73%" cy="35%" r="37%">
    <stop offset="0" stopColor="#d5ab51" stopOpacity=".42"/>
    <stop offset=".37" stopColor="#a2a24e" stopOpacity=".14"/>
    <stop offset="1" stopColor="#173e36" stopOpacity="0"/>
   </radialGradient>
   <linearGradient id="bw-footer-river" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#0c4c3d"/>
    <stop offset=".35" stopColor="#06392f"/>
    <stop offset="1" stopColor="#002e29"/>
   </linearGradient>
   <linearGradient id="bw-footer-reflection" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stopColor="#cdb563" stopOpacity="0"/>
    <stop offset=".52" stopColor="#e1bf60" stopOpacity=".42"/>
    <stop offset="1" stopColor="#cdb563" stopOpacity="0"/>
   </linearGradient>
   <clipPath id="bw-footer-outline">
    <path d="M0 27 C180 11 360 11 540 24 S900 40 1080 24 S1420 12 1600 22 V340 H0 Z"/>
   </clipPath>
   <g id="bw-footer-palm" fill="#062d28">
    <path d="M0 0 Q5 -23 -3 -53" fill="none" stroke="#062d28" strokeWidth="5" strokeLinecap="round"/>
    <path d="M-3 -53 Q-24 -79 -44 -66 Q-23 -67 -3 -47 Q-25 -60 -40 -49 Q-17 -53 -3 -46 Q-12 -78 4 -91 Q-2 -74 2 -48 Q17 -80 38 -76 Q16 -67 3 -47 Q25 -64 41 -50 Q22 -52 3 -45 Q29 -53 37 -35 Q17 -45 3 -44Z"/>
   </g>
  </defs>
  <g clipPath="url(#bw-footer-outline)" opacity=".76">
   <rect width="1600" height="340" fill="url(#bw-footer-sky)"/>
   <rect width="1600" height="340" fill="url(#bw-footer-sunset)"/>
   {/* Keep the original objects at their natural proportions; crop the background instead of squashing them. */}
   <g transform="translate(0 -75)">
   <circle cx="1155" cy="155" r="46" fill="#e7b851" opacity=".57"/>
   <path d="M0 155 Q150 128 275 152 T530 147 T785 151 T1040 146 T1320 155 T1600 141 V211 H0Z" fill="#174c3c" opacity=".43"/>
   <path d="M0 178 Q90 161 178 183 Q260 151 360 181 Q472 161 548 187 Q641 150 755 183 Q856 158 955 184 Q1060 148 1156 181 Q1280 153 1385 180 Q1500 151 1600 174 V212 H0Z" fill="#0e473a" opacity=".73"/>
   <path d="M0 195 Q85 175 150 196 Q235 171 318 204 Q415 178 494 199 Q582 173 665 199 Q760 183 848 201 Q943 173 1017 198 Q1125 174 1220 198 Q1325 177 1418 199 Q1510 173 1600 198 V227 H0Z" fill="#073a32" opacity=".94"/>
   <g opacity=".62">
    <use href="#bw-footer-palm" transform="translate(154 194) scale(.94)"/>
    <use href="#bw-footer-palm" transform="translate(255 193) scale(.64)"/>
    <use href="#bw-footer-palm" transform="translate(490 191) scale(.77)"/>
    <use href="#bw-footer-palm" transform="translate(685 191) scale(.54)"/>
    <use href="#bw-footer-palm" transform="translate(1402 195) scale(.93)"/>
    <use href="#bw-footer-palm" transform="translate(1525 195) scale(.73)"/>
   </g>
   <rect y="202" width="1600" height="138" fill="url(#bw-footer-river)"/>
   <path d="M0 211 Q400 206 810 212 T1600 208" stroke="#89a56c" strokeOpacity=".19" strokeWidth="3" fill="none"/>
   <path d="M0 226 Q370 221 790 226 T1600 222" stroke="#cfbe71" strokeOpacity=".11" strokeWidth="2" fill="none"/>
   <path d="M0 246 Q280 239 605 244 T1250 241 T1600 246" stroke="#9eb378" strokeOpacity=".23" strokeWidth="3" fill="none"/>
   <path d="M0 279 Q420 272 840 280 T1600 274" stroke="#6d9776" strokeOpacity=".24" strokeWidth="2" fill="none"/>
   <path d="M0 313 Q335 307 750 314 T1600 307" stroke="#6c9f87" strokeOpacity=".18" strokeWidth="2" fill="none"/>
   <path d="M930 215 Q1117 206 1364 218" stroke="url(#bw-footer-reflection)" strokeWidth="4" fill="none"/>
   <path d="M1020 233 Q1150 224 1280 233 M1065 249 Q1153 244 1243 250 M1090 265 Q1180 260 1255 268 M1111 290 Q1180 287 1250 292" stroke="url(#bw-footer-reflection)" strokeWidth="3" fill="none"/>
   <g fill="#072c28" opacity=".65">
    <path d="M730 225 L792 226 Q781 238 744 234Z"/>
    <path d="M752 222 L769 207 L771 227Z"/>
    <path d="M1440 228 L1510 229 Q1499 239 1454 238Z"/>
    <path d="M1464 226 L1485 209 L1485 228Z"/>
   </g>
   <g stroke="#092e29" fill="none" strokeLinecap="round">
    <path d="M1206 258 L1278 127" strokeWidth="5"/>
    <path d="M1278 127 L1367 261" strokeWidth="3"/>
    <path d="M1278 127 L1104 252" strokeWidth="2.8"/>
    <path d="M1278 127 L1290 263" strokeWidth="4"/>
    <path d="M1285 145 Q1350 184 1367 261 Q1337 272 1291 257Z" fill="#184d41" fillOpacity=".3" strokeWidth="1.6"/>
    <path d="M1287 163 L1359 254 M1289 184 L1347 258 M1290 206 L1329 262" strokeWidth=".9" strokeOpacity=".6"/>
   </g>
   <g fill="#061f1d">
    <path d="M1070 263 Q1179 257 1262 259 Q1341 258 1396 254 Q1368 278 1300 286 Q1172 293 1121 278Z"/>
    <ellipse cx="1183" cy="202" rx="14" ry="11"/>
    <path d="M1161 198 Q1182 184 1207 200 Q1185 205 1161 198Z"/>
    <path d="M1172 211 Q1197 205 1203 228 L1202 259 L1168 257 Q1175 236 1167 224Z"/>
    <path d="M1184 223 L1153 241 L1157 247 L1194 233Z"/>
    <path d="M1183 249 L1216 265 L1207 271 L1179 258Z"/>
   </g>
   <g stroke="#082b25" fill="none" strokeLinecap="round">
    <path d="M1154 241 L1134 267 M1134 267 L1130 275" strokeWidth="3"/>
    <path d="M1390 253 L1438 212" strokeWidth="3"/>
   </g>
   <g stroke="#a4a361" strokeOpacity=".17" strokeWidth="2" fill="none">
    <path d="M1030 300 Q1180 293 1400 307"/>
    <path d="M1050 321 Q1180 311 1430 323"/>
   </g>
   <rect width="1600" height="340" fill="#002c26" opacity=".16"/>
   </g>
  </g>
  <path d="M0 27 C180 11 360 11 540 24 S900 40 1080 24 S1420 12 1600 22" fill="none" stroke="#FBB040" strokeWidth="3"/>
 </svg>;
}

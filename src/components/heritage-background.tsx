/**
 * Reference artwork copied from the user-provided bangla-banner HTML.
 * This component supplies ONLY the original left/right background drawings.
 * Do not import its clip-paths, gold edge SVG, or change FooterRiverscape:
 * Bengal Wave's existing golden wave shape must remain pixel-identical.
 */
export function HeritageBackground(){
  return <div className="bw-heritage-artwork" aria-hidden="true">
    <svg className="bw-heritage-art bw-heritage-art-left"
      viewBox="0 0 640 540" preserveAspectRatio="xMinYMax slice" focusable="false">
      <g fill="#9db39a" opacity=".45">
        <ellipse cx="80" cy="150" rx="70" ry="46"/>
        <ellipse cx="230" cy="120" rx="80" ry="50"/>
        <ellipse cx="400" cy="200" rx="90" ry="40"/>
        <ellipse cx="520" cy="300" rx="80" ry="30"/>
      </g>
      <path d="M0 420Q170 396 340 408T640 424V540H0Z" fill="#7d9b3d"/>
      <path d="M0 470Q200 450 400 462T640 470V540H0Z" fill="#a9ba4c" opacity=".8"/>
      <path d="M130 250H250L268 330H112Z" fill="#a8532e"/>
      <path d="M60 330H330L352 384H38Z" fill="#94452a"/>
      <path d="M20 384H430L462 436H0Z" fill="#a8532e"/>
      <path d="M0 436H580L620 462H0Z" fill="#86402a"/>
      <path d="M130 250H250L254 270H126Z" fill="#6f8f3b" opacity=".7"/>
      <path d="M120 300H260M70 356H320M30 410H440M0 450H600"
        stroke="#5e2c1b" strokeWidth="3" opacity=".45"/>
      <path d="M300 330H440L470 384H330Z" fill="#9b4a29"/>
      <path d="M0 120Q150 80 320 120T640 110V250Q400 200 0 240Z"
        fill="#f5f1e3" opacity=".5"/>
      <ellipse cx="420" cy="470" rx="220" ry="40" fill="#f7f2e3" opacity=".55"/>
    </svg>

    <svg className="bw-heritage-art bw-heritage-art-right"
      viewBox="0 0 560 540" preserveAspectRatio="xMaxYMax slice" focusable="false">
      <defs>
        <g id="bw-heritage-palm">
          <path d="M0 0Q-34 -22 -76 4Q-38 -10 0 0M0 0Q34 -22 76 4Q38 -10 0 0M0 0Q-28 -40 -58 -36Q-28 -26 0 0M0 0Q28 -40 58 -36Q28 -26 0 0M0 0Q-6 -34 0 -52Q8 -30 0 0"/>
        </g>
      </defs>
      <circle cx="230" cy="180" r="72" fill="#f6b56a" opacity=".9"/>
      <path d="M40 250H250M110 270H390" stroke="#e9a96a" strokeWidth="4" opacity=".5"/>
      <path d="M40 380Q80 330 140 360Q190 320 250 356Q320 326 390 380V430H40Z"
        fill="#8aa08b" opacity=".55"/>
      <rect y="410" width="560" height="130" fill="#ebcb96" opacity=".55"/>
      <ellipse cx="230" cy="462" rx="70" ry="8" fill="#f6b56a" opacity=".7"/>
      <path d="M410 540V340Q450 310 490 330Q530 290 560 310V540Z" fill="#3b5b41"/>
      <g fill="#1f3a2a">
        <path d="M478 410Q486 300 478 192" stroke="#1f3a2a" strokeWidth="6" fill="none"/>
        <use href="#bw-heritage-palm" transform="translate(478 192) scale(.95)"/>
        <path d="M420 400Q426 340 422 300" stroke="#1f3a2a" strokeWidth="5" fill="none"/>
        <use href="#bw-heritage-palm" transform="translate(422 300) scale(.6)"/>
      </g>
      <path d="M110 452Q240 486 400 436L388 450Q245 496 124 468Z" fill="#1b2420"/>
      <circle cx="340" cy="394" r="8" fill="#1b2420"/>
      <path d="M328 440L334 406H350L356 436Z" fill="#1b2420"/>
      <path d="M352 410L396 448" stroke="#1b2420" strokeWidth="3"/>
      <path d="M90 140q8 -8 16 0q8 -8 16 0M130 110q6 -6 12 0q6 -6 12 0"
        stroke="#4a3a2a" strokeWidth="2" fill="none"/>
    </svg>
  </div>;
}

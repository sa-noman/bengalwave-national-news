/**
 * Exact background SVG drawings from the user's bangla-banner (3).html.
 * Do NOT import the HTML's custom clipPath or edge SVG:
 * the existing Bengal Wave gold-and-green footer wave is preserved.
 */
export function HeritageBackground(){
  return <div className="bw-heritage-artwork" aria-hidden="true">
    {/* Left: original boat and river sketch */}
    <svg className="bw-heritage-art bw-heritage-art-left"
      viewBox="0 0 640 540" preserveAspectRatio="xMinYMax slice" focusable="false">
      <defs>
        <pattern id="bwh" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 4L4 0" stroke="#77746b" strokeWidth=".8"/>
        </pattern>
        <pattern id="bwvh" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M2.5 0V5" stroke="#77746b" strokeWidth=".7"/>
        </pattern>
        <g id="bwbt">
          <path d="M0 -270L-8 -20"/>
          <path d="M0 -262Q86 -160 112 -20H-4Z" fill="url(#bwvh)"/>
          <path d="M-6 -230Q-66 -140 -84 -20H-8Z" fill="url(#bwvh)"/>
          <path d="M-130 -10Q0 36 140 -16L120 6Q0 56 -112 14Z" fill="#77746b" opacity=".75"/>
          <path d="M-30 -12L-20 -30H34L44 -12" fill="#f4eee0"/>
          <path d="M0 -270L-126 -8M0 -270L138 -14"/>
        </g>
      </defs>
      <g fill="none" stroke="#77746b" strokeWidth="1.4" strokeLinecap="round"
        strokeLinejoin="round" opacity=".62">
        <path d="M0 352Q40 316 80 346T170 338T260 350T350 336T460 352T640 344"/>
        <rect y="344" width="640" height="16" fill="url(#bwh)" stroke="none" opacity=".6"/>
        <path d="M0 424Q160 384 300 404T640 396M0 520Q220 480 420 500T640 490"/>
        <path d="M40 452H150M200 472H330M380 456H500M90 492H210M300 500H430M520 478H610M20 520H120" opacity=".7"/>
        <use href="#bwbt" transform="translate(236 440) scale(.9)"/>
        <g opacity=".5"><use href="#bwbt" transform="translate(540 372) scale(.34)"/></g>
        <path d="M220 470Q250 478 280 470M300 480Q340 490 380 478M410 468Q440 474 470 466" opacity=".6"/>
      </g>
    </svg>

    {/* Right: original village, field, cottages and palm trees */}
    <svg className="bw-heritage-art bw-heritage-art-right"
      viewBox="0 0 560 540" preserveAspectRatio="xMaxYMax slice" focusable="false">
      <defs>
        <pattern id="bwh2" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 4L4 0" stroke="#77746b" strokeWidth=".8"/>
        </pattern>
        <g id="bwpl">
          <path d="M0 0Q6 -60 -2 -122"/>
          <path d="M-2 -122Q-32 -144 -60 -122M-2 -122Q28 -146 60 -124M-2 -122Q-22 -152 -44 -154M-2 -122Q20 -154 44 -156M-2 -122Q-4 -152 2 -170M-2 -122Q-40 -128 -58 -104M-2 -122Q36 -130 58 -106"/>
        </g>
        <g id="bwht">
          <path d="M0 0L30 -32L62 0Z" fill="url(#bwh2)"/>
          <rect x="6" y="0" width="50" height="26" fill="#f4eee0"/>
          <path d="M26 26V8h12v18"/>
        </g>
      </defs>
      <g fill="none" stroke="#77746b" strokeWidth="1.4" strokeLinecap="round"
        strokeLinejoin="round" opacity=".62">
        <g fill="url(#bwh2)" stroke="none" opacity=".55">
          <ellipse cx="120" cy="396" rx="70" ry="22"/>
          <ellipse cx="300" cy="388" rx="80" ry="20"/>
          <ellipse cx="450" cy="392" rx="60" ry="22"/>
        </g>
        <path d="M0 440Q280 420 560 436M0 462Q280 442 560 458M0 486Q280 468 560 484M0 510Q280 494 560 508"/>
        <path d="M30 470l6-14l6 14M190 480l6-14l6 14M330 474l6-14l6 14M500 482l6-14l6 14" opacity=".7"/>
        <use href="#bwht" transform="translate(140 404)"/>
        <use href="#bwht" transform="translate(262 414) scale(.82)"/>
        <use href="#bwht" transform="translate(372 400) scale(.9)"/>
        <use href="#bwpl" transform="translate(66 430) scale(1.1)"/>
        <use href="#bwpl" transform="translate(212 418) scale(.75)"/>
        <use href="#bwpl" transform="translate(470 424) scale(1.25)"/>
        <use href="#bwpl" transform="translate(528 440) scale(.85)"/>
      </g>
    </svg>
  </div>;
}

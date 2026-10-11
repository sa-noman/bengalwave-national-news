import Link from "next/link";

/**
 * Only the editorial text and icon layout.
 * The surrounding .bw-heritage background, artwork, and footer gold wave
 * continue to come from the existing stylesheet and FooterRiverscape.
 */
const topics=[
  {
    title:"ইতিহাসের পদচিহ্ন",
    description:"প্রাচীন সভ্যতা থেকে মুসলিম শাসন, সময়ের ধারায় বাংলার রূপান্তর।",
    href:"/search?q=ইতিহাস",
    icon:<svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <path d="M14 74H106L100 58H20Z" fill="#9b4a29"/>
      <path d="M26 58H94L88 44H32Z" fill="#a8532e"/>
      <path d="M38 44H82L76 30H44Z" fill="#94452a"/>
      <path d="M52 30H68L64 18H56Z" fill="#a8532e"/>
      <path d="M20 66H100M28 52H92M38 38H82" stroke="#5e2c1b" strokeWidth="1.5" opacity=".6"/>
    </svg>,
  },
  {
    title:"নদীর দেশ",
    description:"অসংখ্য নদী বেয়ে গড়ে ওঠা বাংলার জীবন ও সংস্কৃতি।",
    href:"/search?q=নদী",
    icon:<svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <path d="M6 50Q52 74 108 12Q104 58 56 68Q20 68 6 50Z" fill="#1d1d1d"/>
      <path d="M24 46H70" stroke="#1d1d1d" strokeWidth="4"/>
      <path d="M4 72H112M16 78H100" stroke="#5a6a6a" strokeWidth="1.5" opacity=".6"/>
    </svg>,
  },
  {
    title:"মাটির মানুষ",
    description:"কৃষি, কারিগরি আর লোকজ জীবনে বাংলার শক্তি।",
    href:"/search?q=লোকজ",
    icon:<svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <g stroke="#3d3228" strokeWidth="2" fill="#d8cdb6">
        <rect x="10" y="34" width="40" height="20" rx="6"/>
        <circle cx="14" cy="32" r="7"/>
        <path d="M12 24L6 16M18 24L24 16M16 54V72M26 54V72M40 54V72M48 54V72" fill="none"/>
        <circle cx="92" cy="22" r="6"/>
        <path d="M92 28V52M92 36L78 44M92 36L104 28M92 52L86 72M92 52L98 72" fill="none"/>
        <path d="M62 70V20M56 24H68" fill="none"/>
      </g>
    </svg>,
  },
  {
    title:"সংস্কৃতির মেলবন্ধন",
    description:"ভাষা, সাহিত্য, শিল্পে বহুত্বের মাঝে এক বাংলা।",
    href:"/category/culture",
    icon:<svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <rect x="32" y="6" width="52" height="64" fill="#6a4a35"/>
      <rect x="36" y="10" width="44" height="56" fill="none" stroke="#e9dcc3" strokeWidth="1.5"/>
      <g fill="#e9dcc3">
        <ellipse cx="58" cy="26" rx="5" ry="12"/>
        <ellipse cx="58" cy="26" rx="5" ry="12" transform="rotate(60 58 38)"/>
        <ellipse cx="58" cy="26" rx="5" ry="12" transform="rotate(-60 58 38)"/>
        <ellipse cx="58" cy="26" rx="4" ry="9" transform="rotate(120 58 38)"/>
        <ellipse cx="58" cy="26" rx="4" ry="9" transform="rotate(-120 58 38)"/>
      </g>
      <circle cx="58" cy="38" r="5" fill="#6a4a35"/>
      <path d="M40 56Q58 46 76 56M40 62Q58 52 76 62" stroke="#e9dcc3" strokeWidth="1.5" fill="none"/>
    </svg>,
  },
];

export function HeritageStories(){
  return <section className="bw-heritage" aria-labelledby="bw-heritage-heading">
    <div className="bw-wrap bw-heritage-grid">
      <div className="bw-heritage-intro">
        <span className="bw-heritage-eyebrow">বাংলার গল্প</span>
        <h2 id="bw-heritage-heading">হাজার<br/>বছরের বাংলা</h2>
        <p>নদী, মাটি, মানুষ আর সংস্কৃতির অসীম যাত্রায় গড়ে ওঠা এক অনন্য বাংলার গল্প।</p>
      </div>
      <div className="bw-heritage-topics">
        {topics.map(topic=><Link className="bw-heritage-topic" href={topic.href} key={topic.title}>
          <span className="bw-heritage-icon">{topic.icon}</span>
          <h3>{topic.title}</h3>
          <p>{topic.description}</p>
          <span className="bw-heritage-read">পড়ুন
            <span className="bw-heritage-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </span>
        </Link>)}
      </div>
    </div>
  </section>;
}

import React from 'react';
import './AnimatedRider.css';

const AnimatedRider = () => {
    return (
        <div className="scene" role="img" aria-label="Animated ProFast delivery rider on a motorbike moving across the screen">
            <span className="sr-only">ProFast delivery animation: a motorbike rider carrying a parcel bag moves smoothly from left to right in a looping animation.</span>

            {/* Clouds */}
            <div className="cloud c1"></div>
            <div className="cloud c2"></div>
            <div className="cloud c3"></div>

            {/* Road surface */}
            <div className="road-surface"></div>
            <div className="road-edge"></div>

            {/* Road dashes */}
            <div className="road-line rl1"></div>
            <div className="road-line rl2"></div>
            <div className="road-line rl3"></div>

            {/* Speed lines */}
            <div className="speed-line sl1"></div>
            <div className="speed-line sl2"></div>
            <div className="speed-line sl3"></div>
            <div className="speed-line sl4"></div>

            {/* Rider */}
            <div className="rider-wrap">
                <div className="shadow"></div>
                <div className="rider-body">
                    <svg width="200" height="130" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">

                        {/* === MOTORBIKE BODY === */}
                        {/* Frame */}
                        <path d="M60 90 L80 65 L120 65 L145 90" stroke="#2d2d2d" strokeWidth="4" strokeLinecap="round" fill="none" />
                        {/* Seat area */}
                        <rect x="78" y="58" width="48" height="10" rx="5" fill="#333" />
                        {/* Engine block */}
                        <rect x="85" y="70" width="38" height="22" rx="5" fill="#1a6bb5" />
                        {/* Exhaust */}
                        <path d="M88 92 Q80 98 70 95" stroke="#888" strokeWidth="3" strokeLinecap="round" fill="none" />
                        {/* Headlight */}
                        <ellipse cx="148" cy="80" rx="7" ry="5" fill="#fffbe6" stroke="#e8b84b" strokeWidth="1.5" />
                        {/* Fender front */}
                        <path d="M140 90 Q150 78 155 72" stroke="#1a6bb5" strokeWidth="3" strokeLinecap="round" fill="none" />
                        {/* Fender rear */}
                        <path d="M66 90 Q58 80 56 72" stroke="#1a6bb5" strokeWidth="3" strokeLinecap="round" fill="none" />
                        {/* Handle bar */}
                        <path d="M135 68 Q140 60 145 62" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />

                        {/* === WHEELS === */}
                        {/* Rear wheel */}
                        <g className="wheel">
                            <circle cx="62" cy="98" r="22" stroke="#222" strokeWidth="5" fill="#444" />
                            <circle cx="62" cy="98" r="14" stroke="#666" strokeWidth="2" fill="#333" />
                            <circle cx="62" cy="98" r="4" fill="#aaa" />
                            <line x1="62" y1="84" x2="62" y2="112" stroke="#666" strokeWidth="1.5" />
                            <line x1="48" y1="98" x2="76" y2="98" stroke="#666" strokeWidth="1.5" />
                            <line x1="52" y1="88" x2="72" y2="108" stroke="#555" strokeWidth="1.2" />
                            <line x1="72" y1="88" x2="52" y2="108" stroke="#555" strokeWidth="1.2" />
                        </g>
                        {/* Front wheel */}
                        <g className="wheel">
                            <circle cx="148" cy="98" r="22" stroke="#222" strokeWidth="5" fill="#444" />
                            <circle cx="148" cy="98" r="14" stroke="#666" strokeWidth="2" fill="#333" />
                            <circle cx="148" cy="98" r="4" fill="#aaa" />
                            <line x1="148" y1="84" x2="148" y2="112" stroke="#666" strokeWidth="1.5" />
                            <line x1="134" y1="98" x2="162" y2="98" stroke="#666" strokeWidth="1.5" />
                            <line x1="138" y1="88" x2="158" y2="108" stroke="#555" strokeWidth="1.2" />
                            <line x1="158" y1="88" x2="138" y2="108" stroke="#555" strokeWidth="1.2" />
                        </g>

                        {/* Fork */}
                        <line x1="142" y1="80" x2="148" y2="98" stroke="#555" strokeWidth="3" strokeLinecap="round" />

                        {/* === PARCEL BAG (rear) === */}
                        <rect x="30" y="52" width="40" height="36" rx="5" fill="#378add" />
                        {/* Bag strap */}
                        <rect x="30" y="62" width="40" height="4" fill="#185fa5" />
                        {/* ProFast text on bag */}
                        <rect x="32" y="67" width="36" height="16" rx="3" fill="white" opacity="0.95" />
                        <text x="50" y="77" fontFamily="system-ui,sans-serif" fontSize="6.5" fontWeight="700" fill="#378add" textAnchor="middle" dominantBaseline="middle">ProFast</text>
                        <text x="50" y="84" fontFamily="system-ui,sans-serif" fontSize="4.5" fontWeight="500" fill="#185fa5" textAnchor="middle" dominantBaseline="middle">⚡ DELIVERY</text>
                        {/* Bag buckle */}
                        <rect x="43" y="48" width="14" height="6" rx="2" fill="#185fa5" />

                        {/* === RIDER === */}
                        {/* Body / jacket */}
                        <path d="M95 35 Q100 28 105 35 L115 58 L85 58 Z" fill="#1a6bb5" />
                        {/* Arms */}
                        <path d="M115 45 Q128 50 136 60" stroke="#1a6bb5" strokeWidth="7" strokeLinecap="round" fill="none" />
                        <path d="M85 45 Q80 52 82 60" stroke="#1a6bb5" strokeWidth="7" strokeLinecap="round" fill="none" />
                        {/* Gloves / hands */}
                        <circle cx="136" cy="62" r="4" fill="#333" />
                        <circle cx="82" cy="62" r="4" fill="#333" />
                        {/* Head */}
                        <circle cx="100" cy="24" r="14" fill="#f5c070" />
                        {/* Helmet */}
                        <path d="M86 22 Q86 8 100 8 Q114 8 114 22 Q114 32 100 32 Q86 32 86 22Z" fill="#378add" />
                        <path d="M87 22 Q90 14 100 14 Q110 14 113 22" stroke="#185fa5" strokeWidth="2" fill="none" />
                        {/* Visor */}
                        <path d="M88 25 Q100 30 112 25" stroke="#1a3a6b" strokeWidth="3" strokeLinecap="round" fill="none" />
                        {/* Legs */}
                        <rect x="88" y="55" width="10" height="22" rx="4" fill="#222" />
                        <rect x="102" y="55" width="10" height="22" rx="4" fill="#222" />
                        {/* Boots */}
                        <rect x="86" y="73" width="14" height="8" rx="3" fill="#111" />
                        <rect x="100" y="73" width="14" height="8" rx="3" fill="#111" />

                    </svg>
                </div>
            </div>

            <div className="brand-label">ProFast Delivery</div>
        </div>
    );
};

export default AnimatedRider;

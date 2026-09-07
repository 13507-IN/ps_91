'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, TrendingUp, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

// Slides — swap background for real photos once available at
// /public/assets/landing/hero-images/slide-{1,2,3}.jpg
// For now, each slide uses a government-style gradient + SVG illustration.
const SLIDES = [
  {
    heading: 'Is Your Business Idea',
    highlight: 'Viable in Your Village?',
    sub:
      'Enter your location, capital, and business idea. Get a full evidence-backed feasibility report — market intelligence, EMI, scheme matching, and a 30-day action plan.',
    cta: 'Start Free Assessment',
    ctaHref: '/assessment-wizard',
    secondaryCta: 'View Sample Report',
    secondaryHref: '/feasibility-report',
    // Gradient: navy to saffron-orange
    bg: 'linear-gradient(135deg, #102347 0%, #1A3A6B 45%, #2C5FA8 70%, #E65C00 100%)',
  },
  {
    heading: 'Scheme-Matched Financial Plans',
    highlight: 'Built on Real Data',
    sub:
      'PMEGP, MUDRA, Stand-Up India — we match your profile to government schemes and calculate your exact EMI, subsidy, and funding gap in minutes.',
    cta: 'Check Scheme Eligibility',
    ctaHref: '/schemes',
    secondaryCta: 'How It Works',
    secondaryHref: '/#how-it-works',
    bg: 'linear-gradient(135deg, #0a1a3a 0%, #1A3A6B 50%, #E65C00 85%, #FF8C00 100%)',
  },
  {
    heading: 'Local Market Intelligence',
    highlight: 'for 6,40,000+ Villages',
    sub:
      'Population, competitors, mandi prices, road connectivity, livestock data — all official government sources, tagged with confidence levels.',
    cta: 'Explore Your Market',
    ctaHref: '/assessment-wizard',
    secondaryCta: 'Data Sources',
    secondaryHref: '/#data-sources',
    bg: 'linear-gradient(135deg, #0d2147 0%, #1E4A8A 50%, #2C5FA8 75%, #138808 100%)',
  },
];

/** Decorative SVG background scene per slide */
const SlideIllustration = ({ index }: { index: number }) => {
  const illustrations = [
    /* Slide 0 — village market stalls */
    <svg
      key="ill-0"
      viewBox="0 0 900 420"
      className="absolute inset-0 w-full h-full opacity-[0.12]"
      aria-hidden="true"
    >
      {/* Market stalls */}
      {[60, 200, 350, 490, 640, 770].map((x, i) => (
        <g key={i}>
          <rect x={x} y={220} width={100} height={150} rx="3" fill="#FFFFFF" />
          <polygon points={`${x - 10},220 ${x + 110},220 ${x + 90},190 ${x + 10},190`} fill="#FF9933" opacity="0.8" />
        </g>
      ))}
      {/* Ground */}
      <rect x="0" y="370" width="900" height="50" fill="#FFFFFF" opacity="0.15" />
      {/* Sun */}
      <circle cx="820" cy="80" r="55" fill="#FF9933" opacity="0.25" />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => (
        <line
          key={deg}
          x1={820 + 60 * Math.cos((deg * Math.PI) / 180)}
          y1={80 + 60 * Math.sin((deg * Math.PI) / 180)}
          x2={820 + 80 * Math.cos((deg * Math.PI) / 180)}
          y2={80 + 80 * Math.sin((deg * Math.PI) / 180)}
          stroke="#FF9933"
          strokeWidth="2"
          opacity="0.4"
        />
      ))}
      {/* People silhouettes */}
      {[140, 280, 420, 560, 700].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={340} r="10" fill="#FFFFFF" opacity="0.5" />
          <rect x={x - 7} y={350} width="14" height="25" rx="3" fill="#FFFFFF" opacity="0.4" />
        </g>
      ))}
    </svg>,

    /* Slide 1 — farmland horizon */
    <svg
      key="ill-1"
      viewBox="0 0 900 420"
      className="absolute inset-0 w-full h-full opacity-[0.12]"
      aria-hidden="true"
    >
      {/* Rolling fields */}
      <path d="M0 300 Q225 250 450 280 Q675 310 900 260 L900 420 L0 420Z" fill="#FFFFFF" opacity="0.3" />
      <path d="M0 330 Q180 300 360 320 Q540 340 720 310 Q810 295 900 315 L900 420 L0 420Z" fill="#FFFFFF" opacity="0.2" />
      {/* Crops / stalks */}
      {Array.from({ length: 18 }).map((_, i) => (
        <g key={i}>
          <line
            x1={40 + i * 48}
            y1={300}
            x2={40 + i * 48}
            y2={260 - (i % 3) * 12}
            stroke="#FF9933"
            strokeWidth="2.5"
            opacity="0.6"
          />
          <ellipse
            cx={40 + i * 48}
            cy={255 - (i % 3) * 12}
            rx="8"
            ry="14"
            fill="#FF9933"
            opacity="0.5"
          />
        </g>
      ))}
      {/* Horizon sun */}
      <circle cx="450" cy="140" r="70" fill="#FFFFFF" opacity="0.1" />
      <circle cx="450" cy="140" r="45" fill="#FFFFFF" opacity="0.15" />
    </svg>,

    /* Slide 2 — roads & connectivity */
    <svg
      key="ill-2"
      viewBox="0 0 900 420"
      className="absolute inset-0 w-full h-full opacity-[0.12]"
      aria-hidden="true"
    >
      {/* Road */}
      <path d="M380 420 L420 200 L480 200 L520 420Z" fill="#FFFFFF" opacity="0.3" />
      {/* Dashes */}
      {[380, 340, 300, 260, 220].map((y, i) => (
        <rect key={i} x="445" y={y} width="10" height="24" rx="2" fill="#FF9933" opacity="0.5" />
      ))}
      {/* Buildings left */}
      <rect x="80" y="200" width="160" height="120" rx="6" fill="#FFFFFF" opacity="0.15" />
      <rect x="90" y="190" width="140" height="15" rx="3" fill="#FF9933" opacity="0.3" />
      {/* Buildings right */}
      <rect x="660" y="210" width="170" height="110" rx="6" fill="#FFFFFF" opacity="0.15" />
      <rect x="670" y="200" width="150" height="15" rx="3" fill="#FF9933" opacity="0.3" />
      {/* Trees */}
      {[60, 120, 180, 720, 780, 840].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={180} r={20 + (i % 2) * 8} fill="#FFFFFF" opacity="0.2" />
          <rect x={x - 3} y={195} width="6" height="30" fill="#FFFFFF" opacity="0.2" />
        </g>
      ))}
      {/* Signal waves */}
      {[0, 1, 2].map((r) => (
        <circle
          key={r}
          cx="720"
          cy="100"
          r={30 + r * 20}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity={0.3 - r * 0.08}
        />
      ))}
      <circle cx="720" cy="100" r="6" fill="#FF9933" opacity="0.6" />
    </svg>,
  ];

  return illustrations[index % illustrations.length];
};

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => goTo((active + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const goTo = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    setActive(idx);
    setTimeout(() => setAnimating(false), 700);
  };

  const slide = SLIDES[active];

  return (
    <section
      id="main-content"
      className="relative min-h-[86vh] flex items-center overflow-hidden"
      aria-label="Hero banner"
    >
      {/* Background slides */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: active === i ? 1 : 0,
            background: s.bg,
          }}
          aria-hidden={active !== i}
        >
          <SlideIllustration index={i} />
        </div>
      ))}

      {/* Left-side dark gradient for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(100deg, rgba(10,25,60,0.88) 0%, rgba(10,25,60,0.72) 45%, rgba(10,25,60,0.20) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 w-full py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white/90 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 backdrop-blur-sm">
            <Shield size={13} className="text-[#FF9933]" />
            <span>Census · UDYAM · AGMARKNET · Govt. of India Data</span>
          </div>

          {/* Headline */}
          <h1
            key={`h-${active}`}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight animate-fadeIn"
          >
            {slide.heading}
            <span className="block mt-1" style={{ color: '#FF9933' }}>
              {slide.highlight}
            </span>
          </h1>

          {/* Subtext */}
          <p
            key={`p-${active}`}
            className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-xl animate-fadeIn"
          >
            {slide.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded text-base font-bold text-white bg-[#E65C00] hover:bg-[#CC5200] transition-colors"
            >
              {slide.cta}
              <ArrowRight size={17} />
            </Link>
            <Link
              href={slide.secondaryHref}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded text-base font-semibold border-2 border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              {slide.secondaryCta}
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-5 mt-10">
            {[
              { icon: MapPin, text: '6,40,000+ Villages Mapped' },
              { icon: TrendingUp, text: '48 Government Schemes' },
              { icon: Shield, text: 'Free · No Login Required' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-white/75 text-sm"
              >
                <item.icon size={14} style={{ color: '#FF9933' }} className="flex-shrink-0" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide navigation arrows */}
      <button
        onClick={() => goTo((active - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => goTo((active + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20" role="tablist" aria-label="Slide indicators">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: active === i ? '1.75rem' : '0.5rem',
              backgroundColor: active === i ? '#FF9933' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* Bottom wave — white fill to blend into next section */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 1440 56"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14"
        >
          <path d="M0 40 C360 80 1080 0 1440 36 L1440 56 L0 56 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </section>
  );
}

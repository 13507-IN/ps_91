'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, TrendingUp, Shield } from 'lucide-react';

// Placeholder gradient slides — swap for real images by placing photos at
// /public/assets/landing/hero-images/slide-{1,2,3}.jpg
const SLIDE_GRADIENTS = [
  'linear-gradient(135deg, #0B3D3A 0%, #146C64 40%, #2A9D8F 70%, #E98A15 100%)',
  'linear-gradient(135deg, #154c41 0%, #0F7A4E 45%, #2A9D8F 75%, #F5A832 100%)',
  'linear-gradient(135deg, #0a2b25 0%, #0B3D3A 50%, #146C64 80%, #E98A15 100%)',
];

// SVG scene illustrations per slide (no external images needed)
const SlideScene = ({ index }: { index: number }) => {
  const scenes = [
    /* Slide 0 — village market */
    <svg key="s0" viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
      <rect x="50" y="200" width="100" height="150" rx="4" fill="#FAF8F3"/>
      <rect x="170" y="170" width="120" height="180" rx="4" fill="#F5A832" opacity="0.7"/>
      <rect x="310" y="210" width="90" height="140" rx="4" fill="#FAF8F3" opacity="0.6"/>
      <rect x="420" y="180" width="130" height="170" rx="4" fill="#F5A832" opacity="0.5"/>
      <rect x="570" y="200" width="100" height="150" rx="4" fill="#FAF8F3" opacity="0.7"/>
      <ellipse cx="400" cy="80" rx="180" ry="50" fill="#F5A832" opacity="0.15"/>
      <circle cx="120" cy="320" r="30" fill="#0F7A4E" opacity="0.4"/>
      <circle cx="380" cy="340" r="25" fill="#0F7A4E" opacity="0.3"/>
      <circle cx="630" cy="330" r="35" fill="#0F7A4E" opacity="0.4"/>
      <path d="M0 350 Q200 300 400 340 Q600 380 800 340 L800 400 L0 400Z" fill="#0F5450" opacity="0.3"/>
    </svg>,
    /* Slide 1 — farmland */
    <svg key="s1" viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
      <path d="M0 280 Q100 240 200 260 Q300 280 400 250 Q500 220 600 245 Q700 270 800 250 L800 400 L0 400Z" fill="#0F7A4E" opacity="0.5"/>
      <path d="M0 300 Q150 270 300 290 Q450 310 600 285 Q700 265 800 280 L800 400 L0 400Z" fill="#146C64" opacity="0.4"/>
      <circle cx="150" cy="120" r="80" fill="#F5A832" opacity="0.2"/>
      <circle cx="600" cy="100" r="60" fill="#F5A832" opacity="0.15"/>
      {[50,120,200,280,360,440,520,600,680].map((x,i) => (
        <rect key={i} x={x} y={240 + (i%3)*10} width="8" height={40 + (i%2)*20} rx="2" fill="#0F7A4E" opacity="0.5"/>
      ))}
    </svg>,
    /* Slide 2 — infrastructure / road */
    <svg key="s2" viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
      <path d="M350 400 L380 200 L420 200 L450 400Z" fill="#FAF8F3" opacity="0.3"/>
      <line x1="400" y1="200" x2="400" y2="400" stroke="#F5A832" strokeWidth="4" strokeDasharray="20,15" opacity="0.5"/>
      <rect x="100" y="220" width="150" height="100" rx="8" fill="#FAF8F3" opacity="0.15"/>
      <rect x="550" y="200" width="160" height="120" rx="8" fill="#FAF8F3" opacity="0.15"/>
      <circle cx="110" cy="195" r="25" fill="#0F7A4E" opacity="0.4"/>
      <circle cx="690" cy="180" r="30" fill="#0F7A4E" opacity="0.4"/>
      <path d="M0 360 L800 360" stroke="#FAF8F3" strokeWidth="2" opacity="0.2"/>
    </svg>,
  ];
  return scenes[index] ?? scenes[0];
};

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDE_GRADIENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="main-content" className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Background gradient slides */}
      {SLIDE_GRADIENTS.map((gradient, i) => (
        <div
          key={`hero-slide-${i}`}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: activeSlide === i ? 1 : 0, background: gradient }}
          aria-hidden={activeSlide !== i}
        >
          <SlideScene index={i} />
        </div>
      ))}

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #FAF8F3 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* Dark gradient for text legibility on left side */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, rgba(11,61,58,0.92) 0%, rgba(11,61,58,0.75) 50%, rgba(11,61,58,0.30) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 w-full py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#E98A15]/20 border border-[#E98A15]/40 text-[#E98A15] px-3 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield size={14} />
            Powered by Census · UDYAM · AGMARKNET
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Is Your Business Idea
            <span className="text-[#E98A15] block mt-1">Viable in Your Village?</span>
          </h1>

          <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl">
            Enter your location, available capital, and business idea. Get a full evidence-backed
            feasibility report — market intelligence, EMI calculation, scheme matching, and a 30-day
            action plan.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/assessment-wizard"
              className="btn-saffron inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-base font-semibold"
            >
              Start Free Assessment
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/feasibility-report"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-base font-semibold border-2 border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              View Sample Report
            </Link>
          </div>

          {/* Quick trust signals */}
          <div className="flex flex-wrap gap-5 mt-10">
            {[
              { icon: MapPin, text: '6,40,000+ Villages Mapped' },
              { icon: TrendingUp, text: '48 Schemes Matched' },
              { icon: Shield, text: 'Free · No Login Required' },
            ].map((item) => (
              <div key={`trust-${item.text}`} className="flex items-center gap-2 text-white/75 text-sm">
                <item.icon size={14} className="text-[#E98A15] flex-shrink-0" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide indicator dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDE_GRADIENTS.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => setActiveSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeSlide === i ? 'bg-[#E98A15] w-6' : 'bg-white/40 w-2'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10" aria-hidden="true">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 sm:h-14">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="var(--paper)" />
        </svg>
      </div>
    </section>
  );
}
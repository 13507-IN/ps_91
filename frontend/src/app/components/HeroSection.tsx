'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function HeroSection() {
  const { t } = useTranslation();
  const SLIDES = t.hero.slides;
  const TOTAL = SLIDES.length;

  const [active, setActive] = useState(0);
  const animatingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function goTo(idx: number) {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setActive(((idx % TOTAL) + TOTAL) % TOTAL);
    setTimeout(() => { animatingRef.current = false; }, 650);
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % TOTAL);
    }, 5000);
  }

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNav(idx: number) {
    goTo(idx);
    resetTimer();
  }

  return (
    <section
      id="main-content"
      className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#111827]"
      aria-label="Hero banner"
    >
      {/* ── All slide background images ── */}
      {SLIDES.map((s, i) => (
        <div
          key={`slide-bg-${i}`}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: active === i ? 1 : 0 }}
          aria-hidden={active !== i}
        >
          <Image
            src={`/${i + 1}.jpg`}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden="true"
          />
        </div>
      ))}

      {/* ── Dark left-ramp overlay for text legibility ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: [
            'linear-gradient(to right, rgba(15,15,18,0.82) 0%, rgba(15,15,18,0.70) 32%, rgba(15,15,18,0.42) 62%, rgba(15,15,18,0.12) 100%)',
            'linear-gradient(to top, rgba(15,15,18,0.55) 0%, transparent 42%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* ── Subtle dot texture ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* ── Slide Content ── */}
      <div className="relative z-20 max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 w-full py-20 lg:py-28 h-full flex items-center">
        <div className="relative w-full max-w-2xl min-h-[320px] lg:min-h-[360px]">
          {SLIDES.map((s, i) => (
            <div
              key={`slide-content-${i}`}
              className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-out ${
                active === i
                  ? 'opacity-100 translate-y-0 pointer-events-auto z-10'
                  : 'opacity-0 translate-y-8 pointer-events-none z-0'
              }`}
              aria-hidden={active !== i}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-md">
                {s.heading}{' '}
                <span className="text-[#FF9933] drop-shadow-sm">{s.highlight}</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-xl leading-relaxed drop-shadow">
                {s.sub}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button className="rounded-full bg-[#E65C00] hover:bg-[#c54d00] text-white px-8 py-3.5 font-semibold transition-all shadow-lg hover:shadow-xl">
                  {s.cta}
                </button>
                <button className="rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/30 text-white px-8 py-3.5 font-semibold transition-all">
                  {s.secondaryCta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Slide counter — bottom-right (MHA-style) ── */}
      <div className="absolute bottom-10 right-6 z-20 hidden sm:flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 select-none">
        <span className="text-[#FF9933] text-sm font-bold tabular-nums">{String(active + 1).padStart(2, '0')}</span>
        <span className="text-white/30 text-xs">/</span>
        <span className="text-white/55 text-xs tabular-nums">{String(TOTAL).padStart(2, '0')}</span>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={() => handleNav(active - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 border border-white/20 flex items-center justify-center text-white hover:bg-[#E65C00] hover:border-[#E65C00] transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => handleNav(active + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 border border-white/20 flex items-center justify-center text-white hover:bg-[#E65C00] hover:border-[#E65C00] transition-all"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Thumbnail strip (MHA-style bottom image row on desktop) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden lg:flex gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={`thumb-${i}`}
            onClick={() => handleNav(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active === i}
            className="relative overflow-hidden rounded transition-all duration-300 flex-shrink-0"
            style={{
              width: active === i ? '4.5rem' : '2.75rem',
              height: '2.75rem',
              outline: active === i ? '2px solid #FF9933' : '2px solid rgba(255,255,255,0.25)',
              outlineOffset: '1px',
              opacity: active === i ? 1 : 0.6,
            }}
          >
            <Image
              src={`/${i + 1}.jpg`}
              alt={`Slide ${i + 1}`}
              fill
              sizes="72px"
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* ── Mobile dot indicators ── */}
      <div
        className="lg:hidden absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-20"
        role="tablist"
        aria-label="Slide indicators"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => handleNav(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: active === i ? '2rem' : '0.375rem',
              backgroundColor: active === i ? '#FF9933' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>

      {/* ── Bottom wave ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 52" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 sm:h-12">
          <path d="M0 36 C360 70 1080 0 1440 32 L1440 52 L0 52 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </section>
  );
}

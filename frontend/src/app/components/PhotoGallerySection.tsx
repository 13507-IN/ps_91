import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// MHA-style "What's New" / photo feature section
// Uses portrait and square images from /public

const FEATURED_CARDS = [
  {
    img: '/3.jpg',
    imgW: 736, imgH: 959,
    tag: 'Market Intelligence',
    title: 'Hyper-Local Business Data for Every Village',
    desc: 'Census population, amenities, crop patterns, livestock counts and road access — all within your 10 km catchment.',
    href: '/assessment-wizard',
  },
  {
    img: '/7.jpg',
    imgW: 538, imgH: 800,
    tag: 'Action Plan',
    title: '30-Day Funding Readiness Roadmap',
    desc: 'Step-by-step milestones: quotations, UDYAM registration, scheme application, and bank submission — all in one checklist.',
    href: '/assessment-wizard',
  },
  {
    img: '/8.jpg',
    imgW: 364, imgH: 484,
    tag: 'Scheme Matching',
    title: 'Automatic Government Scheme Eligibility',
    desc: 'PMEGP, MUDRA, Stand-Up India, PMFME and 44 more — matched to your age, category, location and project cost.',
    href: '/schemes',
  },
];

const PHOTO_STRIP = [
  { img: '/4.jpg', label: 'Rural Entrepreneurs' },
  { img: '/5.jpg', label: 'Field Assessment' },
  { img: '/6.jpg', label: 'Market Survey' },
];

export function PhotoGallerySection() {
  return (
    <>
      {/* ── What's New section (MHA-style) ── */}
      <section className="py-12 bg-white border-b border-[#EEEEEE]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">

          {/* Section header — MHA style with left orange rule */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-8 bg-[#E65C00] rounded-full flex-shrink-0" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-[#1A3A6B] uppercase tracking-wide">
              What We Offer
            </h2>
            <div className="flex-1 h-px bg-[#EEEEEE]" aria-hidden="true" />
          </div>

          {/* 3-column feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group bg-white border border-[#DDDDDD] rounded-xl overflow-hidden hover:shadow-lg hover:border-[#E65C00]/40 transition-all duration-200"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-[#F5F5F5]">
                  <Image
                    src={card.img}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Tag badge */}
                  <div className="absolute top-3 left-3 bg-[#1A3A6B] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                    {card.tag}
                  </div>
                </div>

                {/* Text */}
                <div className="p-4">
                  <h3 className="font-bold text-[#1A3A6B] text-base leading-snug mb-2 group-hover:text-[#E65C00] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#555555] leading-relaxed mb-3">
                    {card.desc}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#E65C00]">
                    Know More <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full-width photo strip (MHA-style 3-panel image band) ── */}
      <section className="py-0 bg-[#1A3A6B]" aria-label="Photo gallery">
        <div className="tricolor-divider w-full" aria-hidden="true" />
        <div className="grid grid-cols-3 h-64 sm:h-80 lg:h-96">
          {PHOTO_STRIP.map((item, i) => (
            <div key={item.img} className="relative overflow-hidden group">
              <Image
                src={item.img}
                alt={item.label}
                fill
                sizes="33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a3a]/80 via-transparent to-transparent" />
              {/* Divider between panels */}
              {i < PHOTO_STRIP.length - 1 && (
                <div className="absolute right-0 top-0 bottom-0 w-px bg-white/20" aria-hidden="true" />
              )}
              {/* Label */}
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-white text-sm font-semibold">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="tricolor-divider w-full" aria-hidden="true" />
      </section>
    </>
  );
}

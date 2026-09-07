import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LandingCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-4">
      <div className="rounded-3xl bg-gradient-to-br from-[#0B3D3A] to-[#0a2b25] px-6 py-14 text-center text-white relative overflow-hidden">
        {/* Decorative background pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #FAF8F3 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />
        {/* Tricolor top accent */}
        <div className="tricolor-divider absolute top-0 left-0 right-0" aria-hidden="true" />

        <h2 className="text-3xl font-bold relative z-10">Your market has an answer.</h2>
        <p className="mx-auto mt-3 max-w-xl text-[#FAF8F3]/80 relative z-10">
          Answer three simple questions and get a feasibility verdict, scheme-matched financial plan
          and a 30-day funding roadmap — in minutes, on your phone.
        </p>
        <Link
          href="/assessment-wizard"
          className="inline-flex items-center gap-2 mt-8 bg-[#E98A15] hover:bg-[#F5A832] text-[#0B3D3A] font-bold px-8 py-3.5 rounded-lg transition-colors relative z-10"
        >
          Begin My Assessment
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
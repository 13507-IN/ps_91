import Link from 'next/link';

export function LandingCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-12 text-center text-white md:px-12">
        <h2 className="text-3xl font-bold">Your market has an answer.</h2>
        <p className="mx-auto mt-3 max-w-xl text-emerald-50/90">
          Answer three simple questions and get a feasibility verdict, scheme-matched financial plan
          and a 30-day funding roadmap — in minutes, on your phone.
        </p>
        <Link href="/assessment-wizard" className="btn mt-8 bg-white px-8 py-3 text-brand-800 hover:bg-emerald-50">
          Begin My Assessment
        </Link>
      </div>
    </section>
  );
}
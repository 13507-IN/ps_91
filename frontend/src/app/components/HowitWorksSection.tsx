import { Map, Compass, Wallet, LineChart, ShieldAlert, ClipboardCheck } from 'lucide-react';

const steps = [
  {
    icon: Map,
    title: '1. Understand Your Market',
    desc: 'Population, households, amenities, crops, livestock and infrastructure within your catchment area — each value tagged with its source and confidence.',
  },
  {
    icon: Compass,
    title: '2. Find the Opportunity',
    desc: 'We estimate local demand versus existing supply and surface market gaps, low-competition niches and a recommended business model.',
  },
  {
    icon: Wallet,
    title: '3. Build the Financial Plan',
    desc: 'Project cost, own contribution, loan, matched government scheme, interest, tenure and EMI — plus cashflow, working capital and break-even.',
  },
  {
    icon: LineChart,
    title: '4. Stress Test the Business',
    desc: 'Simulate raw-material price hikes, demand drops and cost shocks to see if the business stays sustainable.',
  },
  {
    icon: ShieldAlert,
    title: '5. Understand the Risks',
    desc: 'A probability × impact risk matrix with honest mitigations — never presented as fact.',
  },
  {
    icon: ClipboardCheck,
    title: '6. Get Your Action Plan',
    desc: 'A 30-day funding-readiness roadmap: quotations, registrations, scheme application and launch tasks.',
  },
];

export function HowitWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-slate-900">From idea to funding readiness</h2>
        <p className="mt-3 text-slate-600">
          UdyamSetu is a decision-support dashboard, not a chatbot. AI analyses behind the scenes;
          you get structured, explainable intelligence.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {steps.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
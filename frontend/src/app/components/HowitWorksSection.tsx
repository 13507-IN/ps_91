import { Map, Compass, Wallet, LineChart, ShieldAlert, ClipboardCheck } from 'lucide-react';

const steps = [
  {
    icon: Map,
    step: '01',
    title: 'Understand Your Market',
    desc: 'Population, households, amenities, crops, livestock and infrastructure within your catchment area — each value tagged with its source and confidence.',
  },
  {
    icon: Compass,
    step: '02',
    title: 'Find the Opportunity',
    desc: 'We estimate local demand versus existing supply and surface market gaps, low-competition niches and a recommended business model.',
  },
  {
    icon: Wallet,
    step: '03',
    title: 'Build the Financial Plan',
    desc: 'Project cost, own contribution, loan, matched government scheme, interest, tenure and EMI — plus cashflow, working capital and break-even.',
  },
  {
    icon: LineChart,
    step: '04',
    title: 'Stress Test the Business',
    desc: 'Simulate raw-material price hikes, demand drops and cost shocks to see if the business stays sustainable.',
  },
  {
    icon: ShieldAlert,
    step: '05',
    title: 'Understand the Risks',
    desc: 'A probability × impact risk matrix with honest mitigations — never presented as fact.',
  },
  {
    icon: ClipboardCheck,
    step: '06',
    title: 'Get Your Action Plan',
    desc: 'A 30-day funding-readiness roadmap: quotations, registrations, scheme application and launch tasks.',
  },
];

export function HowitWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="max-w-2xl mb-12">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#E98A15] mb-3">
          How It Works
        </div>
        <h2 className="text-3xl font-bold text-[#0B3D3A]">From idea to funding readiness</h2>
        <p className="mt-3 text-[#4A5568]">
          UdyamSetu is a decision-support dashboard, not a chatbot. AI analyses behind the scenes;
          you get structured, explainable intelligence.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {steps.map(({ icon: Icon, step, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-xl border border-[#D8D3C8] p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0B3D3A]/8 border border-[#0B3D3A]/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#0B3D3A]" />
              </div>
              <span className="text-2xl font-extrabold text-[#E98A15]/40 font-tabular leading-none pt-1">
                {step}
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#0B3D3A] mb-1.5">{title}</h3>
            <p className="text-sm leading-relaxed text-[#4A5568]">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
const sources = [
  { name: 'Census & LGD', desc: 'Population, households, villages', icon: '🏘️', color: '#1A3A6B' },
  { name: 'UDYAM / MSME', desc: 'Formal enterprise registrations', icon: '🏭', color: '#E65C00' },
  { name: 'Livestock & Crop Data', desc: 'Dairy, poultry and farm supply', icon: '🌾', color: '#138808' },
  { name: 'AGMARKNET', desc: 'Daily mandi commodity prices', icon: '📊', color: '#E65C00' },
  { name: 'Community Reports', desc: 'Local informal businesses', icon: '🤝', color: '#1A3A6B' },
  { name: 'AI Inference', desc: 'Best-effort estimates, clearly labelled', icon: '🧠', color: '#138808' },
];

export function TrustDataSourcesStrip() {
  return (
    <section id="data-sources" className="py-16 bg-[#F5F5F5]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#E65C00] mb-3 border-b-2 border-[#E65C00] pb-1">
            Data Sources
          </div>
          <h2 className="text-2xl font-bold text-[#1A3A6B]">Built on layered local evidence</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-[#4A5568]">
            Rural markets are partially observable. We combine official government data, community
            reports and AI estimates — and we always tell you which is which.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {sources.map((s) => (
            <div
              key={s.name}
              className="rounded-xl border border-[#DDDDDD] bg-white p-4 hover:shadow-sm transition-all hover:border-[#E65C00]/40"
            >
              <div className="text-2xl mb-2" aria-hidden="true">{s.icon}</div>
              <div className="text-sm font-semibold text-[#1A3A6B]">{s.name}</div>
              <div className="mt-1 text-xs text-[#718096]">{s.desc}</div>
              <div
                className="mt-2 h-0.5 w-8 rounded-full"
                style={{ backgroundColor: s.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

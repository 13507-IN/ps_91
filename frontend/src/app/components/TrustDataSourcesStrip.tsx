const sources = [
  { name: 'Census & LGD', desc: 'Population, households, villages', icon: '🏘️' },
  { name: 'UDYAM / MSME', desc: 'Formal enterprise registrations', icon: '🏭' },
  { name: 'Livestock & Crop Data', desc: 'Dairy, poultry and farm supply', icon: '🌾' },
  { name: 'AGMARKNET', desc: 'Daily mandi commodity prices', icon: '📊' },
  { name: 'Community Reports', desc: 'Local informal businesses', icon: '🤝' },
  { name: 'AI Inference', desc: 'Best-effort estimates, clearly labelled', icon: '🧠' },
];

export function TrustDataSourcesStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#E98A15] mb-3">
          Data Sources
        </div>
        <h2 className="text-2xl font-bold text-[#0B3D3A]">Built on layered local evidence</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#4A5568]">
          Rural markets are partially observable. We combine official data, community reports and AI
          estimates — and we always tell you which is which.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {sources.map((s) => (
          <div
            key={s.name}
            className="rounded-xl border border-[#D8D3C8] bg-white p-4 hover:border-[#146C64]/40 hover:shadow-sm transition-all"
          >
            <div className="text-xl mb-2" aria-hidden="true">{s.icon}</div>
            <div className="text-sm font-semibold text-[#0B3D3A]">{s.name}</div>
            <div className="mt-1 text-xs text-[#718096]">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
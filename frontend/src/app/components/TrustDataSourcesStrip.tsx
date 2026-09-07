const sources = [
  { name: 'Census & LGD', desc: 'Population, households, villages' },
  { name: 'UDYAM / MSME', desc: 'Formal enterprise registrations' },
  { name: 'Livestock & Crop Data', desc: 'Dairy, poultry and farm supply' },
  { name: 'AGMARKNET', desc: 'Daily mandi commodity prices' },
  { name: 'Community Reports', desc: 'Local informal businesses' },
  { name: 'AI Inference', desc: 'Best-effort estimates, clearly labelled' },
];

export function TrustDataSourcesStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Built on layered local evidence</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
          Rural markets are partially observable. We combine official data, community reports and AI
          estimates — and we always tell you which is which.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {sources.map((s) => (
          <div key={s.name} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">{s.name}</div>
            <div className="mt-1 text-xs text-slate-500">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
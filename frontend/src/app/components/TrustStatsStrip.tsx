const stats = [
  { value: '10 km', label: 'Default catchment analysis radius' },
  { value: '15+', label: 'Public government data sources' },
  { value: '5', label: 'MVP business categories' },
  { value: '3', label: 'Confidence levels: High, Medium, Low' },
];

export function TrustStatsStrip() {
  return (
    <section className="border-y border-brand-900/10 bg-brand-950 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-bold text-brand-200">{s.value}</div>
            <div className="mt-1 text-xs text-emerald-100/70">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
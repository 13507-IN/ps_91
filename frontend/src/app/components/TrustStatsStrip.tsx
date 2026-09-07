const stats = [
  { value: '10 km', label: 'Default catchment analysis radius' },
  { value: '15+', label: 'Public government data sources' },
  { value: '11', label: 'Business categories supported' },
  { value: '3', label: 'Confidence levels: High, Medium, Low' },
];

export function TrustStatsStrip() {
  return (
    <section className="border-y border-[#0B3D3A]/10 bg-[#0B3D3A] py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-bold text-[#E98A15]">{s.value}</div>
            <div className="mt-1 text-xs text-[#FAF8F3]/70 leading-snug">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
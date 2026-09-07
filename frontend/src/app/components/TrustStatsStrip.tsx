const stats = [
  { value: '6,40,000+', label: 'Villages Mapped' },
  { value: '15+', label: 'Official Govt. Data Sources' },
  { value: '11', label: 'Business Categories' },
  { value: '48', label: 'Matched Govt. Schemes' },
];

export function TrustStatsStrip() {
  return (
    <section className="bg-[#1A3A6B] py-8 border-y border-[#1A3A6B]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-[#FF9933]">{s.value}</div>
              <div className="mt-1 text-xs text-white/65 leading-snug">{s.label}</div>
              {/* Thin orange underline */}
              {i < stats.length - 1 && (
                <div className="hidden md:block absolute" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

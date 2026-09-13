'use client';

import { useTranslation } from '@/lib/i18n/useTranslation';

export function TrustDataSourcesStrip() {
  const { t } = useTranslation();

  const sources = [
    { name: t.dataSources.sources.census.name, desc: t.dataSources.sources.census.desc, icon: '🏘️', color: '#1A3A6B' },
    { name: t.dataSources.sources.udyam.name, desc: t.dataSources.sources.udyam.desc, icon: '🏭', color: '#E65C00' },
    { name: t.dataSources.sources.livestock.name, desc: t.dataSources.sources.livestock.desc, icon: '🌾', color: '#138808' },
    { name: t.dataSources.sources.agmarknet.name, desc: t.dataSources.sources.agmarknet.desc, icon: '📊', color: '#E65C00' },
    { name: t.dataSources.sources.community.name, desc: t.dataSources.sources.community.desc, icon: '🤝', color: '#1A3A6B' },
    { name: t.dataSources.sources.ai.name, desc: t.dataSources.sources.ai.desc, icon: '🧠', color: '#138808' },
  ];

  return (
    <section id="data-sources" className="py-16 bg-[#F5F5F5]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#E65C00] mb-3 border-b-2 border-[#E65C00] pb-1">
            {t.dataSources.sectionLabel}
          </div>
          <h2 className="text-2xl font-bold text-[#1A3A6B]">{t.dataSources.headline}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-[#4A5568]">
            {t.dataSources.subheadline}
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

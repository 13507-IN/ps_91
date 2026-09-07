import React from 'react';
import Link from 'next/link';

export default function GovFooter() {
  return (
    <footer className="bg-[#0B3D3A] text-[#FAF8F3]/80 mt-0">
      <div className="tricolor-divider w-full" />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-[#E98A15] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 40 40" width="20" height="20" fill="none" aria-hidden="true">
                  <path d="M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z" fill="#F5A832" />
                  <path d="M20 12 L26 18 L20 24 L14 18 Z" fill="#FAF8F3" />
                </svg>
              </div>
              <span className="font-bold text-[#FAF8F3]">UdyamSetu AI</span>
            </div>
            <p className="text-sm text-[#FAF8F3]/60 leading-relaxed">
              Evidence-backed business intelligence for rural and semi-urban entrepreneurs across India.
            </p>
            <p className="text-xs text-[#FAF8F3]/40 mt-3">
              উদ্যমসেতু AI — গ্রামীণ উদ্যোক্তাদের জন্য
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#FAF8F3] font-semibold text-sm mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Home' },
                { href: '/assessment-wizard', label: 'Start Assessment' },
                { href: '/schemes', label: 'Schemes' },
                { href: '/feasibility-report', label: 'Sample Report' },
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/settings', label: 'Profile & Settings' },
                { href: '/admin', label: 'Admin Panel' },
              ].map((l) => (
                <li key={`footer-${l.href}`}>
                  <Link
                    href={l.href}
                    className="text-[#FAF8F3]/60 hover:text-[#E98A15] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-[#FAF8F3] font-semibold text-sm mb-4 uppercase tracking-wider">
              Data Sources
            </h3>
            <ul className="space-y-2 text-sm text-[#FAF8F3]/60">
              {[
                'Census of India',
                'UDYAM Registry',
                'AGMARKNET (Mandi Prices)',
                'Livestock Census',
                'PMGSY Road Network',
                'LGD Location Database',
              ].map((s) => (
                <li key={`data-${s}`}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[#FAF8F3] font-semibold text-sm mb-4 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              {['Privacy Policy', 'Terms of Use', 'Disclaimer', 'Contact Us'].map((l) => (
                <li key={`legal-${l}`}>
                  <a href="#" className="text-[#FAF8F3]/60 hover:text-[#E98A15] transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-[#0F5450]/50">
              <p className="text-xs text-[#FAF8F3]/50 mb-1">Language / ভাষা</p>
              <div className="flex gap-2 text-xs">
                <span className="text-[#E98A15] font-medium">English</span>
                <span className="text-[#FAF8F3]/30">|</span>
                <span className="text-[#FAF8F3]/60">বাংলা</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#0F5450]/40 pt-6">
          <p className="text-xs text-[#FAF8F3]/50 leading-relaxed max-w-3xl">
            <strong className="text-[#FAF8F3]/70">Disclaimer:</strong> This is an independent
            platform and not an official Government of India website. All feasibility assessments are
            advisory in nature and should be validated with local authorities, financial institutions,
            and qualified advisors before making investment decisions.
          </p>
          <p className="text-xs text-[#FAF8F3]/40 mt-3">
            © 2026 UdyamSetu AI · Built with official Indian public datasets · Version 2.0
          </p>
        </div>
      </div>
    </footer>
  );
}
import React from 'react';
import Link from 'next/link';


export default function GovFooter() {
  return (
    <footer className="bg-teal-900 text-primary-foreground/80 mt-0">
      <div className="tricolor-divider w-full" />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-saffron flex items-center justify-center">
                <svg viewBox="0 0 40 40" width="20" height="20" fill="none">
                  <path d="M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z" fill="var(--accent-saffron-light)" />
                  <path d="M20 12 L26 18 L20 24 L14 18 Z" fill="var(--paper)" />
                </svg>
              </div>
              <span className="font-bold text-primary-foreground">UdyamSetu AI</span>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Evidence-backed business intelligence for rural and semi-urban entrepreneurs across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-primary-foreground font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Home' },
                { href: '/assessment-wizard', label: 'Start Assessment' },
                { href: '/schemes', label: 'Schemes' },
                { href: '/feasibility-report', label: 'Sample Report' },
              ]?.map((l) => (
                <li key={`footer-${l?.href}`}>
                  <Link href={l?.href} className="text-primary-foreground/60 hover:text-saffron transition-colors">
                    {l?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-primary-foreground font-semibold text-sm mb-4 uppercase tracking-wider">Data Sources</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              {['Census of India', 'UDYAM Registry', 'AGMARKNET (Mandi Prices)', 'Livestock Census', 'PMGSY Road Network', 'LGD Location Database']?.map((s) => (
                <li key={`data-${s}`}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Legal & Language */}
          <div>
            <h3 className="text-primary-foreground font-semibold text-sm mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              {['Privacy Policy', 'Terms of Use', 'Disclaimer', 'Contact Us']?.map((l) => (
                <li key={`legal-${l}`}>
                  <a href="#" className="text-primary-foreground/60 hover:text-saffron transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-teal-700/40 pt-6">
          <p className="text-xs text-primary-foreground/50 leading-relaxed max-w-3xl">
            <strong className="text-primary-foreground/70">Disclaimer:</strong> This is an independent platform and not an official Government of India website. All feasibility assessments are advisory in nature and should be validated with local authorities, financial institutions, and qualified advisors before making investment decisions. Financial eligibility is determined by backend rule engines using official scheme guidelines — not by AI inference.
          </p>
          <p className="text-xs text-primary-foreground/40 mt-3">
            © 2026 UdyamSetu AI · Built with official Indian public datasets · Version 2.0
          </p>
        </div>
      </div>
    </footer>
  );
}
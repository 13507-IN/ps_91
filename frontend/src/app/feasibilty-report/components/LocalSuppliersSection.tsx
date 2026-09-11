import React from 'react';
import type { SupplierItem } from '@/types';
import { Package, MapPin, Truck, Store, ShieldCheck } from 'lucide-react';

interface LocalSuppliersSectionProps {
  suppliers?: SupplierItem[];
  category?: string;
}

export function LocalSuppliersSection({ suppliers = [], category }: LocalSuppliersSectionProps) {
  const hasSuppliers = suppliers && suppliers.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-gov-sm border border-border overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-paper-dark flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-teal-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            Local Raw Material Suppliers & Sourcing
          </h2>
          <p className="text-ink-muted text-sm mt-1">
            Verified local suppliers and raw material Mandi hubs near your location.
          </p>
        </div>
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          {hasSuppliers ? `${suppliers.length} Sourcing Options` : 'Recommended Sourcing Hubs'}
        </div>
      </div>

      <div className="p-6">
        {hasSuppliers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="border border-border rounded-xl p-4 hover:border-teal-400 hover:shadow-gov-sm transition-all bg-paper flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-teal-900 text-sm truncate" title={supplier.name || 'Local Supplier'}>
                      {supplier.name || 'Local Raw Material Supplier'}
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md whitespace-nowrap border border-amber-200">
                      {supplier.scale || 'MICRO'}
                    </span>
                  </div>

                  <div className="text-xs text-ink-muted mb-3 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="capitalize">{supplier.category?.replace(/_/g, ' ').toLowerCase()}</span>
                    {supplier.subcategory && (
                      <span className="truncate text-teal-900 font-medium"> • {supplier.subcategory}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <div className="flex items-center text-teal-800 font-semibold bg-teal-50 px-2 py-1 rounded border border-teal-200/50">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    {supplier.distance > 0 ? `~${Math.round(supplier.distance * 10) / 10} km away` : 'In your village'}
                  </div>
                  <span className="text-[11px] text-ink-subtle font-medium flex items-center gap-0.5">
                    <Store className="w-3 h-3 text-saffron" /> Direct Trade
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-paper-dark border border-teal-900/10 rounded-xl p-5 text-sm">
            <h3 className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
              <Store className="w-4 h-4 text-teal-600" />
              Sourcing Raw Materials for {category?.replace(/_/g, ' ') || 'Your Business'}
            </h3>
            <p className="text-ink-muted text-xs mb-3">
              We recommend sourcing directly from Gram Panchayat weekly haats, local APMC Mandis, or registered producer co-operatives to lock in lower wholesale prices.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-border">
                <strong className="text-teal-900 block mb-1">1. Direct Mandi Sourcing</strong>
                <span className="text-ink-muted">Visit nearest Gram Panchayat Hat on market day for bulk price discounts.</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-border">
                <strong className="text-teal-900 block mb-1">2. Supplier Contracts</strong>
                <span className="text-ink-muted">Negotiate 30-day price locks with 2 local suppliers to mitigate input price inflation.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


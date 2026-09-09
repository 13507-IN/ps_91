import React from 'react';
import type { SupplierItem } from '@/types';
import { Package, MapPin, Truck } from 'lucide-react';

interface LocalSuppliersSectionProps {
  suppliers: SupplierItem[];
}

export function LocalSuppliersSection({ suppliers }: LocalSuppliersSectionProps) {
  if (!suppliers || suppliers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-gov-sm border border-border overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-paper-dark flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-teal-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            Local Raw Material Suppliers
          </h2>
          <p className="text-ink-muted text-sm mt-1">
            Potential suppliers nearby based on your business category.
          </p>
        </div>
        <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          {suppliers.length} Found
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="border border-border rounded-lg p-4 hover:border-teal-300 transition-colors bg-paper"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-ink truncate mr-2" title={supplier.name || 'Local Supplier'}>
                  {supplier.name || 'Local Supplier'}
                </h3>
                <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded-md whitespace-nowrap">
                  {supplier.scale || 'MICRO'}
                </span>
              </div>
              <div className="text-sm text-ink-muted mb-3 flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span className="capitalize">{supplier.category.replace(/_/g, ' ').toLowerCase()}</span>
                {supplier.subcategory && (
                  <span className="truncate"> • {supplier.subcategory}</span>
                )}
              </div>
              <div className="flex items-center text-sm font-medium text-teal-700 mt-2 bg-teal-50 px-2 py-1.5 rounded w-fit">
                <MapPin className="w-4 h-4 mr-1" />
                {supplier.distance > 0 ? `~${Math.round(supplier.distance)} km away` : 'In your village'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

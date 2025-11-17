'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { X } from 'lucide-react';

interface FilterBarProps {
  onFiltersChange?: (filters: Record<string, any>) => void;
}

export function FilterBar({ onFiltersChange }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    platforms: searchParams.get('platforms')?.split(',') || [],
    regions: searchParams.get('regions')?.split(',') || [],
    states: searchParams.get('states')?.split(',') || [],
    churnRisk: searchParams.get('churnRisk')?.split(',') || [],
    overallSentiment: searchParams.get('overallSentiment')?.split(',') || [],
    primaryCategories: searchParams.get('primaryCategories')?.split(',') || [],
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (value && !Array.isArray(value)) {
        params.set(key, value);
      }
    });
    router.replace(`?${params.toString()}`, { scroll: false });
    onFiltersChange?.(filters);
  }, [filters, router, onFiltersChange]);

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      platforms: [],
      regions: [],
      states: [],
      churnRisk: [],
      overallSentiment: [],
      primaryCategories: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => 
    Array.isArray(v) ? v.length > 0 : v !== ''
  );

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Churn Risk
            </label>
            <select
              multiple
              value={filters.churnRisk}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
                updateFilter('churnRisk', values);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sentiment
            </label>
            <select
              multiple
              value={filters.overallSentiment}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
                updateFilter('overallSentiment', values);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="very_negative">Very Negative</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
              <option value="positive">Positive</option>
              <option value="very_positive">Very Positive</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { X } from 'lucide-react';

export function FilterBar() {
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
  }, [filters, router]);

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
    <Card className="mb-6 overflow-visible relative z-50">
      <CardContent className="p-4 overflow-visible">
        <div className="flex items-center justify-end mb-4">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-accent-blue hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-visible">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-white mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md text-sm text-gray-900 dark:text-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-white mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md text-sm text-gray-900 dark:text-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <MultiSelect
            label="Churn Risk"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
            value={filters.churnRisk}
            onChange={(value) => updateFilter('churnRisk', value)}
            placeholder="Select risk levels..."
          />
          <MultiSelect
            label="Sentiment"
            options={[
              { value: 'very_negative', label: 'Very Negative' },
              { value: 'negative', label: 'Negative' },
              { value: 'neutral', label: 'Neutral' },
              { value: 'positive', label: 'Positive' },
              { value: 'very_positive', label: 'Very Positive' },
            ]}
            value={filters.overallSentiment}
            onChange={(value) => updateFilter('overallSentiment', value)}
            placeholder="Select sentiments..."
          />
        </div>
      </CardContent>
    </Card>
  );
}


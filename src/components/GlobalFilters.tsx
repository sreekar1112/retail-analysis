import React from 'react';
import { FilterState } from '../types';
import { RotateCcw, Filter, Calendar, LayoutGrid } from 'lucide-react';
import { CATEGORY_HIERARCHY } from '../data/datasets';

interface GlobalFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  availableCategories: string[];
  recordsCount: number;
}

export const GlobalFilters: React.FC<GlobalFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableCategories,
  recordsCount,
}) => {
  const years = ['All', '2025', '2024', '2023', '2022'];
  const quarters = ['All', 'Q1', 'Q2', 'Q3', 'Q4'];

  // Available subcategories based on chosen category
  const availableSubcategories = React.useMemo(() => {
    if (filters.category === 'All') {
      const allSubs = Array.from(new Set(CATEGORY_HIERARCHY.map(h => h.subcategory)));
      return ['All', ...allSubs];
    }
    const filteredSubs = CATEGORY_HIERARCHY
      .filter(h => h.category === filters.category)
      .map(h => h.subcategory);
    return ['All', ...filteredSubs];
  }, [filters.category]);

  const handleCategoryChange = (newCat: string) => {
    onFilterChange({
      ...filters,
      category: newCat,
      subcategory: 'All', // Reset subcategory when category changes
    });
  };

  const isFiltered = filters.year !== '2025' || filters.quarter !== 'All' || filters.category !== 'All' || filters.subcategory !== 'All';

  return (
    <div className="bg-slate-50/90 border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          <div className="flex items-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Global Scope:
          </div>

          {/* Year selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-slate-400" />
              Year:
            </span>
            <select
              value={filters.year}
              onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md px-2.5 py-1.5 font-medium shadow-2xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y}>{y === 'All' ? 'All Years (2022-2025)' : y}</option>
              ))}
            </select>
          </div>

          {/* Quarter selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium">Quarter:</span>
            <select
              value={filters.quarter}
              onChange={(e) => onFilterChange({ ...filters, quarter: e.target.value })}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md px-2.5 py-1.5 font-medium shadow-2xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            >
              {quarters.map(q => (
                <option key={q} value={q}>{q === 'All' ? 'Full Year (All Qtrs)' : q}</option>
              ))}
            </select>
          </div>

          {/* Category selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium flex items-center">
              <LayoutGrid className="w-3 h-3 mr-1 text-slate-400" />
              Category:
            </span>
            <select
              value={filters.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md px-2.5 py-1.5 font-medium shadow-2xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer max-w-[150px] sm:max-w-none truncate"
            >
              <option value="All">All Categories (6 Departments)</option>
              {availableCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Subcategory selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium">Subcategory:</span>
            <select
              value={filters.subcategory}
              onChange={(e) => onFilterChange({ ...filters, subcategory: e.target.value })}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md px-2.5 py-1.5 font-medium shadow-2xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer max-w-[150px] sm:max-w-none truncate"
            >
              <option value="All">All Subcategories</option>
              {availableSubcategories.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-md bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 transition cursor-pointer shadow-2xs"
              title="Reset all filters to default Demo Scenario (Year 2025, All Categories, All Quarters)"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Record count indicator */}
        <div className="text-xs text-slate-500 flex items-center shrink-0">
          <span className="font-semibold text-slate-700 mr-1">{recordsCount}</span> active line items aggregated
        </div>

      </div>
    </div>
  );
};

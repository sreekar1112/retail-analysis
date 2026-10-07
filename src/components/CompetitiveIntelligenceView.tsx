import React, { useState } from 'react';
import { 
  KpiSummary, 
  CategoryMetric, 
  CompanyPerformanceItem, 
  FilterState 
} from '../types';
import { COMPANY_PERFORMANCE } from '../data/datasets';
import { 
  Building2, 
  Store, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Info, 
  ShieldAlert, 
  CheckCircle2, 
  Eye, 
  AlertTriangle,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface CompetitiveIntelligenceProps {
  kpis: KpiSummary;
  categoryMetrics: CategoryMetric[];
  filters: FilterState;
  onSelectCategory: (categoryName: string) => void;
  onResetFilters: () => void;
}

export const CompetitiveIntelligenceView: React.FC<CompetitiveIntelligenceProps> = ({
  kpis,
  categoryMetrics,
  filters,
  onSelectCategory,
  onResetFilters,
}) => {
  // Sort states for category competitive table
  type SortField = 'category' | 'lowesSales' | 'homeDepotSales' | 'marketSales' | 'lowesGrowth' | 'marketGrowth' | 'lowesMarketShare' | 'homeDepotMarketShare' | 'shareChange' | 'status';
  const [sortField, setSortField] = useState<SortField>('lowesSales');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Selected year for company_performance_v2.csv KPIs
  const activeYearNum = filters.year !== 'All' ? parseInt(filters.year, 10) : 2025;
  
  const lowesCompanyData = COMPANY_PERFORMANCE.find(c => c.company === "Lowe's" && c.year === activeYearNum) || COMPANY_PERFORMANCE[3];
  const hdCompanyData = COMPANY_PERFORMANCE.find(c => c.company === "Home Depot" && c.year === activeYearNum) || COMPANY_PERFORMANCE[7];

  // Annual company performance trend (2022 - 2025)
  const annualCompanyComparison = [2022, 2023, 2024, 2025].map(yr => {
    const lowes = COMPANY_PERFORMANCE.find(c => c.company === "Lowe's" && c.year === yr);
    const hd = COMPANY_PERFORMANCE.find(c => c.company === "Home Depot" && c.year === yr);
    return {
      year: yr.toString(),
      lowesRev: lowes ? lowes.revenueMillionUSD : 0,
      hdRev: hd ? hd.revenueMillionUSD : 0,
      lowesGrowth: lowes ? lowes.comparableSalesGrowthPct : 0,
      hdGrowth: hd ? hd.comparableSalesGrowthPct : 0,
      lowesStores: lowes ? lowes.storeCount : 0,
      hdStores: hd ? hd.storeCount : 0,
    };
  });

  // Table sorting logic
  const sortedCategories = React.useMemo(() => {
    return [...categoryMetrics].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === null || valA === undefined) valA = -999999;
      if (valB === null || valB === undefined) valB = -999999;

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [categoryMetrics, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Competitive Strength':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Competitive Strength
          </span>
        );
      case 'Potential Share Risk':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Potential Share Risk
          </span>
        );
      case 'Declining Category':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Declining Category
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Eye className="w-3 h-3 mr-1" />
            Watch
          </span>
        );
    }
  };

  const isEmpty = categoryMetrics.length === 0;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Competitive Intelligence: Lowe's vs Home Depot
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Enterprise company-level performance comparison (10-K reported figures) and category market share dynamics
        </p>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Competitive Records Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            No line items were found for current filter selection. Reset filters to view all departmental competitive metrics.
          </p>
          <button
            onClick={onResetFilters}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-600 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Competitor KPI Cards (Using company_performance_v2.csv) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            
            {/* Lowe's Revenue */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs bg-gradient-to-br from-white to-blue-50/20">
              <div className="text-xs font-semibold uppercase text-blue-900 tracking-wider mb-1 flex items-center justify-between">
                <span>Lowe's Revenue ({activeYearNum})</span>
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-950 tracking-tight">
                ${(lowesCompanyData.revenueMillionUSD / 1000).toFixed(1)}B
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span>${lowesCompanyData.revenueMillionUSD.toLocaleString()}M reported (10-K)</span>
              </div>
            </div>

            {/* Home Depot Revenue */}
            <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-2xs bg-gradient-to-br from-white to-orange-50/20">
              <div className="text-xs font-semibold uppercase text-orange-900 tracking-wider mb-1 flex items-center justify-between">
                <span>Home Depot Revenue ({activeYearNum})</span>
                <Building2 className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-950 tracking-tight">
                ${(hdCompanyData.revenueMillionUSD / 1000).toFixed(1)}B
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span>${hdCompanyData.revenueMillionUSD.toLocaleString()}M reported (10-K)</span>
              </div>
            </div>

            {/* Lowe's Growth */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs font-semibold uppercase text-slate-600 tracking-wider mb-1 flex items-center justify-between">
                <span>Lowe's Comp Growth</span>
                {lowesCompanyData.comparableSalesGrowthPct >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                )}
              </div>
              <div className="text-2xl font-bold tracking-tight">
                <span className={lowesCompanyData.comparableSalesGrowthPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {lowesCompanyData.comparableSalesGrowthPct >= 0 ? '+' : ''}{lowesCompanyData.comparableSalesGrowthPct.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span>Comparable Sales Growth</span>
              </div>
            </div>

            {/* Home Depot Growth */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs font-semibold uppercase text-slate-600 tracking-wider mb-1 flex items-center justify-between">
                <span>Home Depot Comp Growth</span>
                {hdCompanyData.comparableSalesGrowthPct >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                )}
              </div>
              <div className="text-2xl font-bold tracking-tight">
                <span className={hdCompanyData.comparableSalesGrowthPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {hdCompanyData.comparableSalesGrowthPct >= 0 ? '+' : ''}{hdCompanyData.comparableSalesGrowthPct.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span>Comparable Sales Growth</span>
              </div>
            </div>

            {/* Lowe's Market Share */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs">
              <div className="text-xs font-semibold uppercase text-blue-900 tracking-wider mb-1">
                <span>Lowe's Cat Share</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 tracking-tight">
                {kpis.lowesMarketShare.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span>${kpis.lowesSales.toLocaleString(undefined, { maximumFractionDigits: 1 })}M sales</span>
              </div>
            </div>

            {/* Home Depot Market Share */}
            <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-2xs">
              <div className="text-xs font-semibold uppercase text-orange-900 tracking-wider mb-1">
                <span>Home Depot Cat Share</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 tracking-tight">
                {kpis.homeDepotMarketShare.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span>Lead: {(kpis.homeDepotMarketShare - kpis.lowesMarketShare).toFixed(2)} pts</span>
              </div>
            </div>

          </div>

          {/* Row of Company-Level Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CHART: Revenue Trend */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">Total Company Revenue Trend ($M)</h3>
                <p className="text-xs text-slate-500">
                  Lowe's vs Home Depot Annual Enterprise Revenue (2022–2025)
                </p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={annualCompanyComparison} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}B`} tickLine={false} />
                    <Tooltip 
                      formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}M`, name === 'lowesRev' ? "Lowe's" : "Home Depot"]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="hdRev" name="Home Depot Revenue" stroke="#ea580c" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="lowesRev" name="Lowe's Revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Store Base ({activeYearNum}): Lowe's: {lowesCompanyData.storeCount.toLocaleString()} stores</span>
                <span>Home Depot: {hdCompanyData.storeCount.toLocaleString()} stores</span>
              </div>
            </div>

            {/* CHART: Growth Comparison */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">Comparable Sales Growth Comparison (%)</h3>
                <p className="text-xs text-slate-500">
                  Annual Comparable Store Sales Growth YoY (2022–2025)
                </p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={annualCompanyComparison} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}%`} tickLine={false} />
                    <Tooltip 
                      formatter={(val: any, name: any) => [`${val}%`, name === 'lowesGrowth' ? "Lowe's Comp Growth" : "Home Depot Comp Growth"]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="lowesGrowth" name="Lowe's Comp Sales Growth" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hdGrowth" name="Home Depot Comp Sales Growth" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Source: Public company 10-K filings &amp; portfolio synthesis dataset.</span>
              </div>
            </div>

          </div>

          {/* Transparent Competitive Position Classification Rules */}
          <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-200/80">
            <div className="flex items-center space-x-2 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Info className="w-4 h-4 text-blue-700" />
              <span>Competitive Position Classification Logic (Deterministic Business Rules)</span>
            </div>
            <p className="text-xs text-blue-950 mb-3">
              Classification uses explicit mathematical rules with unambiguous precedence:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                <span className="font-semibold text-slate-800 block">1. Declining Category</span>
                <span className="text-slate-600">IF Market Growth &lt; 0% AND Lowe's Growth &lt; 0%</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                <span className="font-semibold text-emerald-800 block">2. Competitive Strength</span>
                <span className="text-slate-600">IF Lowe's YoY Growth &gt; Market Growth (+0.1% threshold)</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                <span className="font-semibold text-rose-800 block">3. Potential Share Risk</span>
                <span className="text-slate-600">IF Market Growth &gt; Lowe's YoY Growth (+0.1% threshold)</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                <span className="font-semibold text-amber-800 block">4. Watch</span>
                <span className="text-slate-600">Growth differential within ±0.1% or baseline period without prior data</span>
              </div>
            </div>
          </div>

          {/* CATEGORY COMPETITIVE TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Competitive Benchmarking Table</h3>
                <p className="text-xs text-slate-500">
                  Sortable comparison across all departments with growth rates and share change metrics.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {sortedCategories.length} categories evaluated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-700">
                  <tr>
                    <th 
                      onClick={() => handleSort('category')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Category</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('lowesSales')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Lowe's Sales ($M)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('homeDepotSales')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Home Depot Sales ($M)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('marketSales')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Market Sales ($M)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('lowesGrowth')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Lowe's Growth</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('marketGrowth')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Market Growth</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('lowesMarketShare')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Lowe's Share</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('homeDepotMarketShare')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Home Depot Share</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('shareChange')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Lowe's Share Change</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-center whitespace-nowrap"
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>Performance Status</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedCategories.map((cat) => (
                    <tr 
                      key={cat.category}
                      onClick={() => onSelectCategory(cat.category)}
                      className="hover:bg-blue-50/40 cursor-pointer transition"
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {cat.category}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-blue-900 whitespace-nowrap">
                        ${cat.lowesSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-orange-900 whitespace-nowrap">
                        ${cat.homeDepotSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-700 whitespace-nowrap">
                        ${cat.marketSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold whitespace-nowrap">
                        {cat.lowesGrowth !== null ? (
                          <span className={cat.lowesGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {cat.lowesGrowth >= 0 ? '+' : ''}{cat.lowesGrowth.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold whitespace-nowrap">
                        {cat.marketGrowth !== null ? (
                          <span className={cat.marketGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {cat.marketGrowth >= 0 ? '+' : ''}{cat.marketGrowth.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-blue-800 whitespace-nowrap">
                        {cat.lowesMarketShare.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-orange-800 whitespace-nowrap">
                        {cat.homeDepotMarketShare.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold whitespace-nowrap">
                        {cat.shareChange !== null ? (
                          <span className={cat.shareChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {cat.shareChange >= 0 ? '+' : ''}{cat.shareChange.toFixed(2)} pts
                          </span>
                        ) : (
                          <span className="text-slate-400">0.00 pts</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {getStatusBadge(cat.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

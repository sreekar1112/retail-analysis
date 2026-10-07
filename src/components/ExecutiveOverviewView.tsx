import React, { useState } from 'react';
import { 
  KpiSummary, 
  CategoryMetric, 
  MarketRecord, 
  FilterState 
} from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart2, 
  ArrowUpDown, 
  AlertCircle,
  Award,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';

interface ExecutiveOverviewViewProps {
  kpis: KpiSummary;
  categoryMetrics: CategoryMetric[];
  allRecords: MarketRecord[];
  filters: FilterState;
  executiveSummary: {
    strongestCategory: string;
    weakestCategory: string;
    largestMarketCategory: string;
    biggestShareGain: string;
    biggestShareLoss: string;
  };
  onSelectCategory: (categoryName: string) => void;
  onResetFilters: () => void;
  onNavigateToDataQuality: () => void;
  cleanDataIssuesCount: number;
}

export const ExecutiveOverviewView: React.FC<ExecutiveOverviewViewProps> = ({
  kpis,
  categoryMetrics,
  allRecords,
  filters,
  executiveSummary,
  onSelectCategory,
  onResetFilters,
  onNavigateToDataQuality,
  cleanDataIssuesCount,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Format currency numbers cleanly
  const formatCurrency = (valInMillions: number) => {
    if (valInMillions >= 1000) {
      return `$${(valInMillions / 1000).toFixed(2)}B`;
    }
    return `$${valInMillions.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  };

  // Human-readable comparative period label
  const getGrowthPeriodLabel = () => {
    if (filters.year === '2022') {
      return 'Baseline Period (No 2021 comparison)';
    }
    const curYear = filters.year === 'All' ? '2025' : filters.year;
    const priYear = (parseInt(curYear, 10) - 1).toString();
    const qtrSuffix = filters.quarter !== 'All' ? ` ${filters.quarter}` : '';
    const prefix = filters.year === 'All' ? 'Latest Full Year' : 'YoY Growth';
    return `${prefix} (${curYear}${qtrSuffix} vs ${priYear}${qtrSuffix})`;
  };

  // Trend Data for Sales and Market Share
  const trendData = React.useMemo(() => {
    if (filters.year === 'All') {
      const years = [2022, 2023, 2024, 2025];
      return years.map(y => {
        const yRecs = allRecords.filter(r => {
          if (r.year !== y) return false;
          if (filters.quarter !== 'All' && r.quarter !== filters.quarter) return false;
          if (filters.category !== 'All' && r.category !== filters.category) return false;
          if (filters.subcategory !== 'All' && r.subcategory !== filters.subcategory) return false;
          return true;
        });

        const marketSales = yRecs.reduce((sum, r) => sum + r.marketSales, 0);
        const lowesSales = yRecs.reduce((sum, r) => sum + r.lowesSales, 0);
        const hdSales = yRecs.reduce((sum, r) => sum + r.homeDepotSales, 0);

        return {
          period: filters.quarter !== 'All' ? `${y} ${filters.quarter}` : y.toString(),
          marketSales: parseFloat(marketSales.toFixed(1)),
          lowesSales: parseFloat(lowesSales.toFixed(1)),
          hdSales: parseFloat(hdSales.toFixed(1)),
          lowesShare: marketSales > 0 ? parseFloat(((lowesSales / marketSales) * 100).toFixed(2)) : 0,
          hdShare: marketSales > 0 ? parseFloat(((hdSales / marketSales) * 100).toFixed(2)) : 0,
        };
      });
    } else {
      // Single Year: show Q1 - Q4 progression for the selected year
      const y = parseInt(filters.year, 10);
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      return quarters.map(q => {
        const qRecs = allRecords.filter(r => {
          if (r.year !== y || r.quarter !== q) return false;
          if (filters.category !== 'All' && r.category !== filters.category) return false;
          if (filters.subcategory !== 'All' && r.subcategory !== filters.subcategory) return false;
          return true;
        });

        const marketSales = qRecs.reduce((sum, r) => sum + r.marketSales, 0);
        const lowesSales = qRecs.reduce((sum, r) => sum + r.lowesSales, 0);
        const hdSales = qRecs.reduce((sum, r) => sum + r.homeDepotSales, 0);

        return {
          period: `${filters.year} ${q}`,
          marketSales: parseFloat(marketSales.toFixed(1)),
          lowesSales: parseFloat(lowesSales.toFixed(1)),
          hdSales: parseFloat(hdSales.toFixed(1)),
          lowesShare: marketSales > 0 ? parseFloat(((lowesSales / marketSales) * 100).toFixed(2)) : 0,
          hdShare: marketSales > 0 ? parseFloat(((hdSales / marketSales) * 100).toFixed(2)) : 0,
        };
      });
    }
  }, [allRecords, filters]);

  // Sorted Category Market Size data
  const categoryBarData = React.useMemo(() => {
    const list = categoryMetrics.map(c => ({
      name: c.category,
      sales: parseFloat(c.marketSales.toFixed(1)),
      lowesSales: parseFloat(c.lowesSales.toFixed(1)),
      hdSales: parseFloat(c.homeDepotSales.toFixed(1)),
      share: parseFloat(c.lowesMarketShare.toFixed(1)),
    }));

    list.sort((a, b) => sortOrder === 'desc' ? b.sales - a.sales : a.sales - b.sales);
    return list;
  }, [categoryMetrics, sortOrder]);

  const isEmpty = categoryMetrics.length === 0 || kpis.totalMarketSales === 0;

  return (
    <div className="space-y-6">
      
      {/* Title & Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Retail Market Intelligence Overview
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Market performance, competitive position and category trends across US Home Improvement
          </p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
          <span>Portfolio Simulation — Category-level figures are synthetic.</span>
        </div>
      </div>

      {/* Section 18 Data Integrity Warning Banner (if clean dataset has validation items) */}
      {cleanDataIssuesCount > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-amber-950">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Data Integrity Notification:</strong> {cleanDataIssuesCount} historical taxonomy/reconciliation items detected in analytical feed. Values are shown as supplied per Section 18 protocol without silent modification.
            </span>
          </div>
          <button
            onClick={onNavigateToDataQuality}
            className="inline-flex items-center font-bold text-blue-800 hover:text-blue-950 underline cursor-pointer shrink-0"
          >
            Review in Data Quality Center
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      )}

      {/* Empty State Guard */}
      {isEmpty ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Analytical Data Matches Filters</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            No line items were found for Year: {filters.year}, Quarter: {filters.quarter}, Department: {filters.category}, Subcategory: {filters.subcategory}.
          </p>
          <button
            onClick={onResetFilters}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-600 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset to Demo Scenario (2025 All Categories)
          </button>
        </div>
      ) : (
        <>
          {/* 6 Core KPI Cards (Dynamically Calculated) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            
            {/* KPI 1: Total Market Sales */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Total Market Sales</span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(kpis.totalMarketSales)}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center">
                {kpis.marketYoYGrowth !== null ? (
                  <span className={`inline-flex items-center font-medium mr-1.5 ${kpis.marketYoYGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {kpis.marketYoYGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {kpis.marketYoYGrowth >= 0 ? '+' : ''}{kpis.marketYoYGrowth.toFixed(1)}% YoY
                  </span>
                ) : (
                  <span className="text-slate-400 mr-1.5">Baseline period</span>
                )}
                <span className="text-slate-400">Total Volume</span>
              </div>
            </div>

            {/* KPI 2: Lowe's Sales */}
            <div className="bg-white p-4 rounded-xl border border-blue-200/90 shadow-2xs hover:shadow-xs transition bg-gradient-to-br from-white to-blue-50/30">
              <div className="flex items-center justify-between text-blue-900 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Lowe's Sales</span>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-950 tracking-tight">
                {formatCurrency(kpis.lowesSales)}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center">
                <span className="text-slate-600 font-medium mr-1">
                  ${kpis.lowesSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M
                </span>
                <span className="text-slate-400">USD</span>
              </div>
            </div>

            {/* KPI 3: Lowe's Market Share */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Lowe's Market Share</span>
                <PieChart className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {kpis.lowesMarketShare.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center">
                <span className="text-slate-500 font-medium">
                  Of {formatCurrency(kpis.totalMarketSales)} market
                </span>
              </div>
            </div>

            {/* KPI 4: Lowe's YoY Growth */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Lowe's YoY Growth</span>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {kpis.lowesYoYGrowth !== null ? (
                  <span className={kpis.lowesYoYGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {kpis.lowesYoYGrowth >= 0 ? '+' : ''}{kpis.lowesYoYGrowth.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-slate-400 text-lg">N/A</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 truncate" title={getGrowthPeriodLabel()}>
                <span>{getGrowthPeriodLabel()}</span>
              </div>
            </div>

            {/* KPI 5: Home Depot Market Share */}
            <div className="bg-white p-4 rounded-xl border border-orange-200/80 shadow-2xs hover:shadow-xs transition bg-gradient-to-br from-white to-orange-50/20">
              <div className="flex items-center justify-between text-orange-900 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Home Depot Share</span>
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-950 tracking-tight">
                {kpis.homeDepotMarketShare.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span>${kpis.homeDepotSales.toLocaleString(undefined, { maximumFractionDigits: 1 })}M sales</span>
              </div>
            </div>

            {/* KPI 6: Market Share Change */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Share Change</span>
                <BarChart2 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {kpis.marketShareChange !== null ? (
                  <span className={kpis.marketShareChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {kpis.marketShareChange >= 0 ? '+' : ''}{kpis.marketShareChange.toFixed(2)} pts
                  </span>
                ) : (
                  <span className="text-slate-400 text-lg">0.00 pts</span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span>Net Lowe's share drift</span>
              </div>
            </div>

          </div>

          {/* Executive Summary Card (Data-Derived Insights) */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Executive Intelligence Briefing (Calculated Directly from Dataset)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
                <span className="text-xs text-slate-400 block font-medium">Largest Category</span>
                <span className="text-sm font-semibold text-slate-100 mt-1 block">
                  {executiveSummary.largestMarketCategory}
                </span>
              </div>

              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
                <span className="text-xs text-emerald-400 block font-medium">Strongest Category</span>
                <span className="text-sm font-semibold text-emerald-300 mt-1 block">
                  {executiveSummary.strongestCategory}
                </span>
              </div>

              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
                <span className="text-xs text-rose-400 block font-medium">Weakest Category</span>
                <span className="text-sm font-semibold text-rose-300 mt-1 block">
                  {executiveSummary.weakestCategory}
                </span>
              </div>

              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
                <span className="text-xs text-blue-400 block font-medium">Biggest Share Gain</span>
                <span className="text-sm font-semibold text-blue-300 mt-1 block">
                  {executiveSummary.biggestShareGain}
                </span>
              </div>

              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60">
                <span className="text-xs text-amber-400 block font-medium">Biggest Share Loss</span>
                <span className="text-sm font-semibold text-amber-300 mt-1 block">
                  {executiveSummary.biggestShareLoss}
                </span>
              </div>
            </div>
          </div>

          {/* Charts Section: Row 1 (Sales Trend & Market Share Trend) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CHART 1: Sales Trend */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sales Trend ($M)</h3>
                  <p className="text-xs text-slate-500">
                    Lowe's, Home Depot &amp; Total Market Sales ({filters.year === 'All' ? 'Annual 2022-2025' : `${filters.year} Quarters`})
                  </p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => val >= 1000 ? `$${(val/1000).toFixed(0)}B` : `$${val}M`} tickLine={false} />
                    <Tooltip 
                      formatter={(val: any, name: any) => [`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`, name === 'marketSales' ? 'Total Market' : name === 'lowesSales' ? "Lowe's" : "Home Depot"]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="marketSales" name="Total Market Sales" stroke="#475569" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="hdSales" name="Home Depot Sales" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="lowesSales" name="Lowe's Sales" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 2: Market Share Trend */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Market Share Trend (%)</h3>
                  <p className="text-xs text-slate-500">
                    Lowe's vs Home Depot Market Share trajectory over time
                  </p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val}%`} tickLine={false} />
                    <Tooltip 
                      formatter={(val: any, name: any) => [`${val}%`, name === 'lowesShare' ? "Lowe's Share" : "Home Depot Share"]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="hdShare" name="Home Depot Share (%)" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="lowesShare" name="Lowe's Share (%)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* CHART 3: Category Market Size (Horizontal Bar Chart with Sorting) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Market Size &amp; Competitor Contribution ($M)</h3>
                <p className="text-xs text-slate-500">
                  Departmental breakdown across current active filters. Click a category to drill down.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Sort Order:</span>
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-300"
                >
                  <ArrowUpDown className="w-3 h-3 mr-1 text-slate-500" />
                  {sortOrder === 'desc' ? 'Highest to Lowest' : 'Lowest to Highest'}
                </button>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={categoryBarData} 
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 90, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(val) => val >= 1000 ? `$${(val/1000).toFixed(0)}B` : `$${val}M`} tickLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#334155" 
                    fontSize={12} 
                    tickLine={false}
                    width={85}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`, name === 'lowesSales' ? "Lowe's" : name === 'hdSales' ? "Home Depot" : "Total Market"]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="lowesSales" name="Lowe's Sales" fill="#2563eb" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="hdSales" name="Home Depot Sales" fill="#f97316" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="sales" name="Total Department Market Size" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick click pill navigation to categories */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Quick Category Drilldown:</span>
              {categoryMetrics.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => onSelectCategory(cat.category)}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 transition cursor-pointer border border-slate-200"
                >
                  {cat.category} ({cat.lowesMarketShare.toFixed(1)}% share)
                </button>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

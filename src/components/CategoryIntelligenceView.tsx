import React, { useState } from 'react';
import { 
  CategoryMetric, 
  MarketRecord, 
  FilterState, 
  SubcategoryMetric 
} from '../types';
import { 
  ArrowUpDown, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  X, 
  FileCheck, 
  Search,
  Maximize2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

interface CategoryIntelligenceProps {
  categoryMetrics: CategoryMetric[];
  allRecords: MarketRecord[];
  filters: FilterState;
  selectedCategoryName: string | null;
  onSelectCategory: (name: string | null) => void;
  onResetFilters: () => void;
}

export const CategoryIntelligenceView: React.FC<CategoryIntelligenceProps> = ({
  categoryMetrics,
  allRecords,
  filters,
  selectedCategoryName,
  onSelectCategory,
  onResetFilters,
}) => {
  type SortField = 'category' | 'marketSales' | 'marketGrowth' | 'lowesSales' | 'lowesGrowth' | 'homeDepotSales' | 'lowesMarketShare' | 'shareChange' | 'status';
  const [sortField, setSortField] = useState<SortField>('marketSales');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Category Detail Object
  const selectedCategory = categoryMetrics.find(c => c.category === selectedCategoryName) || null;

  // Sorting logic
  const filteredAndSortedCategories = React.useMemo(() => {
    return categoryMetrics
      .filter(c => c.category.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (valA === null || valA === undefined) valA = -999999;
        if (valB === null || valB === undefined) valB = -999999;

        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [categoryMetrics, sortField, sortAsc, searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Scatter Plot Data points
  const scatterData = React.useMemo(() => {
    return categoryMetrics
      .filter(c => c.marketGrowth !== null && c.lowesGrowth !== null)
      .map(c => {
        const mg = parseFloat(c.marketGrowth!.toFixed(2));
        const lg = parseFloat(c.lowesGrowth!.toFixed(2));
        
        let quadrant = 'Quadrant 1: Growth Opportunity / Competitive Strength';
        if (mg >= 0 && lg < 0) {
          quadrant = 'Quadrant 2: Potential Share Risk';
        } else if (mg < 0 && lg >= 0) {
          quadrant = 'Quadrant 3: Relative Outperformance';
        } else if (mg < 0 && lg < 0) {
          quadrant = 'Quadrant 4: Watch / Declining Category';
        }

        return {
          x: mg,
          y: lg,
          z: c.marketSales,
          category: c.category,
          share: c.lowesMarketShare.toFixed(1),
          status: c.status,
          quadrant,
        };
      });
  }, [categoryMetrics]);

  // Selected category yearly & quarterly trends for drilldown
  const categoryYearlyTrend = React.useMemo(() => {
    if (!selectedCategory) return [];
    return [2022, 2023, 2024, 2025].map(yr => {
      const recs = allRecords.filter(r => r.category === selectedCategory.category && r.year === yr);
      const mSales = recs.reduce((sum, r) => sum + r.marketSales, 0);
      const lSales = recs.reduce((sum, r) => sum + r.lowesSales, 0);
      const hdSales = recs.reduce((sum, r) => sum + r.homeDepotSales, 0);
      return {
        year: yr.toString(),
        marketSales: parseFloat(mSales.toFixed(1)),
        lowesSales: parseFloat(lSales.toFixed(1)),
        hdSales: parseFloat(hdSales.toFixed(1)),
        lowesShare: mSales > 0 ? parseFloat(((lSales / mSales) * 100).toFixed(2)) : 0,
      };
    });
  }, [selectedCategory, allRecords]);

  const categoryQuarterlyTrend = React.useMemo(() => {
    if (!selectedCategory) return [];
    const yr = filters.year !== 'All' ? parseInt(filters.year, 10) : 2025;
    return ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
      const recs = allRecords.filter(r => r.category === selectedCategory.category && r.year === yr && r.quarter === q);
      const mSales = recs.reduce((sum, r) => sum + r.marketSales, 0);
      const lSales = recs.reduce((sum, r) => sum + r.lowesSales, 0);
      const hdSales = recs.reduce((sum, r) => sum + r.homeDepotSales, 0);
      return {
        quarter: `${yr} ${q}`,
        marketSales: parseFloat(mSales.toFixed(1)),
        lowesSales: parseFloat(lSales.toFixed(1)),
        hdSales: parseFloat(hdSales.toFixed(1)),
        lowesShare: mSales > 0 ? parseFloat(((lSales / mSales) * 100).toFixed(2)) : 0,
      };
    });
  }, [selectedCategory, allRecords, filters.year]);

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
      
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Category Intelligence &amp; Matrix Diagnostics
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Departmental growth diagnostics, subcategory drilldowns, and competitive quadrant positioning
        </p>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Category Records Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            No line items match active filter combination. Reset filters to view all 6 home improvement departments.
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
          {/* GROWTH VS MARKET SCATTER PLOT */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Growth vs. Market Scatter Matrix (Lowe's Growth % vs. Market Growth %)
                </h3>
                <p className="text-xs text-slate-500">
                  X-Axis: Market Growth % | Y-Axis: Lowe's Growth % | Bubble radius: Total Department Sales
                </p>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Quadrant Threshold: 0.0% YoY
              </div>
            </div>

            {/* 4 Conceptual Quadrant Guide Banners - Aligned to Prompt Section 16 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200">
                <span className="font-bold text-emerald-900 block">Quadrant 1 (Top-Right)</span>
                <span className="text-emerald-700">High Mkt / High Lowe's Growth</span>
                <span className="block text-[11px] text-emerald-800/80 mt-0.5 font-medium">Growth Opportunity / Comp Strength</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200">
                <span className="font-bold text-rose-900 block">Quadrant 2 (Bottom-Right)</span>
                <span className="text-rose-700">High Mkt / Low Lowe's Growth</span>
                <span className="block text-[11px] text-rose-800/80 mt-0.5 font-medium">Potential Share Risk</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200">
                <span className="font-bold text-blue-900 block">Quadrant 3 (Top-Left)</span>
                <span className="text-blue-700">Low Mkt / High Lowe's Growth</span>
                <span className="block text-[11px] text-blue-800/80 mt-0.5 font-medium">Relative Outperformance</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100/90 border border-slate-300">
                <span className="font-bold text-slate-900 block">Quadrant 4 (Bottom-Left)</span>
                <span className="text-slate-700">Low Mkt / Low Lowe's Growth</span>
                <span className="block text-[11px] text-slate-800/80 mt-0.5 font-medium">Watch / Declining Category</span>
              </div>
            </div>

            {scatterData.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Market Growth" 
                      unit="%" 
                      stroke="#64748b"
                      fontSize={12}
                      label={{ value: 'Market Growth YoY (%)', position: 'bottom', offset: 0, fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Lowe's Growth" 
                      unit="%" 
                      stroke="#64748b"
                      fontSize={12}
                      label={{ value: "Lowe's YoY Growth (%)", angle: -90, position: 'left', offset: 0, fontSize: 11, fill: '#64748b' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[120, 700]} name="Market Sales" />
                    <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="4 4" />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700">
                              <div className="font-bold text-sm text-blue-300 mb-1">{data.category}</div>
                              <div>Market Growth: <span className="font-semibold text-slate-100">{data.x}%</span></div>
                              <div>Lowe's Growth: <span className="font-semibold text-slate-100">{data.y}%</span></div>
                              <div>Market Sales: <span className="font-semibold text-slate-100">${Number(data.z).toLocaleString()}M</span></div>
                              <div>Lowe's Share: <span className="font-semibold text-slate-100">{data.share}%</span></div>
                              <div className="mt-1 text-[11px] text-amber-300 font-semibold">{data.quadrant}</div>
                              <div className="text-[10px] text-slate-400">Status: {data.status}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Categories" 
                      data={scatterData} 
                      fill="#2563eb"
                      onClick={(e: any) => onSelectCategory(e.category)}
                      className="cursor-pointer"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="font-bold text-slate-700 text-sm block">Baseline Period Active (No Prior Period YoY Comparison)</span>
                <p className="text-xs text-slate-500 mt-1">
                  Growth rate scatter calculations require prior-period comparative sales (e.g. 2021 is not present in dataset for 2022 baseline). Select 2023, 2024, 2025, or All Years to render the matrix.
                </p>
              </div>
            )}
          </div>

          {/* CATEGORY PERFORMANCE TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Performance Diagnostic Table</h3>
                <p className="text-xs text-slate-500">
                  Click any department row to view subcategory breakdown &amp; historical trend drilldowns
                </p>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
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
                      onClick={() => handleSort('marketSales')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Market Sales ($M)</span>
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
                      onClick={() => handleSort('lowesSales')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Lowe's Sales ($M)</span>
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
                      onClick={() => handleSort('homeDepotSales')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Home Depot Sales</span>
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
                      onClick={() => handleSort('shareChange')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Share Change</span>
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
                  {filteredAndSortedCategories.map((cat) => (
                    <tr 
                      key={cat.category}
                      onClick={() => onSelectCategory(cat.category)}
                      className={`hover:bg-blue-50/50 cursor-pointer transition ${
                        selectedCategoryName === cat.category ? 'bg-blue-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap flex items-center gap-1.5">
                        <span>{cat.category}</span>
                        <Maximize2 className="w-3 h-3 text-slate-400" />
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-800 whitespace-nowrap">
                        ${cat.marketSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
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
                      <td className="px-4 py-3.5 text-right font-bold text-blue-900 whitespace-nowrap">
                        ${cat.lowesSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
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
                      <td className="px-4 py-3.5 text-right font-semibold text-orange-900 whitespace-nowrap">
                        ${cat.homeDepotSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-blue-800 whitespace-nowrap">
                        {cat.lowesMarketShare.toFixed(2)}%
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

      {/* CATEGORY DETAIL DRILLDOWN MODAL / PANEL */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white">
                  <Layers className="w-5 h-5 text-blue-100" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedCategory.category} — Departmental Diagnostic Drilldown</h3>
                  <p className="text-xs text-slate-400">
                    Detailed multi-year trajectory, subcategory breakdown &amp; hierarchy validation
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectCategory(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Snapshot Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Department Market Size</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    ${selectedCategory.marketSales.toLocaleString(undefined, { maximumFractionDigits: 1 })}M
                  </div>
                  <span className="text-[11px] text-slate-400">Total consumer market</span>
                </div>

                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                  <span className="text-xs text-blue-800 font-medium">Lowe's Sales Volume</span>
                  <div className="text-xl font-bold text-blue-950 mt-1">
                    ${selectedCategory.lowesSales.toLocaleString(undefined, { maximumFractionDigits: 1 })}M
                  </div>
                  <span className="text-[11px] text-blue-700">Market Share: {selectedCategory.lowesMarketShare.toFixed(2)}%</span>
                </div>

                <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-200">
                  <span className="text-xs text-orange-800 font-medium">Home Depot Sales</span>
                  <div className="text-xl font-bold text-orange-950 mt-1">
                    ${selectedCategory.homeDepotSales.toLocaleString(undefined, { maximumFractionDigits: 1 })}M
                  </div>
                  <span className="text-[11px] text-orange-700">Market Share: {selectedCategory.homeDepotMarketShare.toFixed(2)}%</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Share Change / Status</span>
                  <div className="text-xl font-bold mt-1">
                    {selectedCategory.shareChange !== null ? (
                      <span className={selectedCategory.shareChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {selectedCategory.shareChange >= 0 ? '+' : ''}{selectedCategory.shareChange.toFixed(2)} pts
                      </span>
                    ) : (
                      <span className="text-slate-400">0.00 pts</span>
                    )}
                  </div>
                  <div className="mt-1">{getStatusBadge(selectedCategory.status)}</div>
                </div>
              </div>

              {/* Subcategory Analysis Table (Using category_hierarchy_v2.csv) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Subcategory Portfolio Breakdown</h4>
                    <p className="text-xs text-slate-500">
                      Disaggregated merchandise performance with category hierarchy verification
                    </p>
                  </div>
                  <div className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <FileCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Hierarchy Reference Active
                  </div>
                </div>

                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-2.5">Subcategory</th>
                      <th className="px-4 py-2.5 text-right">Market Sales ($M)</th>
                      <th className="px-4 py-2.5 text-right">Lowe's Sales ($M)</th>
                      <th className="px-4 py-2.5 text-right">Market Share</th>
                      <th className="px-4 py-2.5 text-right">Lowe's YoY Growth</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                      <th className="px-4 py-2.5 text-center">Hierarchy Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {selectedCategory.subcategories.map(sub => (
                      <tr key={sub.subcategory} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {sub.subcategory}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          ${sub.marketSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-900">
                          ${sub.lowesSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          {sub.lowesMarketShare.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {sub.growth !== null ? (
                            <span className={sub.growth >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {sub.growth >= 0 ? '+' : ''}{sub.growth.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">Baseline</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {sub.isHierarchyValid ? (
                            <span className="inline-flex items-center text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Valid Reference
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300" title={sub.hierarchyIssue}>
                              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                              Hierarchy Inconsistency
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Historical Trajectory Charts for Drilldown Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Annual Trend */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Multi-Year Sales Trajectory ($M)
                  </h4>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={categoryYearlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(1)}B` : `$${v}M`} />
                        <Tooltip 
                          formatter={(v: any, name: any) => [`$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`, name === 'lowesSales' ? "Lowe's" : name === 'hdSales' ? "Home Depot" : "Total Market"]}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="marketSales" name="Market" stroke="#64748b" strokeWidth={1.5} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="hdSales" name="Home Depot" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="lowesSales" name="Lowe's" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quarterly Trend */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Quarterly Share Progression (% Share)
                  </h4>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryQuarterlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="quarter" stroke="#64748b" fontSize={11} />
                        <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} />
                        <Tooltip 
                          formatter={(v: any) => [`${v}%`, "Lowe's Market Share"]}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="lowesShare" name="Lowe's Market Share (%)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 rounded-b-2xl border-t border-slate-200 flex justify-end">
              <button
                onClick={() => onSelectCategory(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
              >
                Close Diagnostic Drilldown
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

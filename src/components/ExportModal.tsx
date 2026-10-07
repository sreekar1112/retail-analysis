import React from 'react';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { CategoryMetric, DataQualityReport, KpiSummary, StructuredFinding, FilterState, MarketRecord } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredRecords: MarketRecord[];
  categoryMetrics: CategoryMetric[];
  currentReport: DataQualityReport;
  kpis: KpiSummary;
  deterministicRecommendations: StructuredFinding[];
  filters: FilterState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  filteredRecords,
  categoryMetrics,
  currentReport,
  kpis,
  deterministicRecommendations,
  filters,
}) => {
  if (!isOpen) return null;

  const downloadFile = (filename: string, content: string, mimeType = 'text/csv;charset=utf-8;') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export 1: Filtered Analytical Raw Records (CSV)
  const handleExportFilteredRawRecords = () => {
    const headers = [
      'Record_ID',
      'Year',
      'Quarter',
      'Category',
      'Subcategory',
      'Market_Sales_Million_USD',
      'Lowes_Sales_Million_USD',
      'HomeDepot_Sales_Million_USD',
      'Other_Competitors_Sales_Million_USD',
      'Market_Share_Lowes_Pct',
      'Market_Share_HomeDepot_Pct',
      'Data_Source',
      'Data_Status'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.id}"`,
      r.year,
      `"${r.quarter}"`,
      `"${r.category}"`,
      `"${r.subcategory}"`,
      r.marketSales.toFixed(2),
      r.lowesSales.toFixed(2),
      r.homeDepotSales.toFixed(2),
      r.otherCompetitorsSales.toFixed(2),
      r.marketShareLowes.toFixed(2),
      r.marketShareHomeDepot.toFixed(2),
      `"${r.dataSource}"`,
      `"${r.dataStatus}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(`filtered_analytical_records_${filters.year}_${filters.quarter}.csv`, csvContent);
  };

  // Export 2: Filtered Category Performance Table (CSV)
  const handleExportCategoryTable = () => {
    const headers = [
      'Category',
      'Market_Sales_Million_USD',
      'Market_Growth_YoY_Pct',
      'Lowes_Sales_Million_USD',
      'Lowes_Growth_YoY_Pct',
      'HomeDepot_Sales_Million_USD',
      'Lowes_Market_Share_Pct',
      'HomeDepot_Market_Share_Pct',
      'Lowes_Share_Change_Pts',
      'Performance_Status',
    ];

    const rows = categoryMetrics.map(c => [
      `"${c.category}"`,
      c.marketSales.toFixed(2),
      c.marketGrowth !== null ? c.marketGrowth.toFixed(2) : 'N/A',
      c.lowesSales.toFixed(2),
      c.lowesGrowth !== null ? c.lowesGrowth.toFixed(2) : 'N/A',
      c.homeDepotSales.toFixed(2),
      c.lowesMarketShare.toFixed(2),
      c.homeDepotMarketShare.toFixed(2),
      c.shareChange !== null ? c.shareChange.toFixed(2) : '0.00',
      `"${c.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(`retail_category_performance_${filters.year}_${filters.quarter}.csv`, csvContent);
  };

  // Export 3: Competitive Benchmarking Table (CSV)
  const handleExportCompetitiveTable = () => {
    const headers = [
      'Category',
      'Lowes_Sales_Million_USD',
      'HomeDepot_Sales_Million_USD',
      'Total_Market_Sales_Million_USD',
      'Lowes_YoY_Growth_Pct',
      'Market_YoY_Growth_Pct',
      'Lowes_Market_Share_Pct',
      'HomeDepot_Market_Share_Pct',
      'Share_Difference_Pts',
      'Competitive_Status',
    ];

    const rows = categoryMetrics.map(c => [
      `"${c.category}"`,
      c.lowesSales.toFixed(2),
      c.homeDepotSales.toFixed(2),
      c.marketSales.toFixed(2),
      c.lowesGrowth !== null ? c.lowesGrowth.toFixed(2) : 'N/A',
      c.marketGrowth !== null ? c.marketGrowth.toFixed(2) : 'N/A',
      c.lowesMarketShare.toFixed(2),
      c.homeDepotMarketShare.toFixed(2),
      (c.lowesMarketShare - c.homeDepotMarketShare).toFixed(2),
      `"${c.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(`retail_competitive_benchmark_${filters.year}.csv`, csvContent);
  };

  // Export 4: Data Quality Audit Log (CSV)
  const handleExportDataQualityLog = () => {
    const headers = [
      'Record_ID',
      'Issue_Type',
      'Field',
      'Current_Dirty_Value',
      'Expected_Standard_Value',
      'Severity',
      'Recommended_Remediation_Action',
    ];

    const rows = currentReport.issues.map(iss => [
      `"${iss.recordId}"`,
      `"${iss.issueType}"`,
      `"${iss.field}"`,
      `"${iss.currentValue.replace(/"/g, '""')}"`,
      `"${iss.expectedValue.replace(/"/g, '""')}"`,
      `"${iss.severity}"`,
      `"${iss.recommendedAction.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(`data_quality_audit_findings.csv`, csvContent);
  };

  // Export 5: Executive Business Briefing (Markdown / TXT)
  const handleExportExecutiveBriefing = () => {
    const reportText = `RETAIL MARKET INTELLIGENCE & COMPETITIVE INSIGHTS PLATFORM
EXECUTIVE BRIEFING REPORT
Generated: ${new Date().toLocaleDateString()} | Active Filter Scope: Year ${filters.year}, Quarter ${filters.quarter}, Category ${filters.category}
================================================================================

DISCLAIMER:
Portfolio Simulation — Category-level figures are synthetic and intended only to demonstrate an analytical workflow.

1. EXECUTIVE KPI SUMMARY:
--------------------------------------------------------------------------------
- Total Market Sales:       $${kpis.totalMarketSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M
- Lowe's Sales:             $${kpis.lowesSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M
- Lowe's Market Share:      ${kpis.lowesMarketShare.toFixed(2)}%
- Lowe's YoY Growth:        ${kpis.lowesYoYGrowth !== null ? `${kpis.lowesYoYGrowth.toFixed(2)}%` : 'N/A'}
- Home Depot Sales:         $${kpis.homeDepotSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M
- Home Depot Market Share:  ${kpis.homeDepotMarketShare.toFixed(2)}%
- Market Share Change:      ${kpis.marketShareChange !== null ? `${kpis.marketShareChange.toFixed(2)} pts` : '0.00 pts'}
- Data Quality Score:       ${currentReport.dataQualityScore}% (Validated: ${currentReport.validRecordsCount}/${currentReport.totalRecords} records)

2. DEPARTMENTAL PERFORMANCE BREAKDOWN:
--------------------------------------------------------------------------------
${categoryMetrics.map(c => `• ${c.category.padEnd(20)}: Mkt $${c.marketSales.toFixed(1)}M | Lowe's $${c.lowesSales.toFixed(1)}M (${c.lowesMarketShare.toFixed(1)}% share) | Status: ${c.status}`).join('\n')}

3. DETERMINISTIC STRATEGIC RECOMMENDATIONS:
--------------------------------------------------------------------------------
${deterministicRecommendations.map((r, i) => `
[RECOMMENDATION #${i + 1}]
OBSERVED FINDING:
${r.finding}

BUSINESS IMPLICATION:
${r.implication}

RECOMMENDED ACTION:
${r.recommendedAction}
`).join('\n')}

================================================================================
Report synthesized deterministically by Retail Market Intelligence Engine.
`;

    downloadFile(`executive_market_intelligence_briefing_${filters.year}.txt`, reportText, 'text/plain;charset=utf-8;');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 text-xs">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Download className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold">Export Analytical Intelligence</h3>
              <p className="text-xs text-slate-400">Download formatted dataset tables and executive reports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-6 space-y-3">
          
          <button
            onClick={handleExportFilteredRawRecords}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">Filtered Analytical Dataset Records (CSV)</span>
                <span className="text-[11px] text-slate-500">{filteredRecords.length} records matching current filter scope</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          <button
            onClick={handleExportCategoryTable}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">Filtered Category Performance Table (CSV)</span>
                <span className="text-[11px] text-slate-500">Includes market sales, growth, shares, and status</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          <button
            onClick={handleExportCompetitiveTable}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700 group-hover:bg-orange-600 group-hover:text-white transition">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">Competitive Benchmark Table (CSV)</span>
                <span className="text-[11px] text-slate-500">Lowe's vs Home Depot category share comparisons</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          <button
            onClick={handleExportDataQualityLog}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">Data Quality Audit Findings Log (CSV)</span>
                <span className="text-[11px] text-slate-500">{currentReport.issues.length} detected validation issues &amp; actions</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          <button
            onClick={handleExportExecutiveBriefing}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">Executive Intelligence Briefing (TXT)</span>
                <span className="text-[11px] text-slate-500">Print-friendly summary with structured recommendations</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

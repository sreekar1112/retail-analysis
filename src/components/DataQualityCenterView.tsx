import React, { useState } from 'react';
import { DataQualityReport, ValidationIssue, IssueSeverity } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  Filter, 
  Download,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface DataQualityCenterProps {
  rawAuditReport: DataQualityReport;
  cleanAuditReport: DataQualityReport;
  activeDatasetMode: 'raw' | 'clean';
  onToggleDatasetMode: (mode: 'raw' | 'clean') => void;
  onExportAuditLog: () => void;
}

export const DataQualityCenterView: React.FC<DataQualityCenterProps> = ({
  rawAuditReport,
  cleanAuditReport,
  activeDatasetMode,
  onToggleDatasetMode,
  onExportAuditLog,
}) => {
  const currentReport = activeDatasetMode === 'raw' ? rawAuditReport : cleanAuditReport;

  // Filter and search state for the issue table
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredIssues = React.useMemo(() => {
    return currentReport.issues.filter(issue => {
      if (severityFilter !== 'All' && issue.severity !== severityFilter) {
        return false;
      }
      if (issueTypeFilter !== 'All' && issue.issueType !== issueTypeFilter) {
        return false;
      }
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          issue.recordId.toLowerCase().includes(query) ||
          issue.field.toLowerCase().includes(query) ||
          issue.issueType.toLowerCase().includes(query) ||
          issue.currentValue.toLowerCase().includes(query) ||
          issue.recommendedAction.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [currentReport.issues, severityFilter, issueTypeFilter, searchTerm]);

  const getSeverityBadge = (severity: IssueSeverity) => {
    switch (severity) {
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            High Severity
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Dataset Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Quality Center &amp; Ingestion Audit Engine
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Demonstrating pre-reporting ETL validation, schema integrity checks, reconciliation auditing, and anomaly triage
          </p>
        </div>

        {/* Dataset Switcher Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 self-start md:self-auto">
          <button
            onClick={() => onToggleDatasetMode('raw')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
              activeDatasetMode === 'raw'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Raw Ingestion Feed (Messy Dataset)</span>
          </button>
          <button
            onClick={() => onToggleDatasetMode('clean')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
              activeDatasetMode === 'clean'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Clean Dataset (Post-ETL Validated)</span>
          </button>
        </div>
      </div>

      {/* Dataset Context Banner */}
      <div className={`p-4 rounded-xl border ${
        activeDatasetMode === 'raw' 
          ? 'bg-amber-50/80 border-amber-300 text-amber-950' 
          : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex items-start space-x-3">
          <Database className={`w-5 h-5 shrink-0 mt-0.5 ${
            activeDatasetMode === 'raw' ? 'text-amber-700' : 'text-emerald-700'
          }`} />
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm">
              {activeDatasetMode === 'raw' 
                ? 'Active Source: retail_market_intelligence_raw_v2.csv (Pre-Validation Ingestion Feed)'
                : 'Active Source: retail_market_intelligence_v2.csv (Production Clean Analytical Feed)'
              }
            </div>
            <p>
              {activeDatasetMode === 'raw'
                ? 'This raw feed contains deliberately simulated data anomalies (negative values, unmapped subcategories, duplicate rows, missing values, and reconciliation deviations) to verify automated ETL rule enforcement.'
                : 'All 8 deterministic rules have completed successfully. Zero validation violations or reconciliation deviations detected. 100% verified for executive briefing.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 8 QUALITY KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* Total Records */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Records</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{currentReport.totalRecords}</div>
          <span className="text-[11px] text-slate-400">Line items parsed</span>
        </div>

        {/* Validated Records */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Validated Records</span>
          <div className="text-xl font-bold text-emerald-700 mt-1">{currentReport.validRecordsCount}</div>
          <span className="text-[11px] text-emerald-600">Passed all rules</span>
        </div>

        {/* Duplicates */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Duplicates</span>
          <div className={`text-xl font-bold mt-1 ${currentReport.duplicateCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {currentReport.duplicateCount}
          </div>
          <span className="text-[11px] text-slate-400">Key collision</span>
        </div>

        {/* Missing Values */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Missing Values</span>
          <div className={`text-xl font-bold mt-1 ${currentReport.missingValueCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {currentReport.missingValueCount}
          </div>
          <span className="text-[11px] text-slate-400">Null / empty field</span>
        </div>

        {/* Invalid Values */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Invalid Values</span>
          <div className={`text-xl font-bold mt-1 ${currentReport.invalidValueCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {currentReport.invalidValueCount}
          </div>
          <span className="text-[11px] text-slate-400">Negative sales</span>
        </div>

        {/* Mapping Issues */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Mapping Issues</span>
          <div className={`text-xl font-bold mt-1 ${currentReport.mappingIssueCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {currentReport.mappingIssueCount}
          </div>
          <span className="text-[11px] text-slate-400">Hierarchy mismatch</span>
        </div>

        {/* Anomalies */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Anomalies</span>
          <div className={`text-xl font-bold mt-1 ${currentReport.anomalyCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {currentReport.anomalyCount}
          </div>
          <span className="text-[11px] text-slate-400">Reconciliation delta</span>
        </div>

        {/* Data Quality Score */}
        <div className={`p-3.5 rounded-xl border shadow-2xs ${
          currentReport.dataQualityScore >= 95
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <span className="text-[11px] font-bold uppercase tracking-wider block">DQ Score</span>
          <div className="text-xl font-bold mt-1">{currentReport.dataQualityScore}%</div>
          <span className="text-[10px] font-medium block">
            {currentReport.dataQualityScore >= 95 ? 'Audit Passed' : 'Action Required'}
          </span>
        </div>

      </div>

      {/* Data Quality Score Calculation Explainer Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>How Data Quality Score is Calculated:</span>
          </div>
          <p className="text-slate-600">
            Formula: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800 font-bold">Data Quality Score = (Valid Records / Total Records) × 100</code>.
            Each physical row that violates any of the 8 validation rules is classified as invalid until cleansed or backfilled.
          </p>
        </div>
        <button
          onClick={onExportAuditLog}
          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
          Export Audit Log (CSV)
        </button>
      </div>

      {/* 8 DETERMINISTIC VALIDATION RULES GUIDE */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Validation Rules Framework (8 Deterministic Checks)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="font-bold text-slate-900 block">Rule 1: Duplicate Detection</span>
            <span className="text-slate-600">Composite key check across Year + Quarter + Category + Subcategory.</span>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="font-bold text-slate-900 block">Rule 2: Required Fields</span>
            <span className="text-slate-600">Mandates non-empty Year, Quarter, Category, Subcat, Market, Lowe's, HD sales.</span>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="font-bold text-slate-900 block">Rule 3: Numeric Validation</span>
            <span className="text-slate-600">Enforces non-negative sales ($M ≥ 0.00). Returns or adjustments must not yield negative lines.</span>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="font-bold text-slate-900 block">Rule 4: Category Validation</span>
            <span className="text-slate-600">Verifies department exists in category_hierarchy_v2.csv taxonomy and flags leading whitespace.</span>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="font-bold text-slate-900 block">Rule 5: Subcategory Mapping</span>
            <span className="text-slate-600">Ensures subcategory belongs to correct parent department per reference table.</span>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="font-bold text-slate-900 block">Rule 6: Market Reconciliation</span>
            <span className="text-slate-600">Reconciles: Lowe's + Home Depot + Other Competitors Sales == Market Sales (±$0.05).</span>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="font-bold text-slate-900 block">Rule 7: Share Reconciliation</span>
            <span className="text-slate-600">Validates Lowe's share + Home Depot share + Other share ≈ 100.0% within rounding tolerance.</span>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="font-bold text-slate-900 block">Rule 8: Outlier Anomaly Flag</span>
            <span className="text-slate-600">Identifies abnormal multi-hundred million discrepancies without destructive auto-deletion.</span>
          </div>
        </div>
      </div>

      {/* DATA QUALITY ISSUES AUDIT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Filters & Search */}
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Audit Findings Log ({filteredIssues.length} issues identified)
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic issue taxonomy with expected values and operational remediation actions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-700 outline-none"
            >
              <option value="All">All Severities</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>

            {/* Issue Type Filter */}
            <select
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-700 outline-none"
            >
              <option value="All">All Issue Types</option>
              <option value="Duplicate Record">Duplicate Records</option>
              <option value="Missing Value">Missing Values</option>
              <option value="Invalid Negative Value">Invalid Negative Values</option>
              <option value="Category Label Inconsistency">Category Label Typo</option>
              <option value="Subcategory Mapping Inconsistency">Subcategory Mapping</option>
              <option value="Anomaly / Outlier">Anomalies / Outliers</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search audit log..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredIssues.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Record ID</th>
                  <th className="px-4 py-3 whitespace-nowrap">Issue Type</th>
                  <th className="px-4 py-3 whitespace-nowrap">Field</th>
                  <th className="px-4 py-3">Current Dirty Value</th>
                  <th className="px-4 py-3">Expected / Benchmark</th>
                  <th className="px-4 py-3 whitespace-nowrap">Severity</th>
                  <th className="px-4 py-3">Recommended Remediation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredIssues.map((issue, index) => (
                  <tr key={`${issue.recordId}-${index}`} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {issue.recordId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {issue.issueType}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                      {issue.field}
                    </td>
                    <td className="px-4 py-3 font-mono text-rose-700 font-semibold max-w-xs truncate" title={issue.currentValue}>
                      {issue.currentValue}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-800 max-w-xs truncate" title={issue.expectedValue}>
                      {issue.expectedValue}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getSeverityBadge(issue.severity)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-md">
                      {issue.recommendedAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-sm">No Quality Issues Found</div>
              <p className="text-xs text-slate-500 mt-1">
                {activeDatasetMode === 'clean'
                  ? 'All records in retail_market_intelligence_v2.csv have passed 100% of the deterministic validation checks.'
                  : 'No issues match your current severity/type filter.'}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

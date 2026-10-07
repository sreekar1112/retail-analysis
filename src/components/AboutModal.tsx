import React from 'react';
import { X, ShieldAlert, BookOpen, Calculator, CheckCircle2, AlertTriangle, Layers, Target, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 text-xs">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              <BookOpen className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <h3 className="text-lg font-bold">About &amp; Analytical Methodology</h3>
              <p className="text-xs text-slate-400">
                Market Share &amp; Competitive Intelligence Analyst Simulation Framework
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-slate-700">
          
          {/* Mandatory Disclaimer Box */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-sm text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>IMPORTANT DATA DISCLAIMER</span>
            </div>
            <p className="leading-relaxed">
              <strong>"Portfolio Simulation — Category-level data is synthetic and intended only to demonstrate an analytical workflow."</strong>
            </p>
            <p className="text-[11px] text-amber-800">
              The category-level figures are synthetic portfolio data generated for portfolio interview demonstration. They do NOT represent actual Lowe’s or Home Depot confidential market-share figures. Company-level figures (e.g. enterprise annual revenues and store counts) reflect public 10-K disclosures as supplied in the uploaded dataset.
            </p>
          </div>

          {/* Section 1: Project Purpose */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center text-blue-900">
              <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
              Purpose &amp; Analytical Scope
            </h4>
            <p className="leading-relaxed">
              This application is an enterprise portfolio simulation designed to demonstrate the complete, end-to-end analytical workflow expected of a <strong>Market Share &amp; Market Intelligence Analyst</strong> at a major US home-improvement retailer. The platform demonstrates:
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-medium text-slate-800">
              <li className="bg-slate-50 p-2 rounded border border-slate-200">1. Data Ingestion &amp; Sanitization</li>
              <li className="bg-slate-50 p-2 rounded border border-slate-200">2. Pre-Reporting Quality Auditing</li>
              <li className="bg-slate-50 p-2 rounded border border-slate-200">3. Taxonomy &amp; Hierarchy Mapping</li>
              <li className="bg-slate-50 p-2 rounded border border-slate-200">4. Market Share Calculation</li>
              <li className="bg-slate-50 p-2 rounded border border-slate-200">5. Competitor Benchmarking</li>
              <li className="bg-slate-50 p-2 rounded border border-slate-200">6. Growth Diagnostic Quadrants</li>
              <li className="bg-slate-50 p-2 rounded border border-slate-200">7. Root-Cause Hypothesis Framing</li>
              <li className="bg-slate-50 p-2 rounded border border-slate-200">8. Deterministic Recommendations</li>
              <li className="bg-slate-50 p-2 rounded border border-slate-200">9. Executive Decision Reporting</li>
            </ul>
          </div>

          {/* Section 2: Mathematical Calculations */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center text-blue-900">
              <Calculator className="w-4 h-4 mr-1.5 text-blue-600" />
              Governing Mathematical Calculations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                <span className="font-bold text-slate-900 block font-sans text-xs">Lowe's Market Share (%)</span>
                <p>(Lowe's Sales / Total Market Sales) × 100</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                <span className="font-bold text-slate-900 block font-sans text-xs">Home Depot Market Share (%)</span>
                <p>(Home Depot Sales / Total Market Sales) × 100</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                <span className="font-bold text-slate-900 block font-sans text-xs">Year-over-Year (YoY) Sales Growth (%)</span>
                <p>((Current Period Sales - Previous Period Sales) / Previous Period Sales) × 100</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                <span className="font-bold text-slate-900 block font-sans text-xs">Market Share Change (Points)</span>
                <p>Current Period Market Share - Previous Period Market Share</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1 sm:col-span-2">
                <span className="font-bold text-slate-900 block font-sans text-xs">Data Quality Score (%)</span>
                <p>(Validated Non-Violating Records / Total Ingested Records) × 100</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic mt-1">
              *All calculations use full floating-point precision internally and round strictly for presentation.
            </p>
          </div>

          {/* Section 3: Performance Status & Quadrant Logic */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center text-blue-900">
              <Target className="w-4 h-4 mr-1.5 text-blue-600" />
              Deterministic Classification &amp; Quadrant Matrix Logic
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block text-xs">Performance Status Precedence:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                  <li><strong className="text-slate-800">Declining Category:</strong> Market Growth &lt; 0% AND Lowe's Growth &lt; 0%</li>
                  <li><strong className="text-emerald-800">Competitive Strength:</strong> Lowe's YoY Growth &gt; Market Growth (+0.1% threshold)</li>
                  <li><strong className="text-rose-800">Potential Share Risk:</strong> Market Growth &gt; Lowe's YoY Growth (+0.1% threshold)</li>
                  <li><strong className="text-amber-800">Watch:</strong> In-line growth within ±0.1% or baseline period without prior data</li>
                </ol>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block text-xs">Growth Matrix Quadrants:</strong>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li><strong>Quadrant 1 (Top-Right):</strong> High Mkt / High Lowe's Growth → Growth Opportunity / Comp Strength</li>
                  <li><strong>Quadrant 2 (Bottom-Right):</strong> High Mkt / Low Lowe's Growth → Potential Share Risk</li>
                  <li><strong>Quadrant 3 (Top-Left):</strong> Low Mkt / High Lowe's Growth → Relative Outperformance</li>
                  <li><strong>Quadrant 4 (Bottom-Left):</strong> Low Mkt / Low Lowe's Growth → Watch / Declining Category</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Data Quality Rules */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center text-blue-900">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600" />
              Pre-Reporting Ingestion Validation Rules (8 Deterministic Checks)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <strong>Rule 1: Duplicate Detection:</strong> Unique composite key (Year + Qtr + Cat + Subcat).
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <strong>Rule 2: Required Fields:</strong> Mandates non-null values for all reporting dimensions.
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <strong>Rule 3: Numeric Validation:</strong> Disallows negative sales values ($M ≥ 0.00).
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <strong>Rule 4: Category Taxonomy:</strong> Verifies category existence &amp; trims whitespace.
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <strong>Rule 5: Subcategory Mapping:</strong> Validates relational hierarchy against reference table.
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <strong>Rule 6: Market Reconciliation:</strong> Lowe's + Home Depot + Other == Market Sales (±$0.05).
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <strong>Rule 7: Share Reconciliation:</strong> Company shares must sum to 100.0% within rounding tolerance.
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <strong>Rule 8: Outlier Anomaly Flag:</strong> Flags multi-hundred million discrepancies for audit without silent data deletion.
              </div>
            </div>
          </div>

          {/* Section 5: Data Sources */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900">
              Data Files Architecture
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded border border-slate-200 bg-white">
                <strong className="text-slate-900">retail_market_intelligence_v2.csv:</strong> Primary sanitized analytical dataset containing validated sales and shares across 2022–2025 across 6 core departments.
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-white">
                <strong className="text-slate-900">retail_market_intelligence_raw_v2.csv:</strong> Uncleaned ingestion feed with deliberately planted errors (duplicates, unstripped spaces, negative values, missing data, and reconciliation deviations) used to exercise the Data Quality Center.
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-white">
                <strong className="text-slate-900">category_hierarchy_v2.csv:</strong> Master reference taxonomy table used to enforce relational integrity between Category and Subcategory IDs.
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-white">
                <strong className="text-slate-900">company_performance_v2.csv:</strong> Top-line enterprise metrics (annual revenues, comparable store sales growth, and store counts).
              </div>
            </div>
          </div>

          {/* Section 6: Assumptions & Analytical Limitations */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900">
              Assumptions &amp; Methodological Limitations
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>Statistical Correlation vs Proof:</strong> Observational volume changes indicate market movements but cannot mathematically prove single-factor causality without isolated econometric experiments.</li>
              <li><strong>Constant Perimeter:</strong> Category definitions assume stable retail taxonomy across historical fiscal periods without mid-year department re-segmentation.</li>
              <li><strong>Zero Black Box AI:</strong> Core metrics, shares, growth rates, status labels, and data quality scores are calculated deterministically. AI is applied strictly as an interpretive natural-language synthesis layer.</li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 rounded-b-2xl border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-600 transition cursor-pointer"
          >
            Acknowledge &amp; Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

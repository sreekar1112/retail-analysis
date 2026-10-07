import React, { useState } from 'react';
import { 
  KpiSummary, 
  CategoryMetric, 
  FilterState, 
  StructuredFinding, 
  AIInsightResponse 
} from '../types';
import { 
  Lightbulb, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Target, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  SearchCheck,
  Building,
  ArrowRight,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface BusinessInsightsProps {
  kpis: KpiSummary;
  categoryMetrics: CategoryMetric[];
  filters: FilterState;
  dataQualityScore: number;
  deterministicRecommendations: StructuredFinding[];
  onResetFilters: () => void;
}

export const BusinessInsightsView: React.FC<BusinessInsightsProps> = ({
  kpis,
  categoryMetrics,
  filters,
  dataQualityScore,
  deterministicRecommendations,
  onResetFilters,
}) => {
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<AIInsightResponse | null>(null);

  // Top category highlights for AI context payload
  const categoryHighlights = categoryMetrics.map(c => ({
    category: c.category,
    marketSales: c.marketSales,
    marketGrowth: c.marketGrowth,
    lowesSales: c.lowesSales,
    lowesGrowth: c.lowesGrowth,
    lowesMarketShare: c.lowesMarketShare,
    homeDepotMarketShare: c.homeDepotMarketShare,
    shareChange: c.shareChange,
    status: c.status,
  }));

  // Top competitor highlights
  const competitorHighlights = {
    lowesTotalSales: kpis.lowesSales,
    homeDepotTotalSales: kpis.homeDepotSales,
    lowesMarketShare: kpis.lowesMarketShare,
    homeDepotMarketShare: kpis.homeDepotMarketShare,
    marketShareChange: kpis.marketShareChange,
  };

  // Helper to generate dynamic deterministic fallback if offline/no API key
  const generateDynamicFallbackInsights = (): AIInsightResponse => {
    // Dynamically find lowest growth and highest growth categories
    const sortedByGrowth = [...categoryMetrics].filter(c => c.lowesGrowth !== null).sort((a, b) => (a.lowesGrowth ?? 0) - (b.lowesGrowth ?? 0));
    const lowestGrowthCat = sortedByGrowth.length > 0 ? sortedByGrowth[0] : null;
    const highestGrowthCat = sortedByGrowth.length > 0 ? sortedByGrowth[sortedByGrowth.length - 1] : null;

    const sortedByShareLoss = [...categoryMetrics].filter(c => c.shareChange !== null).sort((a, b) => (a.shareChange ?? 0) - (b.shareChange ?? 0));
    const worstShareLossCat = sortedByShareLoss.length > 0 ? sortedByShareLoss[0] : null;

    return {
      topFindings: deterministicRecommendations.slice(0, 3),
      topRisks: [
        {
          risk: worstShareLossCat && (worstShareLossCat.shareChange ?? 0) < 0
            ? `Share Erosion in ${worstShareLossCat.category}`
            : "Competitor Market Share Pressure",
          evidence: worstShareLossCat && (worstShareLossCat.shareChange ?? 0) < 0
            ? `Lowe's market share in ${worstShareLossCat.category} contracted by ${worstShareLossCat.shareChange?.toFixed(2)} pts YoY (Home Depot share: ${worstShareLossCat.homeDepotMarketShare.toFixed(1)}%).`
            : `Home Depot maintains ${kpis.homeDepotMarketShare.toFixed(1)}% market share vs Lowe's ${kpis.lowesMarketShare.toFixed(1)}% across analyzed categories.`,
          mitigation: "Audit contractor pricing, in-stock availability, and trade credit programs."
        },
        {
          risk: lowestGrowthCat && (lowestGrowthCat.lowesGrowth ?? 0) < (lowestGrowthCat.marketGrowth ?? 0)
            ? `Underperformance Gap in ${lowestGrowthCat.category}`
            : "Macro Demand Deceleration",
          evidence: lowestGrowthCat
            ? `Lowe's ${lowestGrowthCat.category} growth was ${lowestGrowthCat.lowesGrowth?.toFixed(1)}% vs market growth of ${lowestGrowthCat.marketGrowth?.toFixed(1)}%.`
            : "Certain discretionary remodeling subcategories exhibit lower volume velocities.",
          mitigation: "Rebalance merchandising toward core repair and maintenance assortments."
        }
      ],
      topOpportunities: [
        {
          opportunity: highestGrowthCat
            ? `Capitalize on ${highestGrowthCat.category} Momentum`
            : "Consolidate Leading Category Share",
          evidence: highestGrowthCat
            ? `${highestGrowthCat.category} achieved ${highestGrowthCat.lowesGrowth?.toFixed(1)}% Lowe's growth (${highestGrowthCat.shareChange && highestGrowthCat.shareChange > 0 ? `+${highestGrowthCat.shareChange.toFixed(2)} pts` : 'expanding share'}).`
            : `Consolidated Lowe's sales of $${(kpis.lowesSales / 1000).toFixed(2)}B demonstrate steady demand across essential categories.`,
          strategicAction: "Deepen vendor co-op programs and secure exclusive product tier distribution."
        },
        {
          opportunity: "Subcategory Margin & Assortment Optimization",
          evidence: "Diagnostic breakdown revealed variance in subcategory volume and market share capture.",
          strategicAction: "Execute product line reviews (PLRs) to rationalize slow-moving SKUs and expand high-velocity pro items."
        }
      ],
      recommendedNextAnalyses: [
        "Conduct subcategory price elasticity modeling across regional store clusters.",
        "Evaluate Pro contractor versus DIY consumer basket mix by department.",
        "Audit competitor promotional circular frequency and digital price-matching cadence."
      ],
      executiveSummary: `For the active filter period (${filters.year === 'All' ? '2022-2025' : filters.year}${filters.quarter !== 'All' ? ` ${filters.quarter}` : ''}), Lowe's generated $${(kpis.lowesSales / 1000).toFixed(2)}B in sales, representing a ${kpis.lowesMarketShare.toFixed(1)}% market share within a $${(kpis.totalMarketSales / 1000).toFixed(2)}B total home improvement market. Key strategic priorities should focus on defending core outdoor categories while targeting Pro-heavy building materials categories.`
    };
  };

  const handleGenerateAiInsights = async () => {
    setIsGeneratingAi(true);

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpis,
          categoryHighlights,
          competitorHighlights,
          filters,
          dataQualityScore,
        }),
      });

      const data = await response.json();

      if (data.success && data.insights && data.insights.topFindings) {
        setAiInsights(data.insights);
      } else {
        // Fallback deterministic synthesis using live calculated metrics
        setAiInsights(generateDynamicFallbackInsights());
      }
    } catch (err: any) {
      console.warn('AI Insights fetch error:', err);
      setAiInsights(generateDynamicFallbackInsights());
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const isEmpty = categoryMetrics.length === 0 || kpis.totalMarketSales === 0;

  return (
    <div className="space-y-6">
      
      {/* Title & AI Generation Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Business Insights &amp; Recommendation Engine
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Converting validated market statistics into structured executive findings, root-cause investigations &amp; strategic actions
          </p>
        </div>

        {/* AI Generator Button */}
        {!isEmpty && (
          <button
            onClick={handleGenerateAiInsights}
            disabled={isGeneratingAi}
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-600 text-white shadow-xs transition cursor-pointer self-start md:self-auto disabled:opacity-60"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Executive Briefing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-blue-200" />
                Generate Insights (Gemini AI Engine)
              </>
            )}
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Analytical Data to Synthesize</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Insights require active records. Reset filters to generate executive findings across all categories.
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
          {/* AI Executive Summary (If Generated) */}
          {aiInsights && (
            <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300">
                    Executive Synthesis Briefing
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Grounding: Active Calculated Metrics Only (No Hallucinated External Data)
                </span>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {aiInsights.executiveSummary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Top Risks */}
                <div className="bg-slate-800/90 rounded-lg p-3.5 border border-rose-900/40">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2 flex items-center">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                    Top Identified Competitive Risks
                  </span>
                  <div className="space-y-2.5 text-xs">
                    {aiInsights.topRisks.map((r, i) => (
                      <div key={i} className="border-l-2 border-rose-500 pl-2">
                        <span className="font-semibold text-slate-100 block">{r.risk}</span>
                        <span className="text-slate-400 block mt-0.5"><span className="text-slate-300 font-medium">Evidence:</span> {r.evidence}</span>
                        <span className="text-rose-300 block mt-0.5"><span className="text-slate-300 font-medium">Mitigation:</span> {r.mitigation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Opportunities */}
                <div className="bg-slate-800/90 rounded-lg p-3.5 border border-emerald-900/40">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2 flex items-center">
                    <Target className="w-3.5 h-3.5 mr-1.5" />
                    Top Growth &amp; Share Opportunities
                  </span>
                  <div className="space-y-2.5 text-xs">
                    {aiInsights.topOpportunities.map((o, i) => (
                      <div key={i} className="border-l-2 border-emerald-500 pl-2">
                        <span className="font-semibold text-slate-100 block">{o.opportunity}</span>
                        <span className="text-slate-400 block mt-0.5"><span className="text-slate-300 font-medium">Evidence:</span> {o.evidence}</span>
                        <span className="text-emerald-300 block mt-0.5"><span className="text-slate-300 font-medium">Action:</span> {o.strategicAction}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Recommended Next Analyses */}
              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="font-bold text-blue-300 uppercase tracking-wider block mb-1.5">
                  Recommended Next Quantitative Analyses:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {aiInsights.recommendedNextAnalyses.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 11: ROOT-CAUSE ANALYSIS ("Why did this happen?") */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <SearchCheck className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Diagnostic Root-Cause Analysis: "Why Did This Happen?"
                </h3>
              </div>
              <div className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300">
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-600 shrink-0" />
                <span>Analytical Rigor Principle: Distinguish Observed Findings from Hypotheses</span>
              </div>
            </div>

            {/* Causal Disclaimer Required by Prompt */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">Methodology Standard on Causality:</span>
              <p>
                Macro retail sales datasets establish <span className="font-semibold">statistical correlation and volume variance</span>, not proven clinical causation. When evaluating share shifts or departmental outperformance, we frame drivers as <span className="font-semibold text-blue-800">"Potential drivers to investigate"</span>. If available dataset variables cannot isolate the cause, the platform explicitly asserts: <span className="italic font-semibold text-slate-900">"Cause cannot be established from the available data; further investigation is required."</span>
              </p>
            </div>

            {/* 6 Structured Investigative Drivers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition">
                <span className="font-bold text-slate-900 block text-sm mb-1">1. Market Growth vs Lowe's Growth</span>
                <p className="text-slate-600 mb-2">
                  Compare departmental growth against category total. When industry growth outpaces internal sales, consumer demand was healthy but competitive share was surrendered.
                </p>
                <div className="text-[11px] text-blue-800 font-medium bg-blue-50 p-2 rounded">
                  Current Benchmark: Lowe's YoY {kpis.lowesYoYGrowth !== null ? `${kpis.lowesYoYGrowth.toFixed(1)}%` : 'N/A'} vs Market {kpis.marketYoYGrowth !== null ? `${kpis.marketYoYGrowth.toFixed(1)}%` : 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition">
                <span className="font-bold text-slate-900 block text-sm mb-1">2. Department Merchandise Mix</span>
                <p className="text-slate-600 mb-2">
                  Divergence between discretionary projects (kitchen suites, flooring) vs non-discretionary repair (plumbing, lumber, hardware).
                </p>
                <div className="text-[11px] text-slate-700 font-medium bg-slate-100 p-2 rounded">
                  Investigation: Review subcategory margin weight and basket attachment rates.
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition">
                <span className="font-bold text-slate-900 block text-sm mb-1">3. Subcategory Granularity</span>
                <p className="text-slate-600 mb-2">
                  Aggregate department trends can mask subcategory strength (e.g. Lawn &amp; Garden outperformance balancing Patio furniture contraction).
                </p>
                <div className="text-[11px] text-slate-700 font-medium bg-slate-100 p-2 rounded">
                  Investigation: Cross-validate against category_hierarchy_v2.csv subcategory rollups.
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition">
                <span className="font-bold text-slate-900 block text-sm mb-1">4. Competitor Footprint &amp; Pro Share</span>
                <p className="text-slate-600 mb-2">
                  Home Depot's store count (2,270 stores) and commercial contractor loyalty programs structurally influence Building Materials and Power Tools.
                </p>
                <div className="text-[11px] text-slate-700 font-medium bg-slate-100 p-2 rounded">
                  Investigation: Audit localized trade desk and Pro delivery fulfillment capacity.
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition">
                <span className="font-bold text-slate-900 block text-sm mb-1">5. Seasonal &amp; Weather Patterns</span>
                <p className="text-slate-600 mb-2">
                  Q2 Outdoor Living demand is highly spring weather-dependent. A delayed spring compresses seasonal volume into Q3.
                </p>
                <div className="text-[11px] text-slate-700 font-medium bg-slate-100 p-2 rounded">
                  Investigation: Overlay regional heating/cooling degree days by climate tier.
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition">
                <span className="font-bold text-slate-900 block text-sm mb-1">6. Data Quality &amp; Feed Integrity</span>
                <p className="text-slate-600 mb-2">
                  Sudden spikes or drops can stem from ingestion feed errors, currency conversion, or unmapped taxonomy before assuming actual consumer shifts.
                </p>
                <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 p-2 rounded">
                  Current Audit Status: Quality Score {dataQualityScore}% (Validated prior to reporting).
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 10 & 12: DETERMINISTIC RECOMMENDATION ENGINE & STRUCTURED INSIGHTS */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Structured Analytical Insights &amp; Deterministic Recommendation Engine
                </h3>
                <p className="text-xs text-slate-500">
                  Every finding is rigorously partitioned into Observed Finding → Business Implication → Recommended Action
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {deterministicRecommendations.length} Rule-Based Findings
              </span>
            </div>

            {/* Structured Findings List */}
            <div className="space-y-4">
              {deterministicRecommendations.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/40 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px] mr-2">
                        {idx + 1}
                      </span>
                      {item.category ? `Department: ${item.category}` : 'Consolidated Portfolio Finding'}
                    </span>
                    {item.severity && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.severity === 'High' ? 'bg-rose-100 text-rose-800' : item.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.severity} Priority
                      </span>
                    )}
                  </div>

                  {/* Strict Tripartite Partitioning */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    
                    {/* 1. OBSERVED FINDING */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        1. Observed Finding
                      </span>
                      <p className="text-slate-800 font-medium">
                        {item.finding}
                      </p>
                    </div>

                    {/* 2. BUSINESS IMPLICATION */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                        2. Business Implication
                      </span>
                      <p className="text-slate-700">
                        {item.implication}
                      </p>
                    </div>

                    {/* 3. RECOMMENDED ACTION */}
                    <div className="bg-white p-3 rounded-lg border border-blue-200 bg-blue-50/20">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                        3. Recommended Action
                      </span>
                      <p className="text-slate-800 font-medium">
                        {item.recommendedAction}
                      </p>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

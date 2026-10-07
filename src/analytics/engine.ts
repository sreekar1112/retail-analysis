import { 
  MarketRecord, 
  FilterState, 
  KpiSummary, 
  CategoryMetric, 
  SubcategoryMetric, 
  PerformanceStatus, 
  ScatterPoint,
  StructuredFinding,
  StructuredRisk,
  StructuredOpportunity,
  AIInsightResponse
} from '../types';
import { CATEGORY_HIERARCHY } from '../data/datasets';

// Filter records based on active global filters
export function filterRecords(records: MarketRecord[], filters: FilterState): MarketRecord[] {
  return records.filter(rec => {
    if (filters.year !== 'All' && rec.year !== parseInt(filters.year, 10)) {
      return false;
    }
    if (filters.quarter !== 'All' && rec.quarter !== filters.quarter) {
      return false;
    }
    if (filters.category !== 'All' && rec.category !== filters.category) {
      return false;
    }
    if (filters.subcategory !== 'All' && rec.subcategory !== filters.subcategory) {
      return false;
    }
    return true;
  });
}

// Compute aggregate KPI metrics dynamically from records with strictly comparable prior-period alignment
export function calculateKpiSummary(
  allRecords: MarketRecord[], 
  currentFilteredRecords: MarketRecord[], 
  filters: FilterState
): KpiSummary {
  if (currentFilteredRecords.length === 0) {
    return {
      totalMarketSales: 0,
      lowesSales: 0,
      lowesMarketShare: 0,
      lowesYoYGrowth: null,
      homeDepotSales: 0,
      homeDepotMarketShare: 0,
      homeDepotYoYGrowth: null,
      marketShareChange: null,
      marketYoYGrowth: null,
      otherSales: 0,
      otherMarketShare: 0,
    };
  }

  // Sum current period
  const totalMarketSales = currentFilteredRecords.reduce((acc, r) => acc + r.marketSales, 0);
  const lowesSales = currentFilteredRecords.reduce((acc, r) => acc + r.lowesSales, 0);
  const homeDepotSales = currentFilteredRecords.reduce((acc, r) => acc + r.homeDepotSales, 0);
  const otherSales = currentFilteredRecords.reduce((acc, r) => acc + r.otherCompetitorsSales, 0);

  // Exact market shares
  const lowesMarketShare = totalMarketSales > 0 ? (lowesSales / totalMarketSales) * 100 : 0;
  const homeDepotMarketShare = totalMarketSales > 0 ? (homeDepotSales / totalMarketSales) * 100 : 0;
  const otherMarketShare = totalMarketSales > 0 ? (otherSales / totalMarketSales) * 100 : 0;

  // Strict Prior Period Identification:
  // When filters.year === 'All', compare the latest complete year (2025) against previous complete year (2024)
  // When filters.year !== 'All', compare selected year against (selected year - 1)
  const isMultiYear = filters.year === 'All';
  const currentCompYear = isMultiYear ? 2025 : parseInt(filters.year, 10);
  const priorCompYear = currentCompYear - 1;

  // Records for current comparable period (e.g. 2025 matching quarter/category/subcategory filters)
  const currentCompRecords = allRecords.filter(rec => {
    if (rec.year !== currentCompYear) return false;
    if (filters.quarter !== 'All' && rec.quarter !== filters.quarter) return false;
    if (filters.category !== 'All' && rec.category !== filters.category) return false;
    if (filters.subcategory !== 'All' && rec.subcategory !== filters.subcategory) return false;
    return true;
  });

  // Records for prior comparable period (e.g. 2024 matching same quarter/category/subcategory filters)
  const priorCompRecords = allRecords.filter(rec => {
    if (rec.year !== priorCompYear) return false;
    if (filters.quarter !== 'All' && rec.quarter !== filters.quarter) return false;
    if (filters.category !== 'All' && rec.category !== filters.category) return false;
    if (filters.subcategory !== 'All' && rec.subcategory !== filters.subcategory) return false;
    return true;
  });

  let lowesYoYGrowth: number | null = null;
  let homeDepotYoYGrowth: number | null = null;
  let marketYoYGrowth: number | null = null;
  let marketShareChange: number | null = null;

  if (currentCompRecords.length > 0 && priorCompRecords.length > 0) {
    const curCompMarket = currentCompRecords.reduce((acc, r) => acc + r.marketSales, 0);
    const curCompLowes = currentCompRecords.reduce((acc, r) => acc + r.lowesSales, 0);
    const curCompHomeDepot = currentCompRecords.reduce((acc, r) => acc + r.homeDepotSales, 0);

    const priCompMarket = priorCompRecords.reduce((acc, r) => acc + r.marketSales, 0);
    const priCompLowes = priorCompRecords.reduce((acc, r) => acc + r.lowesSales, 0);
    const priCompHomeDepot = priorCompRecords.reduce((acc, r) => acc + r.homeDepotSales, 0);

    if (priCompLowes > 0) {
      lowesYoYGrowth = ((curCompLowes - priCompLowes) / priCompLowes) * 100;
    }
    if (priCompHomeDepot > 0) {
      homeDepotYoYGrowth = ((curCompHomeDepot - priCompHomeDepot) / priCompHomeDepot) * 100;
    }
    if (priCompMarket > 0) {
      marketYoYGrowth = ((curCompMarket - priCompMarket) / priCompMarket) * 100;
      const curShare = curCompMarket > 0 ? (curCompLowes / curCompMarket) * 100 : 0;
      const priShare = priCompMarket > 0 ? (priCompLowes / priCompMarket) * 100 : 0;
      marketShareChange = curShare - priShare;
    }
  }

  return {
    totalMarketSales,
    lowesSales,
    lowesMarketShare,
    lowesYoYGrowth,
    homeDepotSales,
    homeDepotMarketShare,
    homeDepotYoYGrowth,
    marketShareChange,
    marketYoYGrowth,
    otherSales,
    otherMarketShare,
  };
}

// Compute deterministic performance status with clear rule precedence:
// 1. Baseline unavailable -> 'Watch'
// 2. Both Market and Lowe's negative -> 'Declining Category'
// 3. Lowe's Growth > Market Growth (+0.1% tolerance) -> 'Competitive Strength'
// 4. Market Growth > Lowe's Growth (+0.1% tolerance) -> 'Potential Share Risk'
// 5. Difference within ±0.1% -> 'Watch'
export function determinePerformanceStatus(
  lowesGrowth: number | null, 
  marketGrowth: number | null
): PerformanceStatus {
  if (lowesGrowth === null || marketGrowth === null) {
    return 'Watch';
  }

  // Precedence 1: Declining Category (Both industry sales and Lowe's sales are contracting)
  if (marketGrowth < 0 && lowesGrowth < 0) {
    return 'Declining Category';
  }

  const diff = lowesGrowth - marketGrowth;

  // Precedence 2: Competitive Strength (Lowe's growth outpaces market)
  if (diff > 0.1) {
    return 'Competitive Strength';
  }

  // Precedence 3: Potential Share Risk (Market growth outpaces Lowe's)
  if (diff < -0.1) {
    return 'Potential Share Risk';
  }

  // Precedence 4: Watch (In-line within ±0.1%)
  return 'Watch';
}

// Build category-level metrics and subcategory drilldown with strict period comparability
export function calculateCategoryMetrics(
  allRecords: MarketRecord[], 
  currentFilteredRecords: MarketRecord[], 
  filters: FilterState
): CategoryMetric[] {
  const categories = Array.from(new Set(currentFilteredRecords.map(r => r.category)));
  const validHierarchyPairs = new Set(CATEGORY_HIERARCHY.map(h => `${h.category}||${h.subcategory}`));

  const isMultiYear = filters.year === 'All';
  const currentCompYear = isMultiYear ? 2025 : parseInt(filters.year, 10);
  const priorCompYear = currentCompYear - 1;

  return categories.map(cat => {
    const catRecords = currentFilteredRecords.filter(r => r.category === cat);
    const catMarketSales = catRecords.reduce((acc, r) => acc + r.marketSales, 0);
    const catLowesSales = catRecords.reduce((acc, r) => acc + r.lowesSales, 0);
    const catHomeDepotSales = catRecords.reduce((acc, r) => acc + r.homeDepotSales, 0);

    const catLowesShare = catMarketSales > 0 ? (catLowesSales / catMarketSales) * 100 : 0;
    const catHomeDepotShare = catMarketSales > 0 ? (catHomeDepotSales / catMarketSales) * 100 : 0;

    // Comparable current period records for this category (e.g. 2025 matching active quarter filter)
    const curCatCompRecords = allRecords.filter(r => {
      if (r.category !== cat) return false;
      if (r.year !== currentCompYear) return false;
      if (filters.quarter !== 'All' && r.quarter !== filters.quarter) return false;
      if (filters.subcategory !== 'All' && r.subcategory !== filters.subcategory) return false;
      return true;
    });

    // Comparable prior period records for this category (e.g. 2024 matching same active quarter filter)
    const priCatCompRecords = allRecords.filter(r => {
      if (r.category !== cat) return false;
      if (r.year !== priorCompYear) return false;
      if (filters.quarter !== 'All' && r.quarter !== filters.quarter) return false;
      if (filters.subcategory !== 'All' && r.subcategory !== filters.subcategory) return false;
      return true;
    });

    let catMarketGrowth: number | null = null;
    let catLowesGrowth: number | null = null;
    let catHomeDepotGrowth: number | null = null;
    let shareChange: number | null = null;

    if (curCatCompRecords.length > 0 && priCatCompRecords.length > 0) {
      const curM = curCatCompRecords.reduce((acc, r) => acc + r.marketSales, 0);
      const curL = curCatCompRecords.reduce((acc, r) => acc + r.lowesSales, 0);
      const curHD = curCatCompRecords.reduce((acc, r) => acc + r.homeDepotSales, 0);

      const priM = priCatCompRecords.reduce((acc, r) => acc + r.marketSales, 0);
      const priL = priCatCompRecords.reduce((acc, r) => acc + r.lowesSales, 0);
      const priHD = priCatCompRecords.reduce((acc, r) => acc + r.homeDepotSales, 0);

      if (priM > 0) {
        catMarketGrowth = ((curM - priM) / priM) * 100;
        const curShare = curM > 0 ? (curL / curM) * 100 : 0;
        const priShare = priM > 0 ? (priL / priM) * 100 : 0;
        shareChange = curShare - priShare;
      }
      if (priL > 0) {
        catLowesGrowth = ((curL - priL) / priL) * 100;
      }
      if (priHD > 0) {
        catHomeDepotGrowth = ((curHD - priHD) / priHD) * 100;
      }
    }

    const status = determinePerformanceStatus(catLowesGrowth, catMarketGrowth);

    // Subcategories breakdown
    const subcats = Array.from(new Set(catRecords.map(r => r.subcategory)));
    const subcategoryMetrics: SubcategoryMetric[] = subcats.map(sub => {
      const subRecords = catRecords.filter(r => r.subcategory === sub);
      const subMarketSales = subRecords.reduce((acc, r) => acc + r.marketSales, 0);
      const subLowesSales = subRecords.reduce((acc, r) => acc + r.lowesSales, 0);
      const subHomeDepotSales = subRecords.reduce((acc, r) => acc + r.homeDepotSales, 0);

      const subLowesShare = subMarketSales > 0 ? (subLowesSales / subMarketSales) * 100 : 0;
      const subHomeDepotShare = subMarketSales > 0 ? (subHomeDepotSales / subMarketSales) * 100 : 0;

      const curSubComp = allRecords.filter(r => {
        if (r.category !== cat || r.subcategory !== sub) return false;
        if (r.year !== currentCompYear) return false;
        if (filters.quarter !== 'All' && r.quarter !== filters.quarter) return false;
        return true;
      });

      const priSubComp = allRecords.filter(r => {
        if (r.category !== cat || r.subcategory !== sub) return false;
        if (r.year !== priorCompYear) return false;
        if (filters.quarter !== 'All' && r.quarter !== filters.quarter) return false;
        return true;
      });

      let subGrowth: number | null = null;
      let subMarketGrowth: number | null = null;
      if (curSubComp.length > 0 && priSubComp.length > 0) {
        const curSubL = curSubComp.reduce((acc, r) => acc + r.lowesSales, 0);
        const priSubL = priSubComp.reduce((acc, r) => acc + r.lowesSales, 0);
        const curSubM = curSubComp.reduce((acc, r) => acc + r.marketSales, 0);
        const priSubM = priSubComp.reduce((acc, r) => acc + r.marketSales, 0);

        if (priSubL > 0) subGrowth = ((curSubL - priSubL) / priSubL) * 100;
        if (priSubM > 0) subMarketGrowth = ((curSubM - priSubM) / priSubM) * 100;
      }

      const isHierarchyValid = validHierarchyPairs.has(`${cat}||${sub}`);

      return {
        category: cat,
        subcategory: sub,
        marketSales: subMarketSales,
        lowesSales: subLowesSales,
        homeDepotSales: subHomeDepotSales,
        lowesMarketShare: subLowesShare,
        homeDepotMarketShare: subHomeDepotShare,
        growth: subGrowth,
        status: determinePerformanceStatus(subGrowth, subMarketGrowth),
        isHierarchyValid,
        hierarchyIssue: !isHierarchyValid ? `Subcategory "${sub}" unverified under department "${cat}" in category_hierarchy_v2.csv reference table` : undefined,
      };
    });

    return {
      category: cat,
      marketSales: catMarketSales,
      marketGrowth: catMarketGrowth,
      lowesSales: catLowesSales,
      lowesGrowth: catLowesGrowth,
      homeDepotSales: catHomeDepotSales,
      homeDepotGrowth: catHomeDepotGrowth,
      lowesMarketShare: catLowesShare,
      homeDepotMarketShare: catHomeDepotShare,
      shareChange,
      status,
      subcategories: subcategoryMetrics,
    };
  });
}

// Generate the 4-quadrant growth vs market scatter plot data
// Exactly aligned with prompt Section 16:
// Quadrant 1 (X >= 0, Y >= 0): Growth Opportunity / Competitive Strength
// Quadrant 2 (X >= 0, Y < 0): Potential Share Risk
// Quadrant 3 (X < 0, Y >= 0): Relative Outperformance
// Quadrant 4 (X < 0, Y < 0): Watch / Declining Category
export function calculateScatterPlotData(categories: CategoryMetric[]): ScatterPoint[] {
  return categories
    .filter(c => c.marketGrowth !== null && c.lowesGrowth !== null)
    .map(c => {
      const mg = c.marketGrowth!;
      const lg = c.lowesGrowth!;

      let quadrantName = '';
      if (mg >= 0 && lg >= 0) {
        quadrantName = 'Quadrant 1: Growth Opportunity / Competitive Strength (High Mkt / High Lowe\'s)';
      } else if (mg >= 0 && lg < 0) {
        quadrantName = 'Quadrant 2: Potential Share Risk (High Mkt / Low Lowe\'s)';
      } else if (mg < 0 && lg >= 0) {
        quadrantName = 'Quadrant 3: Relative Outperformance (Low Mkt / High Lowe\'s)';
      } else {
        quadrantName = 'Quadrant 4: Watch / Declining Category (Low Mkt / Low Lowe\'s)';
      }

      return {
        category: c.category,
        marketGrowth: mg,
        lowesGrowth: lg,
        marketSales: c.marketSales,
        lowesMarketShare: c.lowesMarketShare,
        status: c.status,
        quadrantName,
      };
    });
}

// Generate deterministic executive summary findings
export function generateExecutiveSummary(categoryMetrics: CategoryMetric[]) {
  if (categoryMetrics.length === 0) {
    return {
      strongestCategory: 'N/A',
      weakestCategory: 'N/A',
      largestMarketCategory: 'N/A',
      biggestShareGain: 'N/A',
      biggestShareLoss: 'N/A',
      metricsCount: 0,
    };
  }

  // Largest market size category
  const sortedBySize = [...categoryMetrics].sort((a, b) => b.marketSales - a.marketSales);
  const largestMarketCategory = sortedBySize[0];

  // Highest Lowe's growth
  const withGrowth = categoryMetrics.filter(c => c.lowesGrowth !== null);
  const sortedByGrowth = [...withGrowth].sort((a, b) => (b.lowesGrowth ?? -999) - (a.lowesGrowth ?? -999));
  const strongestCategory = sortedByGrowth.length > 0 ? sortedByGrowth[0] : null;
  const weakestCategory = sortedByGrowth.length > 0 ? sortedByGrowth[sortedByGrowth.length - 1] : null;

  // Biggest share gain and loss
  const withShareChange = categoryMetrics.filter(c => c.shareChange !== null);
  const sortedByShareChange = [...withShareChange].sort((a, b) => (b.shareChange ?? -999) - (a.shareChange ?? -999));
  const biggestShareGain = sortedByShareChange.length > 0 ? sortedByShareChange[0] : null;
  const biggestShareLoss = sortedByShareChange.length > 0 ? sortedByShareChange[sortedByShareChange.length - 1] : null;

  return {
    strongestCategory: strongestCategory ? `${strongestCategory.category} (${strongestCategory.lowesGrowth! >= 0 ? '+' : ''}${strongestCategory.lowesGrowth!.toFixed(1)}% YoY)` : 'N/A (Baseline)',
    weakestCategory: weakestCategory ? `${weakestCategory.category} (${weakestCategory.lowesGrowth! >= 0 ? '+' : ''}${weakestCategory.lowesGrowth!.toFixed(1)}% YoY)` : 'N/A (Baseline)',
    largestMarketCategory: `${largestMarketCategory.category} ($${largestMarketCategory.marketSales.toLocaleString(undefined, { maximumFractionDigits: 1 })}M)`,
    biggestShareGain: biggestShareGain && biggestShareGain.shareChange! > 0 ? `${biggestShareGain.category} (+${biggestShareGain.shareChange!.toFixed(2)} pts)` : 'None (flat/declining)',
    biggestShareLoss: biggestShareLoss && biggestShareLoss.shareChange! < 0 ? `${biggestShareLoss.category} (${biggestShareLoss.shareChange!.toFixed(2)} pts)` : 'None (gaining)',
    metricsCount: categoryMetrics.length,
  };
}

// Deterministic Recommendation Engine
export function generateDeterministicRecommendations(
  kpis: KpiSummary, 
  categories: CategoryMetric[], 
  dataQualityScore: number
): StructuredFinding[] {
  const recommendations: StructuredFinding[] = [];

  // Check Data Quality First
  if (dataQualityScore < 95.0) {
    recommendations.push({
      finding: `Data Quality Score is ${dataQualityScore.toFixed(1)}% (below standard 95% threshold). Detected unverified records and anomalies in data ingestion feed.`,
      implication: 'Analytical reporting risks skewing executive resource allocation and procurement decisions if unvalidated data is utilized.',
      recommendedAction: 'Resolve data-quality and reconciliation issues in the Data Quality Center before using reports for leadership decisions.',
      severity: 'High',
    });
  }

  // Iterate categories for deterministic business logic
  for (const cat of categories) {
    if (cat.marketGrowth !== null && cat.lowesGrowth !== null) {
      if (cat.marketGrowth > cat.lowesGrowth + 0.5) {
        recommendations.push({
          finding: `In ${cat.category}, total market grew at ${cat.marketGrowth.toFixed(1)}% while Lowe's grew at ${cat.lowesGrowth.toFixed(1)}% (underperformance gap of ${(cat.marketGrowth - cat.lowesGrowth).toFixed(1)} pts).`,
          implication: `Lowe's is ceding category share to competitors (Home Depot market share is ${cat.homeDepotMarketShare.toFixed(1)}% vs Lowe's ${cat.lowesMarketShare.toFixed(1)}%).`,
          recommendedAction: `Investigate potential competitive/share risk: Audit promotional intensity, pro contractor assortment depth, and in-stock rates across ${cat.category} subcategories.`,
          category: cat.category,
          severity: 'High',
        });
      } else if (cat.lowesGrowth > cat.marketGrowth + 0.5) {
        recommendations.push({
          finding: `In ${cat.category}, Lowe's growth (${cat.lowesGrowth.toFixed(1)}%) outpaced broader market expansion (${cat.marketGrowth.toFixed(1)}%), yielding a share change of ${cat.shareChange ? (cat.shareChange >= 0 ? `+${cat.shareChange.toFixed(2)}` : cat.shareChange.toFixed(2)) : 'N/A'} pts.`,
          implication: `Lowe's has established competitive momentum and expanded customer wallet share within ${cat.category}.`,
          recommendedAction: `Evaluate factors supporting relative outperformance: Synthesize successful vendor merchandising, private label penetration, and regional pricing to replicate in adjacent departments.`,
          category: cat.category,
          severity: 'Low',
        });
      }

      if (cat.marketGrowth < 0 && cat.lowesGrowth < 0) {
        recommendations.push({
          finding: `Both industry sales (${cat.marketGrowth.toFixed(1)}%) and Lowe's volume (${cat.lowesGrowth.toFixed(1)}%) contracted in ${cat.category}.`,
          implication: 'Macro headwinds, delayed home remodeling cycles, or sector deflation are suppressing consumer demand across the department.',
          recommendedAction: 'Protect gross margin and inventory turnover; focus marketing on maintenance/repair essentials rather than high-ticket discretionary suites.',
          category: cat.category,
          severity: 'Medium',
        });
      }
    }
  }

  // High-level share dynamic rule
  if (kpis.marketShareChange !== null && kpis.marketShareChange < 0) {
    recommendations.push({
      finding: `Consolidated market share shifted by ${kpis.marketShareChange.toFixed(2)} pts YoY.`,
      implication: 'Home Depot and regional competitors have captured incremental demand in core home-improvement categories.',
      recommendedAction: 'Conduct a deeper category and subcategory review focusing on contractor loyalty programs and competitive price elasticity.',
      severity: 'Medium',
    });
  }

  return recommendations;
}

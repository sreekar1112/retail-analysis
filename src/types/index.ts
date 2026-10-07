export type TabType = 
  | 'executive-overview'
  | 'competitive-intelligence'
  | 'category-intelligence'
  | 'data-quality-center'
  | 'business-insights';

export interface MarketRecord {
  id: string;
  year: number;
  quarter: string; // 'Q1' | 'Q2' | 'Q3' | 'Q4'
  category: string;
  subcategory: string;
  marketSales: number;
  lowesSales: number;
  homeDepotSales: number;
  otherCompetitorsSales: number;
  dataSource: string;
  dataStatus: string;
  marketShareLowes: number; // percentage (e.g. 20.8)
  marketShareHomeDepot: number; // percentage (e.g. 28.4)
}

export interface RawMarketRecord {
  recordIndex: number;
  yearRaw: string;
  quarterRaw: string;
  categoryRaw: string;
  subcategoryRaw: string;
  marketSalesRaw: string;
  lowesSalesRaw: string;
  homeDepotSalesRaw: string;
  otherCompetitorsSalesRaw: string;
  dataSourceRaw: string;
  dataStatusRaw: string;
  marketShareLowesRaw: string;
  marketShareHomeDepotRaw: string;
  rawLine: string;
}

export interface CategoryHierarchyItem {
  categoryId: string;
  category: string;
  subcategoryId: string;
  subcategory: string;
  mappingStatus: string;
  dataSource: string;
}

export interface CompanyPerformanceItem {
  year: number;
  company: "Lowe's" | "Home Depot" | string;
  revenueMillionUSD: number;
  comparableSalesGrowthPct: number;
  storeCount: number;
  dataSource: string;
  dataStatus: string;
}

export interface FilterState {
  year: string; // 'All' | '2022' | '2023' | '2024' | '2025'
  quarter: string; // 'All' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  category: string; // 'All' | category name
  subcategory: string; // 'All' | subcategory name
}

export interface KpiSummary {
  totalMarketSales: number;
  lowesSales: number;
  lowesMarketShare: number; // %
  lowesYoYGrowth: number | null; // %
  homeDepotSales: number;
  homeDepotMarketShare: number; // %
  homeDepotYoYGrowth: number | null; // %
  marketShareChange: number | null; // pts
  marketYoYGrowth: number | null; // %
  otherSales: number;
  otherMarketShare: number;
}

export type PerformanceStatus = 
  | 'Competitive Strength'
  | 'Potential Share Risk'
  | 'Declining Category'
  | 'Watch';

export interface CategoryMetric {
  category: string;
  marketSales: number;
  marketGrowth: number | null;
  lowesSales: number;
  lowesGrowth: number | null;
  homeDepotSales: number;
  homeDepotGrowth: number | null;
  lowesMarketShare: number;
  homeDepotMarketShare: number;
  shareChange: number | null;
  status: PerformanceStatus;
  subcategories: SubcategoryMetric[];
}

export interface SubcategoryMetric {
  category: string;
  subcategory: string;
  marketSales: number;
  lowesSales: number;
  homeDepotSales: number;
  lowesMarketShare: number;
  homeDepotMarketShare: number;
  growth: number | null;
  status: PerformanceStatus;
  isHierarchyValid: boolean;
  hierarchyIssue?: string;
}

export interface ScatterPoint {
  category: string;
  marketGrowth: number;
  lowesGrowth: number;
  marketSales: number;
  lowesMarketShare: number;
  status: PerformanceStatus;
  quadrantName: string;
}

export type IssueSeverity = 'High' | 'Medium' | 'Low';

export type IssueType = 
  | 'Duplicate Record'
  | 'Missing Value'
  | 'Invalid Negative Value'
  | 'Category Label Inconsistency'
  | 'Subcategory Mapping Inconsistency'
  | 'Market Reconciliation Deviation'
  | 'Share Reconciliation Deviation'
  | 'Anomaly / Outlier';

export interface ValidationIssue {
  recordId: string;
  issueType: IssueType;
  field: string;
  currentValue: string;
  expectedValue: string;
  severity: IssueSeverity;
  recommendedAction: string;
  rawRowIndex?: number;
}

export interface DataQualityReport {
  totalRecords: number;
  validRecordsCount: number;
  duplicateCount: number;
  missingValueCount: number;
  invalidValueCount: number;
  mappingIssueCount: number;
  anomalyCount: number;
  dataQualityScore: number; // percentage e.g. 94.2
  issues: ValidationIssue[];
}

export interface StructuredFinding {
  finding: string;
  implication: string;
  recommendedAction: string;
  category?: string;
  severity?: 'High' | 'Medium' | 'Low';
}

export interface StructuredRisk {
  risk: string;
  evidence: string;
  mitigation: string;
}

export interface StructuredOpportunity {
  opportunity: string;
  evidence: string;
  strategicAction: string;
}

export interface AIInsightResponse {
  topFindings: StructuredFinding[];
  topRisks: StructuredRisk[];
  topOpportunities: StructuredOpportunity[];
  recommendedNextAnalyses: string[];
  executiveSummary: string;
}

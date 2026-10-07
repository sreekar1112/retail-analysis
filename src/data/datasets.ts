import { CategoryHierarchyItem, CompanyPerformanceItem, MarketRecord } from '../types';

export const CATEGORY_HIERARCHY_CSV = `Category_ID,Category,Subcategory_ID,Subcategory,Mapping_Status,Data_Source
CAT-01,Tools,SUB-01-01,Power Tools,VALID,Synthetic portfolio dataset
CAT-01,Tools,SUB-01-02,Hand Tools,VALID,Synthetic portfolio dataset
CAT-02,Appliances,SUB-02-01,Kitchen Appliances,VALID,Synthetic portfolio dataset
CAT-02,Appliances,SUB-02-02,Laundry Appliances,VALID,Synthetic portfolio dataset
CAT-03,Outdoor,SUB-03-01,Lawn & Garden,VALID,Synthetic portfolio dataset
CAT-03,Outdoor,SUB-03-02,Outdoor Living,VALID,Synthetic portfolio dataset
CAT-04,Flooring,SUB-04-01,Hard Flooring,VALID,Synthetic portfolio dataset
CAT-04,Flooring,SUB-04-02,Carpet & Rugs,VALID,Synthetic portfolio dataset
CAT-05,Paint,SUB-05-01,Interior Paint,VALID,Synthetic portfolio dataset
CAT-05,Paint,SUB-05-02,Exterior Paint,VALID,Synthetic portfolio dataset
CAT-06,Building Materials,SUB-06-01,Lumber,VALID,Synthetic portfolio dataset
CAT-06,Building Materials,SUB-06-02,Construction Materials,VALID,Synthetic portfolio dataset`;

export const COMPANY_PERFORMANCE_CSV = `Year,Company,Revenue_Million_USD,Comparable_Sales_Growth_Pct,Store_Count,Data_Source,Data_Status
2022,Lowe's,96500,-0.7,1730,Synthetic portfolio dataset,Synthetic
2023,Lowe's,86000,-1.8,1720,Synthetic portfolio dataset,Synthetic
2024,Lowe's,83500,-1.6,1705,Synthetic portfolio dataset,Synthetic
2025,Lowe's,83700,0.2,1700,Synthetic portfolio dataset,Synthetic
2022,Home Depot,157400,4.1,2300,Synthetic portfolio dataset,Synthetic
2023,Home Depot,152700,-0.3,2280,Synthetic portfolio dataset,Synthetic
2024,Home Depot,159500,-1.0,2275,Synthetic portfolio dataset,Synthetic
2025,Home Depot,164700,3.2,2270,Synthetic portfolio dataset,Synthetic`;

export const CATEGORY_HIERARCHY: CategoryHierarchyItem[] = [
  { categoryId: 'CAT-01', category: 'Tools', subcategoryId: 'SUB-01-01', subcategory: 'Power Tools', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-01', category: 'Tools', subcategoryId: 'SUB-01-02', subcategory: 'Hand Tools', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-02', category: 'Appliances', subcategoryId: 'SUB-02-01', subcategory: 'Kitchen Appliances', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-02', category: 'Appliances', subcategoryId: 'SUB-02-02', subcategory: 'Laundry Appliances', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-03', category: 'Outdoor', subcategoryId: 'SUB-03-01', subcategory: 'Lawn & Garden', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-03', category: 'Outdoor', subcategoryId: 'SUB-03-02', subcategory: 'Outdoor Living', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-04', category: 'Flooring', subcategoryId: 'SUB-04-01', subcategory: 'Hard Flooring', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-04', category: 'Flooring', subcategoryId: 'SUB-04-02', subcategory: 'Carpet & Rugs', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-05', category: 'Paint', subcategoryId: 'SUB-05-01', subcategory: 'Interior Paint', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-05', category: 'Paint', subcategoryId: 'SUB-05-02', subcategory: 'Exterior Paint', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-06', category: 'Building Materials', subcategoryId: 'SUB-06-01', subcategory: 'Lumber', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
  { categoryId: 'CAT-06', category: 'Building Materials', subcategoryId: 'SUB-06-02', subcategory: 'Construction Materials', mappingStatus: 'VALID', dataSource: 'Synthetic portfolio dataset' },
];

export const COMPANY_PERFORMANCE: CompanyPerformanceItem[] = [
  { year: 2022, company: "Lowe's", revenueMillionUSD: 96500, comparableSalesGrowthPct: -0.7, storeCount: 1730, dataSource: 'Synthetic portfolio dataset', dataStatus: 'Synthetic' },
  { year: 2023, company: "Lowe's", revenueMillionUSD: 86000, comparableSalesGrowthPct: -1.8, storeCount: 1720, dataSource: 'Synthetic portfolio dataset', dataStatus: 'Synthetic' },
  { year: 2024, company: "Lowe's", revenueMillionUSD: 83500, comparableSalesGrowthPct: -1.6, storeCount: 1705, dataSource: 'Synthetic portfolio dataset', dataStatus: 'Synthetic' },
  { year: 2025, company: "Lowe's", revenueMillionUSD: 83700, comparableSalesGrowthPct: 0.2, storeCount: 1700, dataSource: 'Synthetic portfolio dataset', dataStatus: 'Synthetic' },
  { year: 2022, company: "Home Depot", revenueMillionUSD: 157400, comparableSalesGrowthPct: 4.1, storeCount: 2300, dataSource: 'Synthetic portfolio dataset', dataStatus: 'Synthetic' },
  { year: 2023, company: "Home Depot", revenueMillionUSD: 152700, comparableSalesGrowthPct: -0.3, storeCount: 2280, dataSource: 'Synthetic portfolio dataset', dataStatus: 'Synthetic' },
  { year: 2024, company: "Home Depot", revenueMillionUSD: 159500, comparableSalesGrowthPct: -1.0, storeCount: 2275, dataSource: 'Synthetic portfolio dataset', dataStatus: 'Synthetic' },
  { year: 2025, company: "Home Depot", revenueMillionUSD: 164700, comparableSalesGrowthPct: 3.2, storeCount: 2270, dataSource: 'Synthetic portfolio dataset', dataStatus: 'Synthetic' },
];

// Parser for Market Intelligence CSV strings
export function parseMarketCsv(csvText: string): MarketRecord[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const records: MarketRecord[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma
    const cols = line.split(',');
    if (cols.length < 12) continue;

    const year = parseInt(cols[0].trim(), 10);
    const quarter = cols[1].trim();
    const category = cols[2].trim();
    const subcategory = cols[3].trim();
    const marketSales = parseFloat(cols[4].trim()) || 0;
    const lowesSales = parseFloat(cols[5].trim()) || 0;
    const homeDepotSales = parseFloat(cols[6].trim()) || 0;
    const otherCompetitorsSales = parseFloat(cols[7].trim()) || 0;
    const dataSource = cols[8].trim();
    const dataStatus = cols[9].trim();
    const marketShareLowes = parseFloat(cols[10].trim()) || 0;
    const marketShareHomeDepot = parseFloat(cols[11].trim()) || 0;

    records.push({
      id: `REC-${i.toString().padStart(3, '0')}`,
      year,
      quarter,
      category,
      subcategory,
      marketSales,
      lowesSales,
      homeDepotSales,
      otherCompetitorsSales,
      dataSource,
      dataStatus,
      marketShareLowes,
      marketShareHomeDepot,
    });
  }

  return records;
}

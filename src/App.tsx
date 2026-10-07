/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TabType, FilterState } from './types';
import { parseMarketCsv } from './data/datasets';
import { 
  RAW_MARKET_INTELLIGENCE_CSV, 
  runDataQualityAudit 
} from './analytics/dataQualityEngine';
import { 
  filterRecords, 
  calculateKpiSummary, 
  calculateCategoryMetrics, 
  generateExecutiveSummary, 
  generateDeterministicRecommendations 
} from './analytics/engine';

// UI Components
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { GlobalFilters } from './components/GlobalFilters';
import { ExecutiveOverviewView } from './components/ExecutiveOverviewView';
import { CompetitiveIntelligenceView } from './components/CompetitiveIntelligenceView';
import { CategoryIntelligenceView } from './components/CategoryIntelligenceView';
import { DataQualityCenterView } from './components/DataQualityCenterView';
import { BusinessInsightsView } from './components/BusinessInsightsView';
import { AboutModal } from './components/AboutModal';
import { ExportModal } from './components/ExportModal';

// Clean analytical CSV dataset
import cleanCsvText from './data/retail_market_intelligence_v2.csv?raw';

export default function App() {
  // Parse clean analytical records as baseline
  const allRecords = useMemo(() => {
    return parseMarketCsv(cleanCsvText);
  }, []);

  // Pre-calculate data quality audits for both raw and clean datasets
  const rawAuditReport = useMemo(() => {
    return runDataQualityAudit(RAW_MARKET_INTELLIGENCE_CSV, false);
  }, []);

  const cleanAuditReport = useMemo(() => {
    return runDataQualityAudit(cleanCsvText, true);
  }, []);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<TabType>('executive-overview');

  // Global filters — Default Demo State: Year 2025, All Categories, All Quarters
  const [filters, setFilters] = useState<FilterState>({
    year: '2025',
    quarter: 'All',
    category: 'All',
    subcategory: 'All',
  });

  // Category drilldown state
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  // Data Quality Center dataset toggle mode ('raw' vs 'clean')
  const [activeDatasetMode, setActiveDatasetMode] = useState<'raw' | 'clean'>('raw');

  // Modals state
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Available unique categories
  const availableCategories = useMemo(() => {
    return Array.from(new Set(allRecords.map(r => r.category))).sort();
  }, [allRecords]);

  // Dynamically filtered analytical records
  const filteredRecords = useMemo(() => {
    return filterRecords(allRecords, filters);
  }, [allRecords, filters]);

  // Aggregate KPI summary
  const kpis = useMemo(() => {
    return calculateKpiSummary(allRecords, filteredRecords, filters);
  }, [allRecords, filteredRecords, filters]);

  // Category metrics & subcategories breakdown
  const categoryMetrics = useMemo(() => {
    return calculateCategoryMetrics(allRecords, filteredRecords, filters);
  }, [allRecords, filteredRecords, filters]);

  // Executive summary
  const executiveSummary = useMemo(() => {
    return generateExecutiveSummary(categoryMetrics);
  }, [categoryMetrics]);

  // Deterministic recommendation engine outputs
  const deterministicRecommendations = useMemo(() => {
    return generateDeterministicRecommendations(
      kpis, 
      categoryMetrics, 
      activeDatasetMode === 'raw' ? rawAuditReport.dataQualityScore : cleanAuditReport.dataQualityScore
    );
  }, [kpis, categoryMetrics, activeDatasetMode, rawAuditReport.dataQualityScore, cleanAuditReport.dataQualityScore]);

  // Reset Filters to demo default
  const handleResetFilters = () => {
    setFilters({
      year: '2025',
      quarter: 'All',
      category: 'All',
      subcategory: 'All',
    });
    setSelectedCategoryName(null);
  };

  // Switch to category view with category selection
  const handleDrilldownCategory = (categoryName: string) => {
    setSelectedCategoryName(categoryName);
    setCurrentTab('category-intelligence');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Global Header with Disclaimer Badge */}
      <Header 
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        dataQualityScore={cleanAuditReport.dataQualityScore}
      />

      {/* 2. Primary Navigation Bar */}
      <Navigation 
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        dataQualityIssuesCount={rawAuditReport.issues.length}
      />

      {/* 3. Global Filters Bar (Updated across all tabs) */}
      <GlobalFilters 
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        availableCategories={availableCategories}
        recordsCount={filteredRecords.length}
      />

      {/* 4. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'executive-overview' && (
          <ExecutiveOverviewView 
            kpis={kpis}
            categoryMetrics={categoryMetrics}
            allRecords={allRecords}
            filters={filters}
            executiveSummary={executiveSummary}
            onSelectCategory={handleDrilldownCategory}
            onResetFilters={handleResetFilters}
            onNavigateToDataQuality={() => {
              setActiveDatasetMode('clean');
              setCurrentTab('data-quality-center');
            }}
            cleanDataIssuesCount={cleanAuditReport.issues.length}
          />
        )}

        {currentTab === 'competitive-intelligence' && (
          <CompetitiveIntelligenceView 
            kpis={kpis}
            categoryMetrics={categoryMetrics}
            filters={filters}
            onSelectCategory={handleDrilldownCategory}
            onResetFilters={handleResetFilters}
          />
        )}

        {currentTab === 'category-intelligence' && (
          <CategoryIntelligenceView 
            categoryMetrics={categoryMetrics}
            allRecords={allRecords}
            filters={filters}
            selectedCategoryName={selectedCategoryName}
            onSelectCategory={setSelectedCategoryName}
            onResetFilters={handleResetFilters}
          />
        )}

        {currentTab === 'data-quality-center' && (
          <DataQualityCenterView 
            rawAuditReport={rawAuditReport}
            cleanAuditReport={cleanAuditReport}
            activeDatasetMode={activeDatasetMode}
            onToggleDatasetMode={setActiveDatasetMode}
            onExportAuditLog={() => setIsExportOpen(true)}
          />
        )}

        {currentTab === 'business-insights' && (
          <BusinessInsightsView 
            kpis={kpis}
            categoryMetrics={categoryMetrics}
            filters={filters}
            dataQualityScore={cleanAuditReport.dataQualityScore}
            deterministicRecommendations={deterministicRecommendations}
            onResetFilters={handleResetFilters}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">Retail Market Intelligence Platform</span>
            <span className="mx-2">•</span>
            <span>Market Share &amp; Competitive Intelligence Portfolio Simulation</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Clean Dataset: 192 Validated Quarterly Line Items</span>
            <span>•</span>
            <span>Taxonomy Reference: 12 Master Hierarchy Pairs</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AboutModal 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ExportModal 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        filteredRecords={filteredRecords}
        categoryMetrics={categoryMetrics}
        currentReport={activeDatasetMode === 'raw' ? rawAuditReport : cleanAuditReport}
        kpis={kpis}
        deterministicRecommendations={deterministicRecommendations}
        filters={filters}
      />

    </div>
  );
}

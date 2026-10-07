import React from 'react';
import { ShieldCheck, Info, Download, AlertTriangle, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenAbout: () => void;
  onOpenExport: () => void;
  dataQualityScore: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenAbout, 
  onOpenExport, 
  dataQualityScore 
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner ring-1 ring-blue-400/30">
              <Layers className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100">
                  Retail Market Intelligence &amp; Competitive Insights
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Enterprise Analytics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Market share diagnostics, competitor benchmarking &amp; category portfolio insights
              </p>
            </div>
          </div>

          {/* Right Actions & Synthetic Disclaimer Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Synthetic Data Disclaimer Badge */}
            <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60 shadow-xs" title="Synthetic portfolio dataset for analytical demonstration">
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
              <span className="truncate max-w-[260px] sm:max-w-xs">
                Portfolio Simulation — Category-level figures are synthetic.
              </span>
            </div>

            {/* Quality status badge */}
            <div className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>DQ Score: {dataQualityScore}%</span>
            </div>

            {/* Export button */}
            <button
              onClick={onOpenExport}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Export Analysis
            </button>

            {/* About / Methodology */}
            <button
              onClick={onOpenAbout}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-blue-700 hover:bg-blue-600 text-white transition cursor-pointer shadow-xs"
            >
              <Info className="w-3.5 h-3.5 mr-1.5" />
              About / Methodology
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

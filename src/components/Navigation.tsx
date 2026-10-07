import React from 'react';
import { TabType } from '../types';
import { 
  BarChart3, 
  GitCompare, 
  PieChart, 
  ShieldCheck, 
  Lightbulb
} from 'lucide-react';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  dataQualityIssuesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentTab, 
  onTabChange,
  dataQualityIssuesCount 
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { 
      id: 'executive-overview', 
      label: 'Executive Overview', 
      icon: <BarChart3 className="w-4 h-4 mr-2" /> 
    },
    { 
      id: 'competitive-intelligence', 
      label: 'Competitive Intelligence', 
      icon: <GitCompare className="w-4 h-4 mr-2" /> 
    },
    { 
      id: 'category-intelligence', 
      label: 'Category Intelligence', 
      icon: <PieChart className="w-4 h-4 mr-2" /> 
    },
    { 
      id: 'data-quality-center', 
      label: 'Data Quality Center', 
      icon: <ShieldCheck className="w-4 h-4 mr-2" />,
      badge: dataQualityIssuesCount > 0 ? `${dataQualityIssuesCount} Issues` : undefined
    },
    { 
      id: 'business-insights', 
      label: 'Business Insights', 
      icon: <Lightbulb className="w-4 h-4 mr-2" /> 
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-[69px] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 border border-blue-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

'use client';

// ============================================================================
// ENHANCED DASHBOARD CLIENT - Interactive Dashboard Component
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Bell, 
  Search, 
  Menu,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Settings,
  BarChart3,
  Filter,
  Download,
  Home,
  ChevronRight,
  Euro,
  Target,
  Award,
  Sparkles
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface KPIData {
  id: number;
  title: string;
  value: string;
  change: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon: string;
  color: string;
  bgColor: string;
}

interface Activity {
  id: number;
  type: 'customer' | 'meeting' | 'status' | 'document';
  title: string;
  description: string;
  time: string;
  avatar: string;
  color: string;
  performedBy: string;
  createdAt?: string; // ISO date string for better time formatting
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

interface SidebarContentProps {
  navigation: NavigationItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  closeSidebar?: () => void;
}

interface DashboardClientProps {
  kpis: KPIData[];
  activities: Activity[];
}

interface MonthlyData {
  newCustomers: number;
  completedProjects: number;
  revenue: number;
  previousMonth: {
    newCustomers: number;
    completedProjects: number;
    revenue: number;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Enhanced relative time formatting with more precision
 */
function formatDetailedRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just nu';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minut${diffInMinutes > 1 ? 'er' : ''} sedan`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} timme${diffInHours > 1 ? 'r' : ''} sedan`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} dag${diffInDays > 1 ? 'ar' : ''} sedan`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} vecka${diffInWeeks > 1 ? 'r' : ''} sedan`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} månad${diffInMonths > 1 ? 'er' : ''} sedan`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} år sedan`;
}

/**
 * Get current month data with automatic calculations
 */
function useMonthlyData(): MonthlyData {
  return useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Simulate real data - in production, this would come from your API
    const baseCustomers = 8 + Math.floor(Math.random() * 8);
    const baseProjects = 5 + Math.floor(Math.random() * 6);
    const baseRevenue = 1.8 + Math.random() * 1.2;
    
    // Add some variation based on month
    const monthMultiplier = 1 + (Math.sin(currentMonth) * 0.2);
    
    return {
      newCustomers: Math.floor(baseCustomers * monthMultiplier),
      completedProjects: Math.floor(baseProjects * monthMultiplier),
      revenue: Math.round(baseRevenue * monthMultiplier * 10) / 10,
      previousMonth: {
        newCustomers: baseCustomers - Math.floor(Math.random() * 4),
        completedProjects: baseProjects - Math.floor(Math.random() * 3),
        revenue: Math.round((baseRevenue - 0.2 - Math.random() * 0.4) * 10) / 10
      }
    };
  }, []);
}

/**
 * Get current month name in Swedish
 */
function getCurrentMonthName(): string {
  const months = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];
  return months[new Date().getMonth()];
}

/**
 * Calculate percentage change
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Generate user initials from name
 */
function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  FileText,
  Settings,
  Euro,
  Target,
  Award,
};

// ============================================================================
// ENHANCED COMPONENTS
// ============================================================================

const EnhancedKPICard: React.FC<{ data: KPIData }> = ({ data }) => {
  const Icon = iconMap[data.icon as keyof typeof iconMap] || Users;
  const isPositive = data.change.direction === 'up';
  const isNeutral = data.change.direction === 'neutral';
  
  return (
    <div className="relative group cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <div className="relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <p className="text-sm font-semibold text-gray-700">{data.title}</p>
              <Sparkles className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{data.value}</p>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm ${
                isPositive 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                  : isNeutral
                  ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200'
                  : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
              }`}>
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : isNeutral ? (
                  <div className="w-4 h-0.5 bg-current rounded" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(data.change.value)}%</span>
              </div>
              <span className="text-sm text-gray-500 font-medium">{data.change.period}</span>
            </div>
          </div>
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${data.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const initials = generateInitials(activity.performedBy || activity.avatar);
  const timeString = activity.createdAt || activity.time;
  const formattedTime = formatDetailedRelativeTime(timeString);
  
  return (
    <div className="flex items-start space-x-4 p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-2xl transition-all duration-200 cursor-pointer group">
      <div className={`w-12 h-12 rounded-2xl ${activity.color} flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
              {activity.title}
            </p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{activity.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-3">
          <p className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
            {formattedTime}
          </p>
          <p className="text-xs text-gray-400">
            av {activity.performedBy || 'Okänd användare'}
          </p>
        </div>
      </div>
    </div>
  );
};

const MonthlyResults: React.FC = () => {
  const monthlyData = useMonthlyData();
  const currentMonth = getCurrentMonthName();
  
  const newCustomersChange = calculatePercentageChange(
    monthlyData.newCustomers, 
    monthlyData.previousMonth.newCustomers
  );
  const projectsChange = calculatePercentageChange(
    monthlyData.completedProjects, 
    monthlyData.previousMonth.completedProjects
  );
  const revenueChange = calculatePercentageChange(
    monthlyData.revenue, 
    monthlyData.previousMonth.revenue
  );
  
  const overallChange = Math.round((newCustomersChange + projectsChange + revenueChange) / 3);
  
  return (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black tracking-tight">
            {currentMonth}s resultat
          </h3>
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between group">
            <span className="text-purple-100 font-medium group-hover:text-white transition-colors">
              Nya kunder
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-black">
                +{monthlyData.newCustomers}
              </span>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold ${
                newCustomersChange >= 0 
                  ? 'bg-green-500/20 text-green-200' 
                  : 'bg-red-500/20 text-red-200'
              }`}>
                {newCustomersChange >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{Math.abs(newCustomersChange)}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between group">
            <span className="text-purple-100 font-medium group-hover:text-white transition-colors">
              Avslutade projekt
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-black">
                {monthlyData.completedProjects}
              </span>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold ${
                projectsChange >= 0 
                  ? 'bg-green-500/20 text-green-200' 
                  : 'bg-red-500/20 text-red-200'
              }`}>
                {projectsChange >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{Math.abs(projectsChange)}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between group">
            <span className="text-purple-100 font-medium group-hover:text-white transition-colors">
              Intäkter
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-black">
                {monthlyData.revenue}M
              </span>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold ${
                revenueChange >= 0 
                  ? 'bg-green-500/20 text-green-200' 
                  : 'bg-red-500/20 text-red-200'
              }`}>
                {revenueChange >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{Math.abs(revenueChange)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-purple-400/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-200 font-medium">
              Jämfört med förra månaden
            </span>
            <div className={`flex items-center space-x-2 font-bold ${
              overallChange >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {overallChange >= 0 ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
              <span className="text-lg">
                {overallChange >= 0 ? '+' : ''}{overallChange}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  navigation, 
  activeTab, 
  setActiveTab, 
  closeSidebar 
}) => (
  <div className="flex flex-col h-full bg-white border-r border-gray-200">
    <div className="flex-1">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vattenmiljö</h1>
            <p className="text-xs text-gray-500">CRM System</p>
          </div>
        </div>
        {closeSidebar && (
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-6 space-y-2">
        {navigation.map((item: NavigationItem) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name.toLowerCase();
          
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name.toLowerCase());
                if (closeSidebar) closeSidebar();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              type="button"
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  </div>
);

// ============================================================================
// MAIN DASHBOARD CLIENT COMPONENT
// ============================================================================

export const EnhancedDashboardClient: React.FC<DashboardClientProps> = ({ kpis, activities }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '#', icon: BarChart3, current: activeTab === 'dashboard' },
    { name: 'Kunder', href: '#', icon: Users, current: activeTab === 'kunder' },
    { name: 'Möten', href: '#', icon: Calendar, current: activeTab === 'möten' },
    { name: 'Rapporter', href: '#', icon: FileText, current: activeTab === 'rapporter' },
    { name: 'Inställningar', href: '#', icon: Settings, current: activeTab === 'inställningar' },
  ];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Implement search functionality
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-full max-w-xs bg-white">
            <SidebarContent 
              navigation={navigation} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              closeSidebar={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent 
          navigation={navigation} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                  type="button"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                {/* Breadcrumb */}
                <nav className="hidden md:flex items-center space-x-2 text-sm">
                  <Home className="w-4 h-4 text-gray-400" />
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">Dashboard</span>
                </nav>
                
                {/* Search */}
                <div className="hidden sm:block">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Sök kunder, projekt..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors text-sm"
                    />
                  </form>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                  aria-label="Notifikationer"
                  type="button"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">admin@vattenmiljo.se</p>
                  </div>
                  <button 
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                    type="button"
                  >
                    A
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
          {/* Header section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Välkommen tillbaka! Här är en överblick av dina aktiviteter.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
                <button className="btn btn-secondary flex items-center space-x-2" type="button">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="btn btn-secondary flex items-center space-x-2" type="button">
                  <Download className="w-4 h-4" />
                  <span>Exportera</span>
                </button>
                <button className="btn btn-primary flex items-center space-x-2" type="button">
                  <Plus className="w-4 h-4" />
                  <span>Ny kund</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
            {kpis.map((kpi, index) => (
              <div 
                key={kpi.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <EnhancedKPICard data={kpi} />
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900">Senaste aktiviteter</h2>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                      type="button"
                    >
                      Visa alla
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {activities.map((activity) => (
                    <EnhancedActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Monthly Results */}
            <div className="space-y-8">
              {/* Monthly Results */}
              <MonthlyResults />
              
              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-black text-gray-900 mb-6">Snabbåtgärder</h3>
                <div className="space-y-4">
                  <button 
                    className="w-full p-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    type="button"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-bold text-lg">Skapa ny kund</span>
                  </button>
                  <button 
                    className="w-full p-5 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 transition-colors flex items-center space-x-3 hover:shadow-md"
                    type="button"
                  >
                    <Calendar className="w-6 h-6" />
                    <span className="font-bold">Schemalägg möte</span>
                  </button>
                  <button 
                    className="w-full p-5 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 transition-colors flex items-center space-x-3 hover:shadow-md"
                    type="button"
                  >
                    <FileText className="w-6 h-6" />
                    <span className="font-bold">Visa rapporter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
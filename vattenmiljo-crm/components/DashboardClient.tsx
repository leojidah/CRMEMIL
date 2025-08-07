'use client';

// ============================================================================
// DASHBOARD CLIENT - Interactive Dashboard Component
// ============================================================================

import React, { useState } from 'react';
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
  ChevronRight
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
};

// ============================================================================
// COMPONENTS
// ============================================================================

const KPICard: React.FC<{ data: KPIData }> = ({ data }) => {
  const Icon = iconMap[data.icon as keyof typeof iconMap] || Users;
  const isPositive = data.change.direction === 'up';
  
  return (
    <div className="card-hover animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{data.title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-3">{data.value}</p>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              isPositive 
                ? 'bg-green-100 text-green-700' 
                : data.change.direction === 'down'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : data.change.direction === 'down' ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : (
                <div className="w-3 h-0.5 bg-current rounded" />
              )}
              <span>{data.change.value}</span>
            </div>
            <span className="text-xs text-gray-500">{data.change.period}</span>
          </div>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${data.color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => (
  <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
    <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
      {activity.avatar}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
      <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
    </div>
  </div>
);

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

export const DashboardClient: React.FC<DashboardClientProps> = ({ kpis, activities }) => {
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
    console.log('Sökning:', searchQuery);
    // Implement search functionality
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl transform transition-transform">
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
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 z-40">
        <SidebarContent 
          navigation={navigation} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top header */}
        <header className="sticky top-0 z-30 glass border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                  aria-label="Öppna meny"
                >
                  <Menu className="w-6 h-6" />
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
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Header section */}
          <div className="mb-8 dashboard-enter">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600">
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

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, index) => (
              <div 
                key={kpi.id} 
                className="kpi-card-enter"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <KPICard data={kpi} />
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="xl:col-span-2 dashboard-enter">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Senaste aktiviteter</h2>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      type="button"
                    >
                      Visa alla
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  {activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="space-y-6 dashboard-enter">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Snabbåtgärder</h3>
                <div className="space-y-3">
                  <button 
                    className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    type="button"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Skapa ny kund</span>
                  </button>
                  <button 
                    className="w-full p-4 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center space-x-3"
                    type="button"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Schemalägg möte</span>
                  </button>
                  <button 
                    className="w-full p-4 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center space-x-3"
                    type="button"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Visa rapporter</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-colored-purple">
                <h3 className="text-lg font-bold mb-4">Månadens resultat</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-100">Nya kunder</span>
                    <span className="text-2xl font-bold">+12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-100">Avslutade projekt</span>
                    <span className="text-2xl font-bold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-100">Intäkter</span>
                    <span className="text-2xl font-bold">2.4M</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-purple-400">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-100">Jämfört med förra månaden</span>
                    <div className="flex items-center space-x-1 text-purple-100">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>+15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
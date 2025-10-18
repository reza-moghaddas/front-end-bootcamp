import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutDashboard, BarChart3, Settings, FileText } from 'lucide-react';

type TabId = 'overview' | 'analytics' | 'documents' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLastActiveTab();
  }, []);

  const loadLastActiveTab = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('last_active_tab')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data?.last_active_tab) {
      setActiveTab(data.last_active_tab as TabId);
    }
    setLoading(false);
  };

  const handleTabChange = async (tabId: TabId) => {
    setActiveTab(tabId);

    if (!user) return;

    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_preferences')
        .update({ last_active_tab: tabId })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_preferences')
        .insert({ user_id: user.id, last_active_tab: tabId });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            <TabContent activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabContent({ activeTab }: { activeTab: TabId }) {
  switch (activeTab) {
    case 'overview':
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Users" value="1,234" change="+12%" />
            <StatCard title="Revenue" value="$45,678" change="+8%" />
            <StatCard title="Active Projects" value="42" change="+5%" />
          </div>
          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Welcome back!</h3>
            <p className="text-slate-600">
              Here's a quick overview of your dashboard. Check out the other tabs for more detailed information.
            </p>
          </div>
        </div>
      );
    case 'analytics':
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>
          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Analytics Dashboard</h3>
            <p className="text-slate-600">
              View detailed analytics and insights about your data here.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard title="Page Views" value="12,345" trend="up" />
            <MetricCard title="Bounce Rate" value="32%" trend="down" />
            <MetricCard title="Avg. Session" value="4m 23s" trend="up" />
            <MetricCard title="Conversions" value="856" trend="up" />
          </div>
        </div>
      );
    case 'documents':
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Documents</h2>
          <div className="space-y-3">
            <DocumentItem title="Project Proposal.pdf" date="2 days ago" size="2.4 MB" />
            <DocumentItem title="Meeting Notes.docx" date="1 week ago" size="156 KB" />
            <DocumentItem title="Financial Report Q4.xlsx" date="2 weeks ago" size="5.1 MB" />
            <DocumentItem title="Presentation Slides.pptx" date="3 weeks ago" size="8.7 MB" />
          </div>
        </div>
      );
    case 'settings':
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
          <div className="space-y-6">
            <SettingSection
              title="Profile Settings"
              description="Manage your account information and preferences"
            />
            <SettingSection
              title="Notifications"
              description="Configure how you receive updates and alerts"
            />
            <SettingSection
              title="Privacy & Security"
              description="Control your privacy settings and security options"
            />
            <SettingSection
              title="Billing"
              description="Manage your subscription and payment methods"
            />
          </div>
        </div>
      );
  }
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
      <h3 className="text-sm font-medium text-slate-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend }: { title: string; value: string; trend: 'up' | 'down' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-sm font-medium text-slate-600 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <div className="mt-2">
        <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? '↑' : '↓'} {trend === 'up' ? 'Increased' : 'Decreased'}
        </span>
      </div>
    </div>
  );
}

function DocumentItem({ title, date, size }: { title: string; date: string; size: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-medium text-slate-800">{title}</h4>
          <p className="text-sm text-slate-500">{date} • {size}</p>
        </div>
      </div>
    </div>
  );
}

function SettingSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 mb-4">{description}</p>
      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
        Configure
      </button>
    </div>
  );
}

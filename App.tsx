import React, { useState, useEffect, useMemo } from 'react';
import { fetchProductionData, calculateStats } from './services/dataService';
import { ProductionItem, ViewType, DashboardStats } from './types';
import ProductionTable from './components/ProductionTable';
import DashboardView from './components/DashboardView';
import AIInsightsPanel from './components/AIInsightsPanel';
import InvoiceChecker from './components/InvoiceChecker';

const App: React.FC = () => {
  const [data, setData] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');

  const stats = useMemo(() => calculateStats(data), [data]);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const result = await fetchProductionData();
        setData(result);
      } catch (err) {
        console.error("Failed to load data", err);
        setError("Network Error: Ensure your internet is connected and the data source is accessible.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fffafa]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-pink-100 border-t-[#ff8fa3] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🧳</div>
        </div>
        <p className="mt-6 text-[#ff8fa3] font-black text-xs tracking-[0.3em] uppercase animate-pulse">Initializing Command Center</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fffafa] px-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-red-100/50">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Offline</h2>
        <p className="text-slate-500 mt-2 max-w-md font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-10 py-4 bg-gradient-to-r from-[#ffafbd] to-[#ffc3a0] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fffafb] text-slate-900 selection:bg-pink-100 selection:text-pink-600">
      {/* Navigation Sidebar */}
      <aside className="w-72 bg-[#2d1b2e] text-white fixed h-full hidden lg:flex flex-col shadow-2xl z-20">
        <div className="p-10 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-10 h-10 bg-gradient-to-br from-[#ffafbd] to-[#ffc3a0] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🧳</span>
             </div>
             <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ffafbd] to-[#ffc3a0]">BEIS BASE</h1>
          </div>
          <p className="text-[10px] text-pink-300 uppercase tracking-[0.4em] font-black mt-2">Emilio Command v2.6</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-4 mt-6 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'table', label: 'Production', icon: '👜' },
            { id: 'invoice-checker', label: 'Invoice Checker', icon: '📦' },
            { id: 'ai-insights', label: 'AI Insights', icon: '✨' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 group ${view === item.id ? 'bg-gradient-to-r from-[#ff8fa3] to-[#ffb347] text-white shadow-xl shadow-[#ff8fa3]/30 scale-[1.03]' : 'text-slate-400 hover:text-pink-200 hover:bg-white/5'}`}
            >
              <span className={`text-xl transition-transform duration-300 ${view === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              <span className="font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <p className="text-[10px] text-pink-300 font-black uppercase tracking-widest mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-slate-300">Live & Syncing</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen">
        <header className="bg-white/90 backdrop-blur-xl border-b border-pink-50 sticky top-0 z-10 px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lg:hidden text-2xl">🧳</div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight capitalize flex items-center gap-3">
                 {view.replace('-', ' ')}
              </h2>
              <p className="text-[10px] text-pink-400 font-black uppercase tracking-[0.2em]">Operational Excellence Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged as</span>
              <span className="text-sm font-black text-slate-700">PPIC Manager</span>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-[#ffafbd] to-[#ffc3a0] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100 ring-4 ring-pink-50 transition-transform hover:scale-105 cursor-pointer">
              <span className="text-white text-sm font-black">EM</span>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1800px] mx-auto">
          {view === 'dashboard' && <DashboardView data={data} stats={stats} />}
          {view === 'table' && <ProductionTable data={data} />}
          {view === 'invoice-checker' && <InvoiceChecker />}
          {view === 'ai-insights' && <AIInsightsPanel data={data} />}
        </div>
      </main>
    </div>
  );
};

export default App;
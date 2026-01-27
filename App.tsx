
import React, { useState, useEffect } from 'react';
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
  const [stats, setStats] = useState<DashboardStats>({
    totalOrder: 0,
    totalProduced: 0,
    totalRemaining: 0,
    completionRate: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const result = await fetchProductionData();
        setData(result);
        setStats(calculateStats(result));
      } catch (err) {
        console.error("Failed to load data", err);
        setError("Could not retrieve spreadsheet data. Ensure the Google Sheet is shared with 'Anyone with the link' and retry.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fffafa]">
        <div className="w-16 h-16 border-4 border-[#ff8fa3] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#ff8fa3] font-bold animate-pulse tracking-wide uppercase">Packing Your Data... 🧳</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fffafa] px-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Connection Error</h2>
        <p className="text-slate-500 mt-2 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-gradient-to-r from-[#ffafbd] to-[#ffc3a0] text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fffafb] text-slate-900">
      <aside className="w-64 bg-[#2d1b2e] text-white fixed h-full hidden lg:flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-2xl">🧳</span>
             <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ffafbd] to-[#ffc3a0]">BEIS BASE</h1>
          </div>
          <p className="text-[10px] text-pink-300 uppercase tracking-[0.3em] font-black">By Emilio PPIC</p>
        </div>
        <nav className="flex-1 p-4 space-y-3 mt-4 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${view === 'dashboard' ? 'bg-gradient-to-r from-[#ff8fa3] to-[#ffb347] text-white shadow-lg shadow-[#ff8fa3]/30 scale-[1.02]' : 'text-slate-400 hover:text-pink-200 hover:bg-white/5'}`}
          >
            <span className="text-xl">📊</span>
            <span className="font-bold">Dashboard</span>
          </button>
          <button 
            onClick={() => setView('table')}
            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${view === 'table' ? 'bg-gradient-to-r from-[#ff8fa3] to-[#ffb347] text-white shadow-lg shadow-[#ff8fa3]/30 scale-[1.02]' : 'text-slate-400 hover:text-pink-200 hover:bg-white/5'}`}
          >
            <span className="text-xl">👜</span>
            <span className="font-bold">Production</span>
          </button>
          <button 
            onClick={() => setView('invoice-checker')}
            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${view === 'invoice-checker' ? 'bg-gradient-to-r from-[#ff8fa3] to-[#ffb347] text-white shadow-lg shadow-[#ff8fa3]/30 scale-[1.02]' : 'text-slate-400 hover:text-pink-200 hover:bg-white/5'}`}
          >
            <span className="text-xl">📦</span>
            <span className="font-bold">Invoice Checker</span>
          </button>
          <button 
            onClick={() => setView('ai-insights')}
            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${view === 'ai-insights' ? 'bg-gradient-to-r from-[#ff8fa3] to-[#ffb347] text-white shadow-lg shadow-[#ff8fa3]/30 scale-[1.02]' : 'text-slate-400 hover:text-pink-200 hover:bg-white/5'}`}
          >
            <span className="text-xl">✨</span>
            <span className="font-bold">AI Insights</span>
          </button>
        </nav>
        <div className="p-6 border-t border-white/5 text-[10px] text-pink-200/40 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <span>🎒</span> Peach Edition 2.6
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 pb-12">
        <header className="bg-white/80 backdrop-blur-md border-b border-pink-50 sticky top-0 z-10 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight capitalize flex items-center gap-3">
               {view === 'dashboard' ? '📊' : view === 'table' ? '👜' : view === 'invoice-checker' ? '📦' : '✨'}
               {view.replace('-', ' ')}
            </h2>
            <p className="text-xs text-pink-400 font-bold uppercase tracking-widest">Live Operations</p>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline-block px-4 py-1.5 bg-pink-50 text-pink-500 text-[10px] font-black rounded-full border border-pink-100 uppercase tracking-widest">CLOUD SYNC ACTIVE 💼</span>
            <div className="h-10 w-10 bg-gradient-to-br from-[#ffafbd] to-[#ffc3a0] rounded-2xl flex items-center justify-center shadow-md shadow-pink-100">
              <span className="text-white text-xs font-black">OP</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[2200px] mx-auto">
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

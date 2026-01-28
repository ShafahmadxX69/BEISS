
import React, { useState } from 'react';
import { fetchInvoiceData } from '../services/dataService';
import { InvoiceItem } from '../types';

const InvoiceChecker: React.FC = () => {
  const [brand, setBrand] = useState('');
  const [invoice, setInvoice] = useState('');
  const [results, setResults] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!brand || !invoice) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchInvoiceData(brand, invoice);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalQty = results.reduce((acc, curr) => acc + curr.QTY, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search Bar Container */}
      <div className="bg-white p-10 rounded-[3rem] border border-pink-50 shadow-2xl shadow-pink-100/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em] mb-3 block ml-4">BRAND 🎒</label>
            <input 
              type="text" 
              placeholder="e.g. BEIS"
              className="w-full px-8 py-5 bg-pink-50/30 border border-pink-100 rounded-[2rem] text-lg font-black text-slate-700 placeholder:text-pink-200 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-inner"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em] mb-3 block ml-4">INVOICE NUMBER 👜</label>
            <input 
              type="text" 
              placeholder="e.g. INV-12345"
              className="w-full px-8 py-5 bg-pink-50/30 border border-pink-100 rounded-[2rem] text-lg font-black text-slate-700 placeholder:text-pink-200 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-inner"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
            />
          </div>
          <div className="md:pt-8 w-full md:w-auto">
            <button 
              onClick={handleSearch}
              disabled={loading || !brand || !invoice}
              className={`w-full md:w-auto px-12 py-5 bg-gradient-to-r from-[#ff8fa3] to-[#ffb347] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-[#ff8fa3]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><span>📦</span> CHECK</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-[3rem] border border-pink-50 shadow-2xl shadow-pink-100/20 overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-pink-50 bg-white/50 flex justify-between items-center">
           <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
             <span className="text-2xl">📋</span>
             INVOICE RESULTS
           </h3>
           {results.length > 0 && (
             <div className="px-6 py-2 bg-pink-50 text-pink-500 rounded-full text-xs font-black uppercase tracking-widest border border-pink-100">
               {results.length} ENTRIES FOUND
             </div>
           )}
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-[#2d1b2e] text-pink-200 uppercase text-[10px] tracking-[0.3em] font-black">
                <th className="px-8 py-7">PO #</th>
                <th className="px-8 py-7">Product Type</th>
                <th className="px-8 py-7">Color / Variant</th>
                <th className="px-8 py-7">Size</th>
                <th className="px-8 py-7 text-right">Qty</th>
                <th className="px-8 py-7 text-right">Rework</th>
                <th className="px-8 py-7 text-center">Qty Status</th>
                <th className="px-8 py-7">Export Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {results.length > 0 ? (
                results.map((row, i) => (
                  <tr key={i} className="hover:bg-pink-50/20 transition-all group">
                    <td className="px-8 py-7 font-black text-slate-700">{row.PO}</td>
                    <td className="px-8 py-7 font-bold text-slate-500 uppercase text-xs">{row.TYPE}</td>
                    <td className="px-8 py-7 font-black text-slate-800">{row.COLOR}</td>
                    <td className="px-8 py-7 font-bold text-slate-400 uppercase text-xs">{row.SIZE}</td>
                    <td className="px-8 py-7 text-right font-black text-lg text-pink-500">{row.QTY.toLocaleString()}</td>
                    <td className="px-8 py-7 text-right font-black text-slate-400">{row.REWORK}</td>
                    <td className="px-8 py-7 text-center">
                      <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${row.QTY_STATUS === 'READY' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                        {row.QTY_STATUS}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                         {row.INV_STATUS}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center">
                    {!searched ? (
                      <div className="flex flex-col items-center gap-4 text-pink-100">
                        <span className="text-8xl">🔎</span>
                        <p className="font-black text-pink-200 uppercase tracking-widest text-sm">Enter Brand & Invoice to Search</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-pink-100">
                        <span className="text-8xl">📭</span>
                        <p className="font-black text-pink-200 uppercase tracking-widest text-sm">No Invoice Records Found</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {results.length > 0 && (
          <div className="p-10 bg-pink-50/50 border-t border-pink-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-2xl font-black text-[#d81b60] uppercase tracking-tighter">
                {invoice.toUpperCase()} TOTAL: {totalQty.toLocaleString()} PCS 🧳
              </p>
              <p className="text-[10px] font-black text-pink-400 mt-1 uppercase tracking-widest">
                😊 If there is something happen, call Emilio!
              </p>
            </div>
            <button 
              onClick={() => window.print()}
              className="px-8 py-3 bg-white border-2 border-pink-100 rounded-2xl text-[10px] font-black text-pink-500 uppercase tracking-widest hover:bg-pink-100 transition-all flex items-center gap-2"
            >
              <span>🖨️</span> Export PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceChecker;

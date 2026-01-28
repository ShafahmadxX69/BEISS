
import React, { useState } from 'react';
import { ProductionItem } from '../types';

interface ProductionTableProps {
  data: ProductionItem[];
}

const ProductionTable: React.FC<ProductionTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter shows ALL items by default, including finished
  const filteredData = data.filter(item => 
    item.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modelType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.beisPo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/A' || dateStr.includes(' ')) {
      return dateStr;
    }
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusBadge = (item: ProductionItem) => {
    // 1. Finished status takes priority
    if (item.remainingQty <= 0) {
      return (
        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm inline-block whitespace-nowrap">
          Finished 👜
        </span>
      );
    }

    if (!item.productionDate) return null;

    // 2. Specific check for "On Producing" string from Column A
    if (item.productionDate.toLowerCase().includes('on producing')) {
      return (
        <span className="px-4 py-1.5 bg-pink-50 text-[#ff8fa3] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-pink-100 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
          <span className="w-2 h-2 bg-[#ff8fa3] rounded-full animate-ping"></span>
          Producing 🎒
        </span>
      );
    }

    // 3. Date-based logic
    const prodDate = new Date(item.productionDate);
    
    // If date is valid and in the past (but item not finished)
    if (!isNaN(prodDate.getTime()) && prodDate < today) {
      return (
        <span className="px-4 py-1.5 bg-pink-50 text-[#ff8fa3] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-pink-100 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
          <span className="w-2 h-2 bg-[#ff8fa3] rounded-full animate-ping"></span>
          Producing 🎒
        </span>
      );
    }
    
    // 4. Future plan status
    return (
      <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm whitespace-nowrap">
        Plan on {formatDate(item.productionDate)} 🧳
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[3rem] border border-pink-50 shadow-2xl shadow-pink-100/20 overflow-hidden animate-fadeIn w-full">
      <div className="p-8 border-b border-pink-50 bg-white/50 flex flex-col sm:flex-row justify-between items-center gap-8">
        <div className="relative w-full sm:w-1/2">
          <input 
            type="text" 
            placeholder="Search suitcases, bags, models..."
            className="w-full pl-14 pr-6 py-4 bg-pink-50/30 border border-pink-100 rounded-3xl text-lg font-medium text-slate-700 placeholder:text-pink-300 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-5 top-4 text-2xl">🔍</span>
        </div>
        <div className="text-[11px] text-pink-500 font-black bg-pink-50 px-6 py-3 rounded-2xl border border-pink-100 uppercase tracking-[0.2em] whitespace-nowrap">
          {filteredData.length} BATCHES TRACKED 💼
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar w-full">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-[#2d1b2e] text-pink-200 uppercase text-[10px] tracking-[0.3em] font-black">
              <th className="px-8 py-7">Status 🧳</th>
              <th className="px-8 py-7">PO Details 📄</th>
              <th className="px-8 py-7">Work Order 🔖</th>
              <th className="px-8 py-7">Product Model 👜</th>
              <th className="px-8 py-7 text-right">Target QTY</th>
              <th className="px-8 py-7 text-right">Produced</th>
              <th className="px-8 py-7 text-right">Outstanding</th>
              <th className="px-8 py-7 text-center">Line</th>
              <th className="px-8 py-7">Progress %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {filteredData.map((row, i) => {
              const progress = (row.producedQty / row.orderQty) * 100;
              const activeLine = (row.extractedLine && row.extractedLine !== 'N/A') 
                ? row.extractedLine 
                : (row.dailyProduction.find(d => d.qty > 0)?.line || 'Idle');
              
              return (
                <tr key={i} className="hover:bg-pink-50/20 transition-all group cursor-default">
                  <td className="px-8 py-7 align-middle">
                    {getStatusBadge(row)}
                  </td>
                  <td className="px-8 py-7 align-middle whitespace-nowrap">
                    <div className="text-base font-black text-slate-800">{row.beisPo}</div>
                    <div className="text-[10px] text-pink-400 font-black uppercase tracking-widest">{row.uliPo}</div>
                  </td>
                  <td className="px-8 py-7 align-middle whitespace-nowrap">
                    <span className="px-4 py-2 bg-gradient-to-r from-[#ffafbd] to-[#ffc3a0] text-white rounded-xl font-mono text-sm font-black shadow-sm">
                      {row.woNumber}
                    </span>
                  </td>
                  <td className="px-8 py-7 align-middle min-w-[300px]">
                    <div className="text-base font-black text-slate-800 break-words">
                      <span className="mr-2 text-xl">👜</span>{row.modelType}
                    </div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      {row.color} <span className="mx-1 text-pink-200">/</span> {row.size}
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right align-middle font-black text-slate-800 text-lg whitespace-nowrap">
                    {row.orderQty.toLocaleString()}
                  </td>
                  <td className="px-8 py-7 text-right align-middle text-pink-500 font-black text-lg whitespace-nowrap">
                    {row.producedQty.toLocaleString()}
                  </td>
                  <td className={`px-8 py-7 text-right align-middle font-black text-lg whitespace-nowrap ${row.remainingQty <= 0 ? 'text-emerald-500' : 'text-orange-400'}`}>
                    {row.remainingQty.toLocaleString()}
                  </td>
                  <td className="px-8 py-7 align-middle text-center whitespace-nowrap">
                    <span className="text-[10px] font-black text-pink-600 bg-pink-100/50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-pink-100">
                      {activeLine}
                    </span>
                  </td>
                  <td className="px-8 py-7 align-middle min-w-[200px]">
                    <div className="w-full bg-pink-50 rounded-full h-3 shadow-inner">
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ease-out ${progress >= 100 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]' : 'bg-gradient-to-r from-[#ff8fa3] to-[#ffb347] shadow-[0_0_15px_rgba(255,143,163,0.3)]'}`} 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[11px] font-black text-pink-300 tracking-[0.1em] uppercase">
                        {progress.toFixed(1)}% QUOTA
                      </span>
                      {progress >= 100 && <span className="text-sm">✨</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionTable;

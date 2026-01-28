
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';
import { ProductionItem, DashboardStats } from '../types';

interface DashboardViewProps {
  data: ProductionItem[];
  stats: DashboardStats;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const produced = payload[0].value;
    const remaining = payload[1].value;
    const total = produced + remaining;
    const percentage = total > 0 ? ((produced / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white/95 backdrop-blur-sm p-5 rounded-3xl border border-pink-100 shadow-2xl shadow-pink-200/20">
        <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Batch Analytics</p>
        <p className="text-sm font-black text-slate-800 mb-1">Variant Summary</p>
        <p className="text-[11px] font-bold text-slate-500 mb-3 border-b border-pink-50 pb-2 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-pink-50 rounded-md text-pink-400">{data.color}</span>
          <span className="px-2 py-0.5 bg-slate-50 rounded-md text-slate-400">{data.size}</span>
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-6">
            <span className="text-xs font-bold text-slate-500">Produced:</span>
            <span className="text-xs font-black text-slate-800">{produced.toLocaleString()} PCS</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-xs font-bold text-slate-500">Goal:</span>
            <span className="text-xs font-black text-slate-800">{total.toLocaleString()} PCS</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-xs font-bold text-slate-500">Order Count:</span>
            <span className="text-xs font-black text-slate-800">{data.soCount} SOs</span>
          </div>
          <div className="pt-2 flex justify-between items-center">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Progress</span>
            <span className="text-sm font-black text-emerald-500">{percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const DashboardView: React.FC<DashboardViewProps> = ({ data, stats }) => {
  // Aggregate data by Color and Size across all orders
  const chartData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const key = `${item.color} | ${item.size}`;
      if (!acc[key]) {
        acc[key] = {
          color: item.color,
          size: item.size,
          displayLabel: key.length > 25 ? key.substring(0, 25) + '...' : key,
          produced: 0,
          remaining: 0,
          total: 0,
          soCount: 0
        };
      }
      acc[key].produced += item.producedQty;
      acc[key].remaining += item.remainingQty;
      acc[key].total += item.orderQty;
      acc[key].soCount += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .slice(0, 15)
      .map(item => ({
        ...item,
        percentage: item.total > 0 ? Math.round((item.produced / item.total) * 100) : 0
      }));
  }, [data]);

  const pieData = [
    { name: 'Produced', value: stats.totalProduced, color: '#ff8fa3' },
    { name: 'Remaining', value: stats.totalRemaining, color: '#fff0f3' }
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL ORDERS', value: stats.totalOrder.toLocaleString(), color: 'from-[#ffafbd] to-[#ffc3a0]', icon: '🧳' },
          { label: 'PRODUCED QTY', value: stats.totalProduced.toLocaleString(), color: 'from-[#ff8fa3] to-[#ffb347]', icon: '👜' },
          { label: 'OUTSTANDING', value: stats.totalRemaining.toLocaleString(), color: 'from-[#fccb90] to-[#d57eeb]', icon: '🎒' },
          { label: 'COMPLETION %', value: `${stats.completionRate.toFixed(1)}%`, color: 'from-[#2d1b2e] to-[#4a2c4d]', icon: '💼' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-pink-50 shadow-sm transition-all hover:shadow-xl group">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{card.icon}</span>
              <div className={`w-3 h-12 rounded-full bg-gradient-to-b ${card.color}`}></div>
            </div>
            <p className="text-[10px] text-pink-400 font-black tracking-[0.2em] uppercase mb-1">{card.label}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-pink-50 shadow-sm overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-[#ffafbd] to-[#ffc3a0] rounded-full"></span>
                PRODUCTION ANALYTICS 👜
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-5">Aggregated Variants (Color & Size)</p>
            </div>
            <div className="flex items-center gap-4 bg-pink-50/50 px-4 py-2 rounded-2xl border border-pink-50">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ff8fa3]"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase">DONE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#fff0f3] border border-pink-100"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase">LEFT</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[550px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 60, top: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ffafbd" />
                    <stop offset="100%" stopColor="#ff8fa3" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fff5f6" />
                <YAxis 
                  dataKey="displayLabel" 
                  type="category" 
                  width={180} 
                  style={{ fontSize: '11px', fontWeight: 800, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <XAxis type="number" hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 175, 189, 0.05)' }}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="produced" 
                  name="Produced QTY" 
                  stackId="a" 
                  fill="url(#prodGradient)" 
                  barSize={18} 
                  radius={[4, 0, 0, 4]} 
                />
                <Bar 
                  dataKey="remaining" 
                  name="Outstanding" 
                  stackId="a" 
                  fill="#fff0f3" 
                  barSize={18} 
                  radius={[0, 4, 4, 0]}
                >
                  <LabelList 
                    dataKey="percentage" 
                    position="right" 
                    formatter={(val: number) => `${val}%`} 
                    style={{ fontSize: '10px', fontWeight: 900, fill: '#ff8fa3', paddingLeft: '8px' }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-pink-50 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-10 text-center">OVERALL REACH 🎒</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-72 w-full flex items-center justify-center relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ffafbd] to-[#ffc3a0]">
                  {stats.completionRate.toFixed(0)}%
                </span>
                <span className="text-[10px] text-pink-300 font-black uppercase tracking-[0.3em] mt-2">Yield Target 🧳</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-12 space-y-4">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-pink-50/30 rounded-3xl border border-pink-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-xl shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item.name} {item.name === 'Produced' ? '👜' : '🎒'}</span>
                  </div>
                  <span className="font-black text-slate-800 text-xl">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;


import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';
import { ProductionItem, DashboardStats } from '../types';

interface DashboardViewProps {
  data: ProductionItem[];
  stats: DashboardStats;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-[2rem] border border-pink-100 shadow-2xl shadow-pink-200/40">
        <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-2">Work Order Detail</p>
        <p className="text-sm font-black text-slate-800 mb-4">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff8fa3]"></span> Produced
            </span>
            <span className="text-sm font-black text-slate-800">{payload[0].value.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-100"></span> Outstanding
            </span>
            <span className="text-sm font-black text-slate-800">{payload[1].value.toLocaleString()}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-pink-50 flex items-center justify-between gap-8">
            <span className="text-xs font-black text-pink-500 uppercase">Progress</span>
            <span className="text-sm font-black text-pink-500">
              {((payload[0].value / (payload[0].value + payload[1].value)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const DashboardView: React.FC<DashboardViewProps> = ({ data, stats }) => {
  // Sort by order quantity to show the biggest batches first
  const sortedData = [...data].sort((a, b) => b.orderQty - a.orderQty);
  
  const chartData = sortedData.slice(0, 10).map(item => ({
    name: item.modelType.length > 25 ? item.modelType.substring(0, 25) + '...' : item.modelType,
    fullName: `${item.modelType} (${item.color})`,
    produced: item.producedQty,
    remaining: item.remainingQty,
    total: item.orderQty,
    wo: item.woNumber
  }));

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
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-pink-50 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-[#ffafbd] to-[#ffc3a0] rounded-full"></span>
                PRODUCTION PERFORMANCE 👜
              </h3>
              <p className="text-xs text-slate-400 font-bold ml-5 uppercase tracking-widest mt-1">Top 10 Active Batches</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff8fa3]"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-50"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Left</span>
              </div>
            </div>
          </div>

          <div className="h-[550px] w-full mt-4 pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical" 
                margin={{ left: 10, right: 60, top: 0, bottom: 0 }}
                barGap={0}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ffafbd" />
                    <stop offset="100%" stopColor="#ff8fa3" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#fff0f3" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={180} 
                  style={{ fontSize: '12px', fontWeight: 800, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 175, 189, 0.05)' }}
                  content={<CustomTooltip />}
                />
                {/* Produced Bar */}
                <Bar 
                  dataKey="produced" 
                  name="Produced QTY" 
                  stackId="a" 
                  fill="url(#barGradient)" 
                  barSize={32}
                  radius={[8, 0, 0, 8]}
                >
                  <LabelList 
                    dataKey="produced" 
                    position="center" 
                    style={{ fill: '#fff', fontSize: '10px', fontWeight: 900, pointerEvents: 'none' }}
                    formatter={(val: number) => val > 50 ? val.toLocaleString() : ''}
                  />
                </Bar>
                {/* Remaining Bar */}
                <Bar 
                  dataKey="remaining" 
                  name="Outstanding" 
                  stackId="a" 
                  fill="#fff0f3" 
                  radius={[0, 8, 8, 0]} 
                  barSize={32}
                >
                  <LabelList 
                    dataKey="total" 
                    position="right" 
                    style={{ fill: '#ff8fa3', fontSize: '11px', fontWeight: 900, paddingLeft: '10px' }}
                    formatter={(val: number) => `Goal: ${val.toLocaleString()}`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-pink-50 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-10 text-center">OVERALL REACH 🎒</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-80 w-full flex items-center justify-center relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
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
                    innerRadius={100}
                    outerRadius={135}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
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
                <div key={i} className="group flex items-center justify-between p-5 bg-pink-50/30 rounded-3xl border border-pink-50/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-xl shadow-inner flex items-center justify-center" style={{ backgroundColor: item.color }}>
                       <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item.name} {item.name === 'Produced' ? '👜' : '🎒'}</span>
                  </div>
                  <span className="font-black text-slate-800 text-xl group-hover:text-pink-500 transition-colors">{item.value.toLocaleString()}</span>
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

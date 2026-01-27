
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ProductionItem, DashboardStats } from '../types';

interface DashboardViewProps {
  data: ProductionItem[];
  stats: DashboardStats;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data, stats }) => {
  // Show all data points for top products
  const chartData = data.slice(0, 15).map(item => ({
    name: `${item.modelType} | ${item.color} | ${item.size}`,
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
      {/* Stats Cards with Luggage Emojis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL ORDERS', value: stats.totalOrder.toLocaleString(), color: 'from-[#ffafbd] to-[#ffc3a0]', icon: '🧳' },
          { label: 'PRODUCED QTY', value: stats.totalProduced.toLocaleString(), color: 'from-[#ff8fa3] to-[#ffb347]', icon: '👜' },
          { label: 'OUTSTANDING', value: stats.totalRemaining.toLocaleString(), color: 'from-[#fccb90] to-[#d57eeb]', icon: '🎒' },
          { label: 'COMPLETION %', value: `${stats.completionRate.toFixed(1)}%`, color: 'from-[#2d1b2e] to-[#4a2c4d]', icon: '💼' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-pink-50 shadow-sm transition-all hover:shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl filter drop-shadow-sm">{card.icon}</span>
              <div className={`w-3 h-12 rounded-full bg-gradient-to-b ${card.color}`}></div>
            </div>
            <p className="text-[10px] text-pink-400 font-black tracking-[0.2em] uppercase mb-1">{card.label}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-pink-50 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-[#ffafbd] to-[#ffc3a0] rounded-full"></span>
              PRODUCTION ANALYTICS 👜
            </h3>
          </div>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#fff0f3" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={220} 
                  style={{ fontSize: '11px', fontWeight: 700, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#fff5f6' }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 50px rgba(255,143,163,0.15)', 
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                  }}
                  itemStyle={{ fontWeight: 900, fontSize: '14px' }}
                />
                <Bar dataKey="produced" name="Produced QTY" stackId="a" fill="#ff8fa3" barSize={24} />
                <Bar dataKey="remaining" name="Outstanding" stackId="a" fill="#fff0f3" radius={[0, 8, 8, 0]} barSize={24} />
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
                <div key={i} className="flex items-center justify-between p-5 bg-pink-50/30 rounded-3xl border border-pink-50/50">
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

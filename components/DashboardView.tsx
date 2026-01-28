import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';
import { ProductionItem, DashboardStats } from '../types';

interface DashboardViewProps {
  data: ProductionItem[];
  stats: DashboardStats;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const produced = payload[0].value;
    const remaining = payload[1].value;
    const total = produced + remaining;
    const percentage = total > 0 ? ((produced / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-[2rem] border border-pink-100 shadow-2xl">
        <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em] mb-2">Variant Data</p>
        <p className="text-lg font-black text-slate-800 mb-1">{data.color}</p>
        <p className="text-xs font-bold text-slate-400 mb-4 pb-3 border-b border-pink-50">Size: {data.size}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between gap-8">
            <span className="text-xs font-bold text-slate-500">Produced</span>
            <span className="text-xs font-black text-slate-800">{produced.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-xs font-bold text-slate-500">Remaining</span>
            <span className="text-xs font-black text-slate-800">{remaining.toLocaleString()}</span>
          </div>
          <div className="pt-2 flex justify-between items-center border-t border-pink-50 mt-2">
            <span className="text-[10px] font-black text-emerald-500 uppercase">Yield</span>
            <span className="text-sm font-black text-emerald-500">{percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const DashboardView: React.FC<DashboardViewProps> = ({ data, stats }) => {
  const chartData = useMemo(() => {
    interface GroupedItem {
      color: string;
      size: string;
      displayLabel: string;
      produced: number;
      remaining: number;
      total: number;
    }

    const grouped = data.reduce((acc, item) => {
      const key = `${item.color} | ${item.size}`;
      if (!acc[key]) {
        acc[key] = {
          color: item.color,
          size: item.size,
          displayLabel: key.length > 20 ? key.substring(0, 18) + '...' : key,
          produced: 0,
          remaining: 0,
          total: 0
        };
      }
      acc[key].produced += item.producedQty;
      acc[key].remaining += item.remainingQty;
      acc[key].total += item.orderQty;
      return acc;
    }, {} as Record<string, GroupedItem>);

    return Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
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
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Volume', value: stats.totalOrder, color: 'from-[#ffafbd] to-[#ffc3a0]', icon: '🧳', unit: 'PCS' },
          { label: 'Completed', value: stats.totalProduced, color: 'from-[#ff8fa3] to-[#ffb347]', icon: '👜', unit: 'PCS' },
          { label: 'Remaining', value: stats.totalRemaining, color: 'from-[#fccb90] to-[#d57eeb]', icon: '🎒', unit: 'PCS' },
          { label: 'Yield Rate', value: stats.completionRate.toFixed(1), color: 'from-[#2d1b2e] to-[#4a2c4d]', icon: '📈', unit: '%' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-pink-50 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-50/30 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{card.icon}</span>
              <div className={`px-3 py-1 bg-gradient-to-r ${card.color} text-white text-[10px] font-black rounded-full uppercase tracking-widest`}>Live</div>
            </div>
            <p className="text-[11px] text-pink-400 font-black tracking-[0.2em] uppercase mb-2 relative z-10">{card.label}</p>
            <div className="flex items-baseline gap-2 relative z-10">
               <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{card.value.toLocaleString()}</h3>
               <span className="text-xs font-bold text-slate-400">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Production Velocity Bar Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-pink-50 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800">Production Velocity 👜</h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Top 10 High-Volume Variants</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff8fa3]"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#fff0f3]"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Left</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fff5f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="displayLabel" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  style={{ fontSize: '11px', fontWeight: 700, fill: '#64748b' }} 
                  width={150}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,175,189,0.05)' }} />
                <Bar dataKey="produced" stackId="a" fill="#ff8fa3" radius={[4, 0, 0, 4]} barSize={24} />
                <Bar dataKey="remaining" stackId="a" fill="#fff0f3" radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList 
                    dataKey="percentage" 
                    position="right" 
                    formatter={(val: number) => `${val}%`} 
                    style={{ fontSize: '11px', fontWeight: 900, fill: '#ff8fa3', marginLeft: 10 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reach/Yield Pie Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-pink-50 shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-black text-slate-800 mb-2">Inventory Flow 🎒</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Total Reach Status</p>
          
          <div className="relative w-full aspect-square flex items-center justify-center">
            <div className="absolute flex flex-col items-center">
               <span className="text-5xl font-black text-slate-800 tracking-tighter">{stats.completionRate.toFixed(0)}%</span>
               <span className="text-[10px] font-black text-pink-300 uppercase tracking-widest mt-1">Completion</span>
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
                  animationBegin={200}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full mt-10 space-y-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-pink-50/30 rounded-2xl border border-pink-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="font-black text-slate-800">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
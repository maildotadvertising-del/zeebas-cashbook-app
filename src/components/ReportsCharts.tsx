"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { expenseCategories, monthlyData } from "@/lib/mockData";

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-sm font-medium">{payload[0].name}</p>
        <p className="text-white text-sm font-bold">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function ReportsCharts() {
  const data = monthlyData.filter((d) => d.income > 0 || d.expenses > 0);
  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx?: number; cy?: number; midAngle?: number; innerRadius?: number; outerRadius?: number; percent?: number }) => {
    if ((percent ?? 0) < 0.05) return null;
    const _cx = cx ?? 0;
    const _cy = cy ?? 0;
    const _midAngle = midAngle ?? 0;
    const _innerRadius = innerRadius ?? 0;
    const _outerRadius = outerRadius ?? 0;
    const radius = _innerRadius + (_outerRadius - _innerRadius) * 0.5;
    const x = _cx + radius * Math.cos(-_midAngle * RADIAN);
    const y = _cy + radius * Math.sin(-_midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${((percent ?? 0) * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Expense Breakdown</h2>
        <p className="text-slate-400 text-sm mb-6">By category, all time</p>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={55}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 min-w-[200px]">
            {expenseCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div>
                  <p className="text-xs text-slate-300 font-medium">{cat.name}</p>
                  <p className="text-xs text-slate-500">${cat.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Monthly P&L</h2>
        <p className="text-slate-400 text-sm mb-4">Profit & loss by month</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px" }}
              labelStyle={{ color: "#94a3b8" }}
              itemStyle={{ color: "#e2e8f0" }}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "13px", paddingTop: "12px" }} />
            <Bar dataKey="income" name="Income" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

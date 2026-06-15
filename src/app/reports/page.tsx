import Sidebar from "@/components/Sidebar";
import ReportsChartsWrapper from "@/components/ReportsChartsWrapper";
import { invoices, expenses, expenseCategories, monthlyData } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Percent, Award } from "lucide-react";

export default function ReportsPage() {
  const totalIncome = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : "0";

  const bestMonth = monthlyData.reduce((best, m) => (m.income > best.income ? m : best), monthlyData[0]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-slate-400 mt-0.5">Financial analytics and performance insights</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: `$${totalIncome.toLocaleString()}`, icon: TrendingUp, color: "text-indigo-400", sub: "All paid invoices" },
              { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-red-400", sub: "All categories" },
              { label: "Profit Margin", value: `${margin}%`, icon: Percent, color: "text-emerald-400", sub: `Net: $${profit.toLocaleString()}` },
              { label: "Best Month", value: bestMonth.month, icon: Award, color: "text-amber-400", sub: `$${bestMonth.income.toLocaleString()} income` },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <p className="text-slate-400 text-xs font-medium">{label}</p>
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <ReportsChartsWrapper />

          {/* Category breakdown table */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Category Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">% of Total</th>
                    <th className="px-6 py-3 w-48"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {expenseCategories.sort((a, b) => b.value - a.value).map(cat => {
                    const pct = ((cat.value / totalExpenses) * 100).toFixed(1);
                    return (
                      <tr key={cat.name} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-sm font-medium text-slate-200">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm font-semibold text-white text-right">${cat.value.toLocaleString()}</td>
                        <td className="px-6 py-3.5 text-sm text-slate-400 text-right">{pct}%</td>
                        <td className="px-6 py-3.5">
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: cat.color }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

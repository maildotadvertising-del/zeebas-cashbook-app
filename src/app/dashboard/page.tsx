import Sidebar from "@/components/Sidebar";
import DashboardChartsWrapper from "@/components/DashboardChartsWrapper";
import { invoices, expenses, recentTransactions } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Wallet, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

function StatCard({ title, value, icon: Icon, trend, trendLabel, color }: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color: string;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {trendLabel && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-400"}`}>
          {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
          {trendLabel}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const totalIncome = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const pendingCount = invoices.filter(i => i.status === "pending").length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-0.5">Welcome back, Zeeba. Here&apos;s your financial overview.</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Income"
              value={`$${totalIncome.toLocaleString()}`}
              icon={TrendingUp}
              trend="up"
              trendLabel="+12% from last month"
              color="bg-indigo-600"
            />
            <StatCard
              title="Total Expenses"
              value={`$${totalExpenses.toLocaleString()}`}
              icon={TrendingDown}
              trend="down"
              trendLabel="+3% from last month"
              color="bg-red-500"
            />
            <StatCard
              title="Net Balance"
              value={`$${netBalance.toLocaleString()}`}
              icon={Wallet}
              trend="up"
              trendLabel="Healthy balance"
              color="bg-emerald-600"
            />
            <StatCard
              title="Pending Invoices"
              value={String(pendingCount)}
              icon={Clock}
              trendLabel={`${invoices.filter(i => i.status === "overdue").length} overdue`}
              trend="down"
              color="bg-amber-500"
            />
          </div>

          {/* Chart */}
          <DashboardChartsWrapper />

          {/* Recent Transactions */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            </div>
            <div className="divide-y divide-slate-700/30">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-700/20 transition">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "income" ? "bg-indigo-600/20" : "bg-red-500/20"}`}>
                    {tx.type === "income"
                      ? <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                      : <ArrowDownRight className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500">{tx.date} &middot; {tx.category}</p>
                  </div>
                  <div className={`text-sm font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                    {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ExpenseForm from "@/components/ExpenseForm";
import { expenses as initialExpenses, Expense } from "@/lib/mockData";
import { Plus, Filter, Trash2 } from "lucide-react";

const CATEGORIES = ["All", "Infrastructure", "Software", "Food & Dining", "Transport", "Utilities", "Office", "Staff", "Education"];

const CATEGORY_COLORS: Record<string, string> = {
  Infrastructure: "bg-indigo-500/10 text-indigo-400",
  Software: "bg-violet-500/10 text-violet-400",
  "Food & Dining": "bg-cyan-500/10 text-cyan-400",
  Transport: "bg-emerald-500/10 text-emerald-400",
  Utilities: "bg-amber-500/10 text-amber-400",
  Office: "bg-red-500/10 text-red-400",
  Staff: "bg-pink-500/10 text-pink-400",
  Education: "bg-teal-500/10 text-teal-400",
  Marketing: "bg-orange-500/10 text-orange-400",
  Other: "bg-slate-500/10 text-slate-400",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = expenses.filter(e =>
    activeCategory === "All" || e.category === activeCategory
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleAdd = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Expenses</h1>
              <p className="text-slate-400 mt-0.5">Track and manage your business expenses</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Expenses", value: `$${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}` },
              { label: "This Filter", value: `$${total.toLocaleString()}` },
              { label: "# Transactions", value: filtered.length },
              { label: "Avg per Transaction", value: filtered.length ? `$${(total / filtered.length).toFixed(0)}` : "$0" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
                <p className="text-xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filtered.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="px-4 py-3.5 text-sm text-slate-400">{exp.date}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-200 font-medium">{exp.description}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[exp.category] || "bg-slate-500/10 text-slate-400"}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-white text-right">${exp.amount.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                        No expenses in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-700/50 bg-slate-900/30">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-slate-300">
                      Total ({filtered.length} items)
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-white">${total.toLocaleString()}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showForm && <ExpenseForm onAdd={handleAdd} onClose={() => setShowForm(false)} />}
    </div>
  );
}

"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Expense } from "@/lib/mockData";

const CATEGORIES = [
  "Infrastructure", "Software", "Food & Dining", "Transport",
  "Utilities", "Office", "Staff", "Education", "Marketing", "Other",
];

interface Props {
  onAdd: (expense: Expense) => void;
  onClose: () => void;
}

export default function ExpenseForm({ onAdd, onClose }: Props) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "Software",
    amount: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError("Enter a valid amount."); return; }
    onAdd({
      id: Date.now().toString(),
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      amount: parseFloat(form.amount),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Add Expense</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <input
              type="text"
              placeholder="e.g. AWS hosting fee"
              value={form.description}
              onChange={(e) => { setForm({ ...form, description: e.target.value }); setError(""); }}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => { setForm({ ...form, amount: e.target.value }); setError(""); }}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-700 transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

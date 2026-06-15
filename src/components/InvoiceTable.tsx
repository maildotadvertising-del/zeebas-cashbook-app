"use client";
import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { invoices, Invoice } from "@/lib/mockData";

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  overdue: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TABS = ["All", "Paid", "Pending", "Overdue"] as const;
type Tab = (typeof TABS)[number];

const PAGE_SIZE = 8;

export default function InvoiceTable() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [page, setPage] = useState(1);

  const filtered = invoices.filter((inv: Invoice) => {
    const matchTab =
      activeTab === "All" || inv.status === activeTab.toLowerCase();
    const matchSearch =
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.description.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const totalAmount = filtered.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-4">
      {/* Search + tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
          />
        </div>
        <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {paginated.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-mono text-indigo-400">{inv.number}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-200">{inv.client}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-400 hidden md:table-cell max-w-[200px] truncate">{inv.description}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-white">${inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-400 hidden sm:table-cell">{inv.date}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-400 hidden sm:table-cell">{inv.dueDate}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="text-slate-500 hover:text-indigo-400 transition">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/50 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {filtered.length} invoices &middot; Total:{" "}
            <span className="text-white font-semibold">${totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-400">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

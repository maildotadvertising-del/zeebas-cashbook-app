import Sidebar from "@/components/Sidebar";
import InvoiceTable from "@/components/InvoiceTable";
import { invoices } from "@/lib/mockData";
import { FileText, DollarSign, Clock, AlertCircle, Plus } from "lucide-react";

export default function InvoicesPage() {
  const paid = invoices.filter(i => i.status === "paid");
  const pending = invoices.filter(i => i.status === "pending");
  const overdue = invoices.filter(i => i.status === "overdue");
  const paidTotal = paid.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Invoices</h1>
              <p className="text-slate-400 mt-0.5">Manage and track your invoices</p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/20">
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Invoices", value: invoices.length, icon: FileText, color: "text-indigo-400" },
              { label: "Paid", value: `$${paidTotal.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
              { label: "Pending", value: pending.length, icon: Clock, color: "text-amber-400" },
              { label: "Overdue", value: overdue.length, icon: AlertCircle, color: "text-red-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <p className="text-slate-400 text-xs font-medium">{label}</p>
                </div>
                <p className="text-xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <InvoiceTable />
        </div>
      </main>
    </div>
  );
}

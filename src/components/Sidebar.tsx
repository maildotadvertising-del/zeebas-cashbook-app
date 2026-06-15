"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out min-h-screen`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="flex-shrink-0 w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight">Zeeba&apos;s</p>
            <p className="text-indigo-400 text-xs font-medium">Cashbook</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-800 p-2 space-y-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          title={collapsed ? "Notifications" : undefined}
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Notifications</span>}
        </button>

        {/* User profile */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition-all ${collapsed ? "justify-center" : ""}`}>
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">Zeeba Admin</p>
              <p className="text-xs text-slate-500 truncate">demo@cashbook.io</p>
            </div>
          )}
          {!collapsed && <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400 transition" />}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all text-xs"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

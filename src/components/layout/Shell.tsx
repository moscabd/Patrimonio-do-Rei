"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ClipboardCheck,
  FileText,
  Bell,
  Search,
  UserCircle,
  Crown,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Patrimônios", href: "/assets" },
  { icon: ArrowLeftRight, label: "Movimentações", href: "/movements" },
  { icon: ClipboardCheck, label: "Auditoria", href: "/audit" },
  { icon: FileText, label: "Documentos", href: "/documents" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 border-r border-border bg-card flex flex-col
        transform transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Crown Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center gold-glow">
              <Crown className="w-6 h-6 text-background crown-icon" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight gold-shimmer block leading-tight">
                Patrimônio do Rei
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                Gestão Patrimonial
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                  transition-all duration-200 slide-in
                  ${isActive
                    ? "bg-secondary/15 text-secondary border border-secondary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  }
                `}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-secondary" : ""}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary gold-glow" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status Footer */}
        <div className="p-4 border-t border-border">
          <div className="bg-muted/50 px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Online</p>
              <p className="text-xs font-semibold text-muted-foreground">Sistema protegido</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar patrimônios..."
                className="w-full bg-muted/50 border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-muted-foreground hover:text-secondary transition-colors rounded-lg hover:bg-muted">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            </button>
            <div className="hidden sm:flex items-center gap-3 border-l border-border pl-3 ml-1">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground leading-tight">Admin</p>
                <p className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-secondary/15 border border-secondary/20 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}

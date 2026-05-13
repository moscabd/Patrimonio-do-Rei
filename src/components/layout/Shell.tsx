"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  ClipboardCheck, 
  FileText, 
  Settings, 
  Bell,
  Search,
  UserCircle,
  Crown
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard Real", href: "/" },
  { icon: Package, label: "Acervo de Patrimônio", href: "/assets" },
  { icon: ArrowLeftRight, label: "Movimentações", href: "/movements" },
  { icon: ClipboardCheck, label: "Auditoria Régia", href: "/audit" },
  { icon: FileText, label: "Documentação", href: "/documents" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Sidebar - Royal Blue with Gold Accents */}
      <aside className="w-72 border-r border-secondary/30 bg-primary/5 flex flex-col shadow-xl">
        <div className="p-8">
          <h1 className="text-xl font-black tracking-tighter text-primary flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary shadow-lg shadow-secondary/40">
              <Crown className="w-6 h-6" />
            </div>
            <span className="uppercase italic">Inventário do Rei</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-secondary text-primary shadow-md" 
                    : "text-primary/60 hover:bg-secondary/10 hover:text-primary"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-secondary"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-secondary/20">
          <div className="bg-secondary/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-600">Sistema Online</p>
              <p className="text-xs font-bold text-primary">Soberania Garantida</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-secondary/20 bg-white/50 backdrop-blur-md flex items-center justify-between px-10">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary transition-colors group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="Busca em todo o Reino..." 
                className="w-full bg-secondary/5 border-2 border-secondary/20 rounded-full py-3 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-primary/60 hover:text-primary transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-4 border-l border-secondary/20 pl-6">
              <div className="text-right">
                <p className="text-sm font-black text-primary">Gran Admin</p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Acesso Vitalício</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-lg shadow-secondary/30">
                <UserCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <section className="flex-1 overflow-y-auto p-10 bg-background/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}

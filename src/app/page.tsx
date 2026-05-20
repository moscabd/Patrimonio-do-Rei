import Shell from "@/components/layout/Shell";
import {
  Package,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Crown
} from "lucide-react";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export default async function Dashboard() {
  const user = await requireAuth();
  const totalAssets = await prisma.asset.count();
  const activeAssets = await prisma.asset.count({ where: { status: { in: ['ACTIVE', 'IN_USE'] } } });
  const maintenanceAssets = await prisma.asset.count({ where: { status: 'MAINTENANCE' } });
  
  // Agrupar por categoria
  const categories = await prisma.asset.groupBy({
    by: ['category'],
    _count: { category: true }
  });

  const stats = [
    { label: "Acervo Total", value: totalAssets.toString(), icon: Package, color: "text-blue-400", bg: "bg-blue-500/15", trend: "100%" },
    { label: "Em Pleno Uso", value: activeAssets.toString(), icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15", trend: totalAssets > 0 ? `${Math.round((activeAssets/totalAssets)*100)}%` : "0%" },
    { label: "Em Manutenção", value: maintenanceAssets.toString(), icon: Wrench, color: "text-amber-400", bg: "bg-amber-500/15", trend: totalAssets > 0 ? `${Math.round((maintenanceAssets/totalAssets)*100)}%` : "0%" },
    { label: "Alertas", value: "0", icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/15", trend: "0" },
  ];
  return (
    <Shell user={user}>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="animate-in flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card rounded-2xl p-6 lg:p-8 border border-border">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center gold-glow shrink-0">
              <Crown className="w-8 h-8 text-background crown-icon" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">
                Sala de Comando
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Visão consolidada do tesouro patrimonial do Reino.
              </p>
            </div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Integridade</p>
              <p className="text-sm font-black text-emerald-300">100% Protegido</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`animate-in animate-in-delay-${i + 1} bg-card border border-border p-5 lg:p-6 rounded-2xl card-hover relative overflow-hidden group`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {stat.trend} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <div className="mt-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl lg:text-4xl font-black text-foreground mt-1 count-up" style={{ animationDelay: `${(i + 1) * 0.15}s` }}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className="absolute -bottom-4 -right-4 w-24 h-24 text-secondary/5 rotate-12 group-hover:rotate-0 group-hover:text-secondary/10 transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 animate-in animate-in-delay-2 bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Valorização do Acervo
              </h3>
              <select className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none">
                <option>12 Meses</option>
              </select>
            </div>
            {/* Simulated chart bars */}
            <div className="flex items-end gap-2 h-52">
              {[40, 55, 35, 70, 60, 80, 45, 90, 65, 75, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-secondary/20 hover:bg-secondary/40 transition-colors relative group"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
                  >
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-secondary/60 group-hover:bg-secondary transition-all duration-300"
                      style={{ height: `${h * 0.7}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-muted-foreground font-semibold">
                    {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 animate-in animate-in-delay-3 bg-primary rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-secondary" />
              Distribuição
            </h3>
            <div className="space-y-5 relative z-10">
              {categories.slice(0,4).map((c, i) => (
                <CategoryBar key={c.category} label={c.category} percent={totalAssets > 0 ? Math.round((c._count.category / totalAssets) * 100) : 0} color={["bg-secondary", "bg-emerald-400", "bg-amber-400", "bg-blue-400"][i] || "bg-muted"} />
              ))}
              {categories.length === 0 && <p className="text-xs text-white/50 text-center mt-8">Nenhum dado cadastrado.</p>}
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/8 rounded-full -mr-24 -mt-24 blur-3xl" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="animate-in animate-in-delay-4 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Movimentações Recentes</h3>
            <button className="text-xs font-bold text-secondary hover:text-secondary/80 transition-colors uppercase tracking-wider">
              Ver tudo →
            </button>
          </div>
          <div className="divide-y divide-border">
            {[
              { name: "MacBook Pro M3 #001", action: "Transferido para Engenharia", time: "5 min", status: "ok" },
              { name: "Monitor Dell 4K #012", action: "Empréstimo a Home Office", time: "22 min", status: "pending" },
              { name: "Servidor R750 #003", action: "Manutenção preventiva concluída", time: "1h", status: "ok" },
            ].map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/10">
                    <Package className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.action}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">Há {item.time}</span>
                  <div className={`w-2 h-2 rounded-full ${item.status === "ok" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function CategoryBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-white/80">
        <span>{label}</span>
        <span className="text-secondary">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

import Shell from "@/components/layout/Shell";
import {
  ArrowLeftRight,
  ArrowRight,
  Plus,
  Search,
  Calendar,
  User,
  Package,
  Zap
} from "lucide-react";

import prisma from "@/lib/prisma";

const typeConfig: Record<string, { icon: typeof ArrowLeftRight; color: string; bg: string; label: string }> = {
  TRANSFER: { icon: ArrowLeftRight, color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/20", label: "Transferência" },
  LOAN: { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/20", label: "Empréstimo" },
  RETURN: { icon: Package, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20", label: "Devolução" },
};

export default async function MovementsPage() {
  const movements = await prisma.movement.findMany({
    include: { asset: true, performedBy: true },
    orderBy: { createdAt: 'desc' }
  });

  const transfers = movements.filter(m => m.type.includes('TRANSFER')).length;
  const loans = movements.filter(m => m.type === 'LOAN').length;
  const returns = movements.filter(m => m.type === 'RETURN').length;

  return (
    <Shell>
      <div className="space-y-6">
        <div className="animate-in flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">Movimentações</h2>
            <p className="text-muted-foreground text-sm mt-1">Rastreabilidade completa de cada bem patrimonial.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20">
            <Plus className="w-4 h-4" /> Nova Movimentação
          </button>
        </div>

        {/* Stats */}
        <div className="animate-in animate-in-delay-1 grid grid-cols-3 gap-4">
          {[
            { icon: ArrowLeftRight, label: "Transferências", value: transfers.toString(), color: "text-blue-400" },
            { icon: Zap, label: "Empréstimos", value: loans.toString(), color: "text-amber-400" },
            { icon: Package, label: "Devoluções", value: returns.toString(), color: "text-emerald-400" },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border p-4 lg:p-6 rounded-2xl flex items-center gap-4 card-hover">
              <div className={`p-3 rounded-xl bg-muted ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-black text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Movement List */}
        <div className="animate-in animate-in-delay-2 bg-card border border-border rounded-2xl overflow-hidden">
          {movements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
              <ArrowLeftRight className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-bold text-foreground">Nenhuma movimentação registrada</p>
              <p className="text-xs mt-1">Os registros de transferência, empréstimo e devolução aparecerão aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {movements.map((mov) => {
                const cfg = typeConfig[mov.type] || typeConfig['TRANSFER'];
                const Icon = cfg.icon;
                return (
                  <div key={mov.id} className="p-4 lg:p-6 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cfg.bg} ${cfg.color} shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm lg:text-base font-bold text-foreground">{mov.asset?.name}</span>
                          <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/15 px-2 py-0.5 rounded font-bold">{mov.asset?.tagNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                          <span>{mov.originId || "Geral"}</span>
                          <ArrowRight className="w-3 h-3 text-secondary" />
                          <span className="font-semibold text-foreground">{mov.destinationId || "Em Uso"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-10 ml-16 sm:ml-0">
                      <div className="text-right text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                          <User className="w-3 h-3 text-secondary" /> {mov.performedBy?.name || "Sistema"}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-1 justify-end">
                          <Calendar className="w-3 h-3" /> {new Date(mov.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/20`}>
                        Concluído
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

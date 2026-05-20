import Shell from "@/components/layout/Shell";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Trash2,
  Gift,
  AlertTriangle,
  Wrench,
  AlertCircle,
  Plus,
  Download,
  FileDown
} from "lucide-react";
import Link from "next/link";

const reasonConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  DESCARTADA: { icon: Trash2, color: "text-red-400", bg: "bg-red-500/15 border-red-500/20", label: "Descartado" },
  DOADA: { icon: Gift, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20", label: "Doado" },
  QUEBROU: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/20", label: "Quebrou" },
  ESTRAGOU: { icon: Wrench, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/20", label: "Estragou" },
  ROUBADA: { icon: AlertCircle, color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/20", label: "Roubado" },
  PERDIDA: { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-500/15 border-gray-500/20", label: "Perdido" },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatValue(value: any): string {
  return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

export default async function DisposalsPage() {
  const user = await requireAuth();

  let disposals: any[] = [];
  try {
    disposals = await prisma.disposal.findMany({
      orderBy: { date: 'desc' }
    });
  } catch (error) {
    console.error('Erro ao carregar descartes:', error);
  }

  const totalItems = disposals.reduce((sum, d) => sum + d.quantity, 0);
  const totalValue = disposals.reduce((sum, d) => sum + Number(d.value), 0);

  const byReason = disposals.reduce((acc: Record<string, { count: number; value: number }>, d) => {
    if (!acc[d.reason]) acc[d.reason] = { count: 0, value: 0 };
    acc[d.reason].count += d.quantity;
    acc[d.reason].value += Number(d.value);
    return acc;
  }, {});

  return (
    <Shell user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-in flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">Descarte e Doação</h2>
            <p className="text-muted-foreground text-sm mt-1">{totalItems} itens • {formatValue(totalValue)} total</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.open('/api/disposals-pdf', '_blank')}
              className="flex items-center gap-2 px-4 py-2.5 border border-secondary/30 text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/10 transition-all"
            >
              <FileDown className="w-4 h-4" /> Relatório PDF
            </button>
            <Link
              href="/disposals/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20"
            >
              <Plus className="w-4 h-4" /> Novo Registro
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(byReason).map(([reason, stats]) => {
            const config = reasonConfig[reason] || { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted border-border", label: reason };
            const Icon = config.icon;
            return (
              <div key={reason} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{config.label}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-foreground">{stats.count}</span>
                  <span className="text-sm font-semibold text-muted-foreground">{formatValue(stats.value)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Descrição</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">Qtd</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Valor</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Data</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">Motivo</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {disposals.map((d) => {
                  const config = reasonConfig[d.reason] || { color: "text-muted-foreground", bg: "bg-muted border-border", label: d.reason };
                  return (
                    <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">{d.description}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-foreground">{d.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-foreground">
                        {formatValue(d.value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(d.date)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {d.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-border">
            {disposals.map((d) => {
              const config = reasonConfig[d.reason] || { color: "text-muted-foreground", bg: "bg-muted border-border", label: d.reason };
              return (
                <div key={d.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(d.date)}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{d.quantity}x</span>
                    <span className="font-bold text-foreground">{formatValue(d.value)}</span>
                  </div>
                  {d.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{d.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}

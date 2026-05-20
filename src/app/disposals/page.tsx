import Shell from "@/components/layout/Shell";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PdfButton from "@/components/disposals/PdfButton";
import DisposalList from "@/components/disposals/DisposalList";
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

export const dynamic = 'force-dynamic';

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
            <p className="text-muted-foreground text-sm mt-1">{totalItems} itens - {formatValue(totalValue)} total</p>
          </div>
          <div className="flex gap-3">
            <PdfButton />
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

        <DisposalList disposals={disposals} />
      </div>
    </Shell>
  );
}

import Shell from "@/components/layout/Shell";
import {
  Plus,
  Filter,
  Search,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import AssetToolbar from "@/components/assets/AssetToolbar";

const statusStyles: Record<string, string> = {
  "ACTIVE": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "IN_USE": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "MAINTENANCE": "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const statusLabels: Record<string, string> = {
  "ACTIVE": "Ativo",
  "IN_USE": "Em Uso",
  "MAINTENANCE": "Em Manutenção",
};

export default async function AssetsPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 15; // 15 itens por página

  const totalAssets = await prisma.asset.count();
  const totalPages = Math.ceil(totalAssets / pageSize) || 1;

  // Backend Specialist: Buscando dados REAIS do PostgreSQL/Supabase via Prisma com Paginação
  const assets = await prisma.asset.findMany({
    orderBy: { tagNumber: 'asc' },
    skip: (currentPage - 1) * pageSize,
    take: pageSize
  });

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-in flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">Patrimônios</h2>
            <p className="text-muted-foreground text-sm mt-1">Dados validados direto do Banco de Dados Real.</p>
          </div>
          <AssetToolbar assets={assets} />
        </div>

        {/* Search */}
        <div className="animate-in animate-in-delay-1 bg-card border border-border p-3 rounded-xl flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por nome, código ou categoria..."
              className="w-full bg-muted/50 border-none rounded-lg py-2.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold text-foreground transition-colors">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        {/* Table */}
        <div className="animate-in animate-in-delay-2 bg-card border border-border rounded-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Código</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Item</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Valor</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-secondary bg-secondary/10 border border-secondary/15 px-2.5 py-1 rounded-md">
                        {asset.tagNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">{asset.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{asset.category}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border ${statusStyles[asset.status] || "bg-muted text-muted-foreground border-border"}`}>
                        {statusLabels[asset.status] || asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {asset.currentValue ? `R$ ${asset.currentValue.toString().replace('.', ',')}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/assets/${asset.id}`} className="inline-flex p-2 bg-secondary/10 hover:bg-secondary rounded-lg text-secondary hover:text-background transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {assets.map((asset) => (
              <Link key={asset.id} href={`/assets/${asset.id}`} className="block p-4 hover:bg-muted/20 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/15 px-2 py-0.5 rounded">{asset.tagNumber}</span>
                    <p className="text-sm font-bold text-foreground mt-2">{asset.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{asset.category}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${statusStyles[asset.status] || ""}`}>
                    {statusLabels[asset.status] || asset.status}
                  </span>
                  <span className="text-sm font-bold text-secondary">
                    {asset.currentValue ? `R$ ${asset.currentValue.toString().replace('.', ',')}` : '-'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Total de {totalAssets} patrimônios no banco (Página {currentPage} de {totalPages})
            </span>
            <div className="flex gap-2">
              {currentPage > 1 ? (
                <Link href={`/assets?page=${currentPage - 1}`} className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-foreground">Anterior</Link>
              ) : (
                <button disabled className="px-3 py-1.5 border border-border/50 rounded-lg text-muted-foreground opacity-50 cursor-not-allowed">Anterior</button>
              )}
              
              <button className="px-3 py-1.5 bg-secondary text-background rounded-lg font-bold">{currentPage}</button>
              
              {currentPage < totalPages ? (
                <Link href={`/assets?page=${currentPage + 1}`} className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-foreground">Próximo</Link>
              ) : (
                <button disabled className="px-3 py-1.5 border border-border/50 rounded-lg text-muted-foreground opacity-50 cursor-not-allowed">Próximo</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

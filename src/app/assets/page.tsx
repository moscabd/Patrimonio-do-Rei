import Shell from "@/components/layout/Shell";
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import AssetToolbar from "@/components/assets/AssetToolbar";

const statusStyles: Record<string, string> = {
  "ACTIVE": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "IN_USE": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "MAINTENANCE": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "RETIRED": "bg-gray-500/15 text-gray-400 border-gray-500/20",
  "MISSING": "bg-red-500/15 text-red-400 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  "ACTIVE": "Ativo",
  "IN_USE": "Em Uso",
  "MAINTENANCE": "Manutenção",
  "RETIRED": "Baixado",
  "MISSING": "Extraviado",
};

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatValue(value: any): string {
  if (!value) return '-';
  return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function getPageNumbers(total: number): number[] {
  return Array.from({ length: total }, (_, i) => i + 1);
}

export default async function AssetsPage({ searchParams }: { searchParams: { page?: string; category?: string; search?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  const selectedCategory = searchParams.category || '';
  const searchTerm = searchParams.search || '';
  const pageSize = 50;

  // Build filter
  const whereFilter: any = {};
  
  if (selectedCategory) {
    whereFilter.category = selectedCategory;
  }
  
  if (searchTerm) {
    whereFilter.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { tagNumber: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  const totalAssets = await prisma.asset.count({ where: whereFilter });
  const totalPages = Math.ceil(totalAssets / pageSize) || 1;

  const assets = await prisma.asset.findMany({
    where: whereFilter,
    orderBy: { name: 'asc' },
    skip: (currentPage - 1) * pageSize,
    take: pageSize
  });

  // Get all unique categories for filter
  const categories = await prisma.asset.findMany({
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' }
  });

  return (
    <Shell>
      <div className="space-y-6">
        <div className="animate-in flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">Patrimônios</h2>
            <p className="text-muted-foreground text-sm mt-1">{totalAssets} itens cadastrados</p>
          </div>
          <AssetToolbar assets={assets} />
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 max-w-md">
          <form className="flex-1 flex gap-2" method="GET" action="/assets">
            <input
              type="text"
              name="search"
              placeholder="Buscar por nome ou código..."
              defaultValue={searchTerm}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
            {searchTerm && (
              <Link
                href="/assets"
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                title="Limpar busca"
              >
                ✕
              </Link>
            )}
          </form>
        </div>

        {/* Category Filter - Subtle */}
        <div className="flex gap-2 flex-wrap items-center text-xs">
          <span className="text-muted-foreground font-semibold">Categoria:</span>
          <Link
            href="/assets"
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              !selectedCategory
                ? 'bg-secondary/20 text-secondary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.category}
              href={`/assets?category=${encodeURIComponent(cat.category || '')}`}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                selectedCategory === cat.category
                  ? 'bg-secondary/20 text-secondary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.category || 'Sem categoria'}
            </Link>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Código</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Nome do Item</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Categoria</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Local</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Valor</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-secondary bg-secondary/10 border border-secondary/15 px-2 py-1 rounded">
                        {asset.tagNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/assets/${asset.id}`} className="block">
                        <p className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors line-clamp-1">{asset.name}</p>
                        {asset.subcategory && (
                          <p className="text-[10px] text-muted-foreground">{asset.subcategory}</p>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{asset.category || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{asset.physicalLocation || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">
                      {formatValue(asset.currentValue || asset.acquisitionValue)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${statusStyles[asset.status] || "bg-muted text-muted-foreground border-border"}`}>
                        {statusLabels[asset.status] || asset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-border">
            {assets.map((asset) => (
              <Link key={asset.id} href={`/assets/${asset.id}`} className="block p-4 hover:bg-muted/20 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/15 px-2 py-0.5 rounded">
                        {asset.tagNumber}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyles[asset.status] || ""}`}>
                        {statusLabels[asset.status] || asset.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{asset.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{asset.category}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{asset.physicalLocation || '-'}</span>
                  </div>
                  <span className="font-bold text-secondary">
                    {formatValue(asset.currentValue || asset.acquisitionValue)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground sticky bottom-0 z-40">
            <span>Página {currentPage} de {totalPages}</span>
            <div className="flex items-center gap-1">
              {currentPage > 1 ? (
                <Link href={`/assets?page=${currentPage - 1}`} className="p-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="p-1.5 border border-border/50 rounded-lg text-muted-foreground opacity-50 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <div className="flex gap-1 flex-wrap items-center max-h-36 overflow-auto p-1">
                {getPageNumbers(totalPages).map(page => (
                  <Link
                    key={page}
                    href={`/assets?page=${page}`}
                    className={`whitespace-nowrap min-w-[32px] px-2 py-1.5 text-center rounded-lg font-bold transition-colors ${
                      page === currentPage
                        ? 'bg-secondary text-background'
                        : 'border border-border hover:bg-muted text-foreground'
                    }`}
                  >
                    {page}
                  </Link>
                ))}
              </div>

              {currentPage < totalPages ? (
                <Link href={`/assets?page=${currentPage + 1}`} className="p-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="p-1.5 border border-border/50 rounded-lg text-muted-foreground opacity-50 cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

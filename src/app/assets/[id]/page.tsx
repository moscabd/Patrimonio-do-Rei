import Shell from "@/components/layout/Shell";
import {
  ArrowLeft,
  Edit3,
  History,
  FileText,
  Info,
  ShieldCheck,
  Download,
  Clock,
  Plus,
  Star
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DetailTabs from "@/components/assets/DetailTabs";

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const asset = await prisma.asset.findUnique({
    where: { id: params.id }
  });

  if (!asset) {
    notFound();
  }

  const statusLabels: Record<string, string> = {
    "ACTIVE": "Ativo",
    "IN_USE": "Em Uso",
    "MAINTENANCE": "Em Manutenção",
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-in flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <Link href="/assets" className="p-2.5 bg-card border border-border hover:bg-secondary/10 hover:border-secondary/20 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-secondary bg-secondary/10 border border-secondary/15 px-2.5 py-1 rounded-md">{asset.tagNumber}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">{statusLabels[asset.status] || asset.status}</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-foreground mt-2">{asset.name}</h2>
            </div>
          </div>
          <div className="flex gap-3 ml-12 sm:ml-0">
            <button className="flex items-center gap-2 px-4 py-2 border border-secondary/30 text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/10 transition-all">
              <Edit3 className="w-4 h-4" /> Editar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20">
              <Star className="w-4 h-4" /> Favoritar
            </button>
          </div>
        </div>

        {/* Client Component para as abas para manter a interatividade */}
        <DetailTabs asset={asset as any} />
      </div>
    </Shell>
  );
}

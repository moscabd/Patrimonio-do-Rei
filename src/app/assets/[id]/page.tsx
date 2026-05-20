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
  Star,
  FileDown
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DetailTabs from "@/components/assets/DetailTabs";
import { requireAuth } from "@/lib/auth";

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const user = await requireAuth();
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
    <Shell user={user}>
      <div className="space-y-6">
        {/* PDF Download Button */}
        <div className="flex justify-end">
          <a
            href={`/api/pdf?id=${asset.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20"
          >
            <FileDown className="w-4 h-4" />
            Gerar PDF do Patrimônio
          </a>
        </div>

        {/* Client Component para as abas e header para manter a interatividade */}
        <DetailTabs asset={asset as any} />
      </div>
    </Shell>
  );
}

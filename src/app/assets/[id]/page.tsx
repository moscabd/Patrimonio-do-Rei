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
        {/* Client Component para as abas e header para manter a interatividade */}
        <DetailTabs asset={asset as any} />
      </div>
    </Shell>
  );
}

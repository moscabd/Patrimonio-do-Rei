import Shell from "@/components/layout/Shell";
import {
  FileText,
  Search,
  Upload,
  Download,
  Eye,
  Star,
  FileImage,
  FolderOpen,
} from "lucide-react";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const typeIcon: Record<string, { color: string; bg: string }> = {
  PDF: { color: "text-emerald-400", bg: "bg-emerald-500/15" },
  IMAGE: { color: "text-blue-400", bg: "bg-blue-500/15" },
  WORD: { color: "text-amber-400", bg: "bg-amber-500/15" },
};

export default async function DocumentsPage() {
  const user = await requireAuth();
  const files = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <Shell user={user}>
      <div className="space-y-6">
        <div className="animate-in flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">Documentos</h2>
            <p className="text-muted-foreground text-sm mt-1">Arquivos e evidências do acervo patrimonial.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20">
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="space-y-4 animate-in animate-in-delay-1">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-4">Categorias</h3>
              <nav className="space-y-1">
                <NavItem label="Todos" active />
                <NavItem label="Favoritos" />
                <NavItem label="Recentes" />
              </nav>
            </div>
            <div className="bg-primary rounded-2xl p-5 border-b-4 border-secondary">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">Segurança</p>
              <p className="text-xs text-white/70 leading-relaxed">Documentos criptografados com redundância tripla.</p>
            </div>
          </aside>

          {/* Files */}
          <div className="lg:col-span-3 space-y-4">
            <div className="animate-in animate-in-delay-2 bg-card border border-border p-3 rounded-xl flex items-center gap-3">
              <Search className="w-4 h-4 text-muted-foreground ml-2" />
              <input
                type="text"
                placeholder="Buscar por nome ou conteúdo..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {files.length === 0 ? (
              <div className="bg-card border border-border p-8 rounded-2xl text-center text-muted-foreground flex flex-col items-center">
                <FileText className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-bold text-foreground">Nenhum documento encontrado</p>
                <p className="text-xs mt-1">Notas fiscais, fotos e contratos vinculados aos patrimônios aparecerão aqui.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {files.map((file, i) => {
                  const t = typeIcon[file.type] || typeIcon.PDF;
                  return (
                    <div
                      key={file.id}
                      className={`animate-in animate-in-delay-${i + 1} bg-card border border-border p-5 rounded-2xl card-hover group relative`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${t.bg}`}>
                          {file.type === "PHOTO" ? <FileImage className={`w-6 h-6 ${t.color}`} /> : <FileText className={`w-6 h-6 ${t.color}`} />}
                        </div>
                        {file.isFavorite && <Star className="w-4 h-4 text-secondary fill-secondary" />}
                      </div>

                      <h4 className="text-sm font-bold text-foreground truncate">{file.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{(Number(file.size)/1024/1024).toFixed(1)} MB • {new Date(file.createdAt).toLocaleDateString()}</p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/15 px-2 py-0.5 rounded uppercase">
                          {file.type}
                        </span>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 bg-muted hover:bg-secondary rounded-lg text-muted-foreground hover:text-background transition-all">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 bg-muted hover:bg-secondary rounded-lg text-muted-foreground hover:text-background transition-all">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      active ? "bg-secondary/15 text-secondary border border-secondary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
    }`}>
      <FolderOpen className={`w-4 h-4 ${active ? "text-secondary" : ""}`} /> {label}
    </button>
  );
}

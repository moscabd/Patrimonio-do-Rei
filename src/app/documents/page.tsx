"use client";

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
  Plus
} from "lucide-react";

const files = [
  { id: "1", name: "Nota_Fiscal_Realeza_2024.pdf", type: "PDF", size: "1.2 MB", date: "12/03/24", tag: "Fiscal", favorite: true },
  { id: "2", name: "Manual_Servidor_Imperial.docx", type: "WORD", size: "3.5 MB", date: "13/03/24", tag: "Manual" },
  { id: "3", name: "Evidencia_Posse_RackA3.jpg", type: "IMAGE", size: "2.1 MB", date: "14/03/24", tag: "Evidência" },
];

export default function DocumentsPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex justify-between items-end border-b-4 border-secondary/20 pb-8">
          <div>
            <h2 className="text-4xl font-black text-primary tracking-tighter">Documentação Régia</h2>
            <p className="text-primary/60 font-medium mt-2 italic text-lg text-primary">Arquivos e evidências protegidos pela soberania do sistema.</p>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-sm font-black uppercase hover:bg-primary/90 transition-all shadow-xl border-b-4 border-secondary">
            <Upload className="w-5 h-5 text-secondary" /> Novo Upload
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav - Royal Style */}
          <aside className="space-y-4">
            <div className="bg-white border-2 border-secondary/20 rounded-3xl p-6 shadow-md">
               <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-6">Categorias</h3>
               <nav className="space-y-2">
                  <DocumentNavItem label="Todos os Atos" active />
                  <DocumentNavItem label="Favoritos Reais" />
                  <DocumentNavItem label="Recentes" />
               </nav>
            </div>
            
            <div className="bg-primary text-white rounded-3xl p-6 shadow-xl border-b-4 border-secondary">
               <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">Integridade</p>
               <p className="text-xs font-medium opacity-80 leading-relaxed">Todos os documentos são criptografados e armazenados com redundância tripla no Reino.</p>
            </div>
          </aside>

          {/* Files Grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border-2 border-secondary/20 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
               <Search className="w-5 h-5 text-secondary ml-2" />
               <input type="text" placeholder="Buscar no arquivo morto do Reino..." className="flex-1 bg-transparent border-none text-sm font-bold text-primary focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {files.map(file => (
                 <div key={file.id} className="bg-white border-2 border-secondary/10 p-6 rounded-[2rem] group hover:border-secondary transition-all relative shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                       <div className={`p-4 rounded-2xl ${
                         file.type === 'PDF' ? 'bg-emerald-100 text-emerald-600' : 
                         file.type === 'IMAGE' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                       } shadow-inner`}>
                          {file.type === 'IMAGE' ? <FileImage className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                       </div>
                       {file.favorite && <Star className="w-5 h-5 text-secondary fill-secondary animate-pulse" />}
                    </div>

                    <h4 className="text-sm font-black text-primary truncate pr-4">{file.name}</h4>
                    <p className="text-[10px] text-primary/40 font-bold uppercase mt-2 tracking-widest">{file.size} • {file.date}</p>

                    <div className="mt-6 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-primary bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-lg uppercase">{file.tag}</span>
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 bg-secondary/10 hover:bg-secondary rounded-xl text-secondary hover:text-primary transition-all"><Eye className="w-4 h-4" /></button>
                          <button className="p-2 bg-secondary/10 hover:bg-secondary rounded-xl text-secondary hover:text-primary transition-all"><Download className="w-4 h-4" /></button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function DocumentNavItem({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
      active ? "bg-secondary text-primary shadow-md" : "text-primary/40 hover:bg-secondary/10 hover:text-primary"
    }`}>
       <FolderOpen className={`w-4 h-4 ${active ? "text-primary" : "text-secondary"}`} /> {label}
    </button>
  );
}

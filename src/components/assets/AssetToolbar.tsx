"use client";

import { useState, useRef } from "react";
import { Plus, Download, Upload, X, Loader2 } from "lucide-react";
import { createAsset, importAssets } from "@/app/actions/asset";

export default function AssetToolbar({ assets }: { assets: any[] }) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exportar para CSV (Client side)
  const handleExport = () => {
    if (assets.length === 0) return;
    
    // Headers
    const csvContent = [
      ["Código", "Nome", "Categoria", "Status", "Valor"].join(";"),
      ...assets.map(a => [
        a.tagNumber,
        a.name,
        a.category,
        a.status,
        a.currentValue || ""
      ].join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `patrimonios_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Importar CSV
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    
    // Assumimos que a primeira linha é o header. 
    // Mapeamento: [0] Código, [1] Nome, [2] Categoria, [3] Status, [4] Valor
    const dataToImport = lines.slice(1).map(line => {
      const cols = line.split(";");
      return {
        tagNumber: cols[0]?.trim(),
        name: cols[1]?.trim(),
        category: cols[2]?.trim(),
        currentValue: cols[4]?.trim()
      };
    });

    try {
      await importAssets(dataToImport);
      alert("Planilha importada com sucesso!");
      setIsImportModalOpen(false);
    } catch (err) {
      alert("Erro ao importar. Verifique o formato.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-secondary/30 text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/10 transition-all"
        >
          <Upload className="w-4 h-4" /> Importar
        </button>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 border border-secondary/30 text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/10 transition-all"
        >
          <Download className="w-4 h-4" /> Exportar
        </button>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20"
        >
          <Plus className="w-4 h-4" /> Novo Patrimônio
        </button>
      </div>

      {/* Modal de Novo Patrimônio */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">Novo Patrimônio</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={async (formData) => {
              setLoading(true);
              try {
                await createAsset(formData);
                setIsNewModalOpen(false);
              } finally {
                setLoading(false);
              }
            }} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Código</label>
                <input name="tagNumber" required placeholder="Ex: REI-100" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nome do Item</label>
                <input name="name" required placeholder="Ex: Monitor Dell 4K" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Categoria</label>
                  <input name="category" required placeholder="Ex: TI" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                  <select name="status" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50">
                    <option value="ACTIVE">Ativo</option>
                    <option value="IN_USE">Em Uso</option>
                    <option value="MAINTENANCE">Manutenção</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Valor (R$)</label>
                <input name="currentValue" placeholder="Ex: 1500.00" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="flex-1 px-4 py-3 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar no Banco"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Importação */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">Importar CSV</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Faça o upload de uma planilha CSV separada por ponto-e-vírgula (;) com as colunas: <strong className="text-secondary">Código; Nome; Categoria; Status; Valor</strong>.
              </p>
              
              <input 
                type="file" 
                accept=".csv"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden" 
              />

              <button 
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-secondary/30 rounded-xl hover:bg-secondary/5 transition-all text-center group"
              >
                {loading ? (
                  <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-secondary/50 group-hover:text-secondary transition-colors mx-auto mb-2" />
                )}
                <span className="text-sm font-bold text-secondary">
                  {loading ? "Processando e Salvando..." : "Clique para Escolher o Arquivo"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

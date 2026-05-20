"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Download, Upload, X, Loader2, Trash2, FileDown } from "lucide-react";
import { createAsset, importAssets, deleteAllAssets } from "@/app/actions/asset";

export default function AssetToolbar({ assets }: { assets: any[] }) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Erro ao gerar exportação');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // filename comes from header but fallback
      link.setAttribute('download', `patrimonios_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.csv')) {
      alert('Por favor, use arquivo CSV. No Excel: Arquivo > Salvar Como > CSV');
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(l => l.trim().length > 0);
      
      if (lines.length < 2) {
        throw new Error('Arquivo vazio');
      }
      
      const header = lines[0].split(";").map(h => h.trim().toLowerCase().replace(/\r/g, ''));
      
      const dataToImport = lines.slice(1).map(line => {
        const cols = line.split(";").map(c => c.replace(/\r/g, '').trim());
        const get = (names: string[]) => {
          for (const name of names) {
            const idx = header.findIndex(h => h === name.toLowerCase());
            if (idx !== -1) return cols[idx];
          }
          return undefined;
        };
        return {
          tagNumber: get(["código", "codigo", "cod", "código bem", "codigo bem"]) || "",
          name: get(["nome", "descrição", "descricao", "item", "descrição do bem", "descricao do bem", "nome do item"]) || "",
          category: get(["categoria"]) || "Geral",
          currentValue: get(["valor", "value", "valor do bem"]) || "",
          physicalLocation: get(["local", "location", "local do bem"]) || "",
        };
      }).filter(item => item.tagNumber && item.name);

      if (dataToImport.length === 0) {
        throw new Error('Nenhum dado válido');
      }

      await importAssets(dataToImport);
      alert(`✅ Importados ${dataToImport.length} itens!`);
      setIsImportModalOpen(false);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao importar");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("Excluir TODOS os patrimônios?")) {
      setLoading(true);
      try {
        await deleteAllAssets();
        alert("Excluídos.");
      } catch(e) {
        alert("Erro.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGeneratePdf = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Gerando Relatório PDF...</title>
            <style>
              body {
                font-family: 'Inter', -apple-system, sans-serif;
                background-color: #0B0F19;
                color: #F3F4F6;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .spinner {
                border: 4px solid rgba(245, 158, 11, 0.1);
                border-left-color: #F59E0B;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin-bottom: 24px;
              }
              h2 {
                font-weight: 800;
                margin: 0 0 8px 0;
                letter-spacing: -0.025em;
              }
              p {
                color: #9CA3AF;
                font-size: 14px;
                margin: 0;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="spinner"></div>
            <h2>Gerando Relatório Patrimonial</h2>
            <p>Carregando dados do Supabase e estruturando tabelas do PDF...</p>
          </body>
        </html>
      `);
      newWindow.location.href = '/api/pdf/report';
    } else {
      alert("O navegador bloqueou a abertura do relatório. Por favor, permita pop-ups para este site para que possamos abrir o PDF!");
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={handleDeleteAll}
          disabled={loading || assets.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-500/10 transition-all disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
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
          onClick={handleGeneratePdf}
          className="flex items-center gap-2 px-4 py-2.5 border border-secondary/30 text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/10 transition-all"
        >
          <FileDown className="w-4 h-4" /> Relatório PDF
        </button>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20"
        >
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>

      {mounted && isNewModalOpen && createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
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
                <input name="tagNumber" required placeholder="Ex: 0001" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nome</label>
                <input name="name" required placeholder="Ex: Ar Condicionado" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Categoria</label>
                  <input name="category" required placeholder="Ex: Eletrônicos" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {mounted && isImportModalOpen && createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">Importar CSV</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                <p className="text-sm font-bold text-yellow-400 mb-2">⚠️ Importante:</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  O sistema aceita apenas <strong>CSV</strong>. Para converter seu Excel:<br/><br/>
                  1. Abra no Excel<br/>
                  2. <strong>Arquivo → Salvar Como</strong><br/>
                  3. Escolha <strong>CSV (separado por vírgulas)</strong><br/>
                  4. Use <strong>ponto-e-vírgula (;)</strong> como separador
                </p>
              </div>
              
              <button 
                onClick={() => {
                  const template = "Código Bem;Descrição do Bem;Cód Barras;Valor do Bem;Data Aquisição;Documento Fiscal;Local do Bem\n1.1.0001;AR CONDICIONADO;123456;650.00;01/01/2024;NF 001;DORMITÓRIO\n1.1.0002;GELADEIRA;789012;700.00;;;COZINHA";
                  const blob = new Blob(["\ufeff" + template], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", `modelo_importacao.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full py-2 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 font-bold text-xs rounded-lg transition-colors"
              >
                <Download className="w-3 h-3 inline-block mr-1" /> Baixar Modelo CSV
              </button>
              
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
                  {loading ? "Importando..." : "Escolher Arquivo CSV"}
                </span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

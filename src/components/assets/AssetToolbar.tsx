"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Download, Upload, X, Loader2, Trash2 } from "lucide-react";
import { createAsset, importAssets, deleteAllAssets } from "@/app/actions/asset";
import * as XLSX from 'xlsx';

export default function AssetToolbar({ assets }: { assets: any[] }) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Importar Planilha (CSV ou Excel)
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const fileName = file.name.toLowerCase();
      const isExcelFile = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

      let dataToImport: any[] = [];

      if (isExcelFile) {
        // Parse Excel no client-side
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        let currentCategory = '';
        let currentSubcategory = '';

        for (const row of data) {
          const code = String(row['__EMPTY_1'] || '').trim();
          const description = String(row['__EMPTY_2'] || '').trim();
          const barcode = String(row['__EMPTY_3'] || '').trim();
          const value = row['__EMPTY_4'];
          const dateStr = row['__EMPTY_5'];
          const invoice = String(row['__EMPTY_6'] || '').trim();
          const location = String(row['__EMPTY_7'] || '').trim();

          // Detectar categorias
          if (/^\d+\.$/.test(code) || /^\d+\.\d+\.$/.test(code)) {
            const parts = code.replace(/\.$/, '').split('.');
            if (parts.length === 1) {
              currentCategory = description;
              currentSubcategory = '';
            } else if (parts.length === 2) {
              currentSubcategory = description;
            }
            continue;
          }

          // Pular linhas inválidas
          if (!code || code.includes('TOTAL')) continue;
          const parts = code.split('.');
          if (parts.length !== 2 || !/^\d{4,}$/.test(parts[1])) continue;

          const cleanCode = parts[1];
          
          let acquisitionValue: number | undefined;
          if (value) {
            const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (!isNaN(numValue)) acquisitionValue = numValue;
          }

          dataToImport.push({
            tagNumber: cleanCode,
            name: description || 'Sem nome',
            category: currentCategory || 'Geral',
            subcategory: currentSubcategory || undefined,
            barcode: barcode || undefined,
            currentValue: acquisitionValue,
            acquisitionValue: acquisitionValue,
            invoiceNumber: (invoice && invoice !== ' ') ? invoice : undefined,
            physicalLocation: (location && location !== ' ') ? location : undefined,
          });
        }
      } else {
        // CSV path
        const text = await file.text();
        const lines = text.split("\n").filter(l => l.trim().length > 0);
        
        if (lines.length < 2) {
          throw new Error('Arquivo CSV vazio ou inválido');
        }
        
        const header = lines[0].split(";").map(h => h.trim().toLowerCase());
        dataToImport = lines.slice(1).map(line => {
          const cols = line.split(";");
          const get = (names: string[]) => {
            for (const name of names) {
              const idx = header.findIndex(h => h === name.toLowerCase());
              if (idx !== -1) return cols[idx]?.trim();
            }
            return undefined;
          };
          return {
            tagNumber: get(["código", "código do bem", "código do bem (campo chave)"] ) || "",
            name: get(["nome", "descrição do bem", "nome do item"] ) || "",
            category: get(["categoria", "categoria principal"] ) || "",
            brand: get(["marca", "fabricante"] ) || "",
            model: get(["modelo", "modelo técnico"] ) || "",
            serialNumber: get(["série", "número de série", "cód barras"] ) || "",
            status: get(["status", "situação do bem"] ) || "ACTIVE",
            currentValue: get(["valor", "valor de aquisição"] ) || "",
            description: get(["descrição", "observações / detalhes", "local"] ) || ""
          };
        }).filter(item => item.tagNumber && item.name);
      }

      if (dataToImport.length === 0) {
        throw new Error('Nenhum dado válido encontrado no arquivo');
      }

      await importAssets(dataToImport);
      alert(`Importados ${dataToImport.length} itens com sucesso!`);
      setIsImportModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Erro ao importar:', err);
      alert(err instanceof Error ? err.message : "Erro ao importar. Verifique o formato.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  async function getDefaultCompanyIdForImport() {
    const response = await fetch('/api/companies/default');
    if (response.ok) {
      const data = await response.json();
      return data.id;
    }
    return '';
  }

  // Excluir Todos
  const handleDeleteAll = async () => {
    if (confirm("ATENÇÃO: Você tem certeza que deseja excluir TODOS os patrimônios? Esta ação não pode ser desfeita.")) {
      setLoading(true);
      try {
        await deleteAllAssets();
        alert("Todos os patrimônios foram excluídos.");
      } catch(e) {
        alert("Erro ao excluir.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={handleDeleteAll}
          disabled={loading || assets.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-500/10 transition-all disabled:opacity-50"
          title="Excluir Todos"
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
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20"
        >
          <Plus className="w-4 h-4" /> Novo Patrimônio
        </button>
      </div>

      {/* Modal de Novo Patrimônio */}
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
        </div>,
        document.body
      )}

      {/* Modal de Importação */}
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
<div className="bg-muted/30 p-4 rounded-xl border border-border">
                <p className="text-sm font-bold text-foreground mb-2">Para garantir que funcione perfeitamente:</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Aceitamos arquivos Excel (.xlsx) ou CSV (separado por ponto-e-vírgula).<br/>
                  Para Excel: Use a estrutura padrão com colunas: Código, Descrição, Código Barras, Valor, Data, Documento, Local.<br/>
                  Para CSV: Código do Bem;Descrição do Bem;Código Barras;Valor do Bem;Data Aquisição;Documento Fiscal;Local do Bem
                </p>
                <button 
                  onClick={() => {
                    const template = "Código do Bem;Descrição do Bem;Código Barras;Valor do Bem;Data Aquisição;Documento Fiscal;Local do Bem\n" +
           "1.1.0001;AR CONDICIONADO ELETROLUX;123456;650.00;21/06/2022;NF 12345;DORMITÓRIO";
                    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `Planilha_Padrao_Rei.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full py-2 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 font-bold text-xs rounded-lg transition-colors"
                >
                  <Download className="w-3 h-3 inline-block mr-1" /> Baixar Planilha Padrão CSV
                </button>
              </div>
              
              <input 
                type="file" 
                accept=".csv,.xlsx,.xls"
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
        </div>,
        document.body
      )}
    </>
  );
}

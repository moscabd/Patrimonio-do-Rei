"use client";

import { useState, useRef } from "react";
import { Upload, Download, Loader2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function ConverterPage() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [csvContent, setCsvContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setPreview([]);
    setCsvContent("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (data.length === 0) {
        alert("Planilha vazia");
        return;
      }

      let headerIndex = -1;
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        const text = row.map(c => String(c || "").trim().toLowerCase()).join(" ");
        if (text.includes("código") || text.includes("codigo") || text.includes("descrição") || text.includes("descricao")) {
          headerIndex = i;
          break;
        }
      }

      if (headerIndex === -1) {
        alert("Não foi possível encontrar a linha de cabeçalho na planilha.");
        return;
      }

      const headers = data[headerIndex].map((h: any) => String(h || "").trim().toLowerCase());
      
      const mapeamento = detectarColunas(headers);
      
      const rows = data.slice(headerIndex + 1).filter((row: any[]) => row.some(cell => cell !== undefined && cell !== ""));
      
      const dadosMapeados = rows.map((row: any[]) => {
        const get = (idx: number) => {
          const val = row[idx];
          return val !== undefined && val !== null ? String(val).trim() : "";
        };
        
        return {
          codigo: get(mapeamento.codigo),
          nome: get(mapeamento.nome),
          categoria: get(mapeamento.categoria),
          valor: get(mapeamento.valor),
          local: get(mapeamento.local),
        };
      }).filter(item => {
        if (!item.codigo || !item.nome) return false;
        if (/^\d+\.$/.test(item.codigo.trim())) return false;
        if (/^\d+\.\d+\.$/.test(item.codigo.trim())) return false;
        return true;
      });

      setPreview(dadosMapeados.slice(0, 10));

      const csvLines = [
        "Código;Nome;Categoria;Valor;Local",
        ...dadosMapeados.map(d => 
          `${d.codigo};${d.nome};${d.categoria};${d.valor};${d.local}`
        )
      ];

      setCsvContent(csvLines.join("\n"));
    } catch (err) {
      console.error(err);
      alert("Erro ao ler arquivo");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  function detectarColunas(headers: string[]) {
    const mapeamento = {
      codigo: -1,
      nome: -1,
      categoria: -1,
      valor: -1,
      local: -1,
    };

    const sinonimos = {
      codigo: ["código", "codigo", "cod", "patrimônio", "patrimonio", "número", "numero", "id", "código bem", "codigo bem", "cód"],
      nome: ["nome", "descrição", "descricao", "item", "bem", "descrição do bem", "descricao do bem", "nome do item", "produto"],
      categoria: ["categoria", "tipo", "classificação", "classificacao", "grupo", "subcategoria"],
      valor: ["valor", "preço", "preco", "custo", "aquisição", "aquisicao", "vlr", "value", "valor do bem"],
      local: ["local", "localização", "localizacao", "setor", "ambiente", "sala", "departamento", "local do bem"],
    };

    headers.forEach((header, idx) => {
      const h = header.toLowerCase().trim();
      
      for (const [campo, alternativas] of Object.entries(sinonimos)) {
        if (mapeamento[campo as keyof typeof mapeamento] === -1) {
          if (alternativas.some(alt => h.includes(alt))) {
            mapeamento[campo as keyof typeof mapeamento] = idx;
          }
        }
      }
    });

    if (mapeamento.codigo === -1 && headers.length > 0) mapeamento.codigo = 0;
    if (mapeamento.nome === -1 && headers.length > 1) mapeamento.nome = 1;

    return mapeamento;
  }

  const downloadCSV = () => {
    if (!csvContent) return;
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `patrimonios_convertidos.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Converter Planilha</h1>
          <p className="text-muted-foreground mt-2">
            Converta qualquer Excel para o formato padrão do sistema
          </p>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-secondary/30 rounded-2xl p-12 text-center hover:bg-secondary/5 transition-all cursor-pointer"
        >
          <input 
            type="file" 
            accept=".xlsx,.xls,.csv"
            ref={fileInputRef}
            onChange={handleFile}
            className="hidden" 
          />
          {loading ? (
            <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
          ) : (
            <FileSpreadsheet className="w-12 h-12 text-secondary/50 mx-auto mb-4" />
          )}
          <p className="text-lg font-bold text-foreground">
            {loading ? "Processando..." : "Clique para selecionar o arquivo Excel"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Aceita .xlsx, .xls ou .csv
          </p>
        </div>

        {preview.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Pré-visualização</h2>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-background rounded-xl font-bold hover:bg-secondary/90 transition-all"
              >
                <Download className="w-4 h-4" />
                Baixar CSV Pronto
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-xs font-bold uppercase text-secondary">Código</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-secondary">Nome</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-secondary">Categoria</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-secondary">Valor</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-secondary">Local</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.map((item, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-4 py-3 text-sm font-mono text-secondary">{item.codigo}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.nome}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.categoria}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item.valor}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.local}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Mostrando {preview.length} de {preview.length} itens convertidos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
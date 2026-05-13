import Shell from "@/components/layout/Shell";
import { 
  Plus, 
  Filter, 
  Download, 
  Search,
  History,
  FileText,
  ChevronRight,
  ShieldCheck,
  Star
} from "lucide-react";
import Link from "next/link";

const assets = [
  { id: "1", tag: "REI-001", name: "Servidor Imperial Dell R750", category: "TI / Infraestrutura", status: "Em Uso", value: "R$ 45.000,00" },
  { id: "2", tag: "REI-002", name: "Mobiliário Design Herman Miller", category: "Móveis Reais", status: "Ativo", value: "R$ 12.500,00" },
  { id: "3", tag: "REI-003", name: "MacBook Pro M3 Max - Edição Ouro", category: "TI / Dispositivos", status: "Em Manutenção", value: "R$ 32.000,00" },
  { id: "4", tag: "REI-004", name: "Sistema de Som Bang & Olufsen", category: "Multimídia", status: "Ativo", value: "R$ 18.200,00" },
];

const statusStyles: Record<string, string> = {
  "Ativo": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Em Uso": "bg-blue-100 text-blue-700 border-blue-200",
  "Em Manutenção": "bg-amber-100 text-amber-700 border-amber-200",
};

export default function AssetsPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex justify-between items-end border-b-4 border-secondary/20 pb-8">
          <div>
            <h2 className="text-4xl font-black text-primary tracking-tighter">Acervo de Patrimônio</h2>
            <p className="text-primary/60 font-medium mt-2 italic text-lg text-primary">Controle absoluto de todos os bens do Reino.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 border-2 border-secondary text-secondary rounded-2xl text-sm font-black uppercase hover:bg-secondary hover:text-primary transition-all shadow-lg">
              <Download className="w-4 h-4" /> Exportar Relatório
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl text-sm font-black uppercase hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 border-b-4 border-secondary">
              <Plus className="w-4 h-4 text-secondary" /> Novo Patrimônio
            </button>
          </div>
        </div>

        {/* Professional Search & Filter - Royal Style */}
        <div className="bg-white border-2 border-secondary/20 p-6 rounded-3xl flex items-center gap-6 shadow-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, código ou categoria real..." 
              className="w-full bg-secondary/5 border-none rounded-2xl py-4 pl-12 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-secondary/10 text-secondary rounded-2xl text-sm font-black uppercase hover:bg-secondary hover:text-primary transition-all">
            <Filter className="w-5 h-5" /> Filtros Avançados
          </button>
        </div>

        {/* Assets Table - Clean & Royal */}
        <div className="bg-white border-2 border-secondary/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white border-b-4 border-secondary">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary">Identificador</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary">Bem Patrimonial</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary text-center">Status de Posse</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary">Valor Estimado</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary text-center">Ações Régias</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-secondary/10">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-secondary/5 transition-colors group cursor-pointer">
                  <td className="p-6">
                    <span className="font-black text-sm text-primary bg-secondary/20 border border-secondary px-3 py-1.5 rounded-lg shadow-sm">{asset.tag}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-primary group-hover:text-secondary transition-colors">{asset.name}</span>
                      <span className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mt-1">{asset.category}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl border-2 ${statusStyles[asset.status] || "bg-secondary/10 text-primary border-secondary/20"}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-black text-primary">
                    {asset.value}
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-3">
                      <Link href={`/assets/${asset.id}`} className="p-3 bg-secondary/10 hover:bg-secondary rounded-2xl text-secondary hover:text-primary transition-all shadow-sm">
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-8 bg-primary/5 border-t-2 border-secondary/20 flex justify-between items-center text-xs font-black text-primary/60 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Registros sob Proteção do Rei: 2.842 Itens
            </span>
            <div className="flex gap-3">
              <button className="px-5 py-2 border-2 border-secondary/30 rounded-xl hover:bg-secondary hover:text-primary transition-all">Anterior</button>
              <button className="px-5 py-2 bg-secondary text-primary rounded-xl shadow-md">01</button>
              <button className="px-5 py-2 border-2 border-secondary/30 rounded-xl hover:bg-secondary hover:text-primary transition-all">Próximo</button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

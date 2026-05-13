import Shell from "@/components/layout/Shell";
import { 
  ArrowLeftRight, 
  ArrowRight, 
  Plus, 
  Search, 
  Calendar,
  User,
  Package,
  Zap
} from "lucide-react";

const movements = [
  { id: "1", asset: "MacBook Pro M3", code: "REI-088", type: "TRANSFERÊNCIA", origin: "Marketing", dest: "Engenharia", date: "Há 2 horas", user: "André Lima", status: "Concluído" },
  { id: "2", asset: "Estação Dell XPS", code: "REI-112", type: "EMPRÉSTIMO", origin: "Estoque", dest: "Home Office - Maria", date: "Ontem", user: "Sandro Silva", status: "Em Aberto" },
  { id: "3", asset: "Projetor Epson 4K", code: "REI-005", type: "DEVOLUÇÃO", origin: "Vendas", dest: "Logística", date: "12/03/24", user: "Ana Paula", status: "Concluído" },
];

export default function MovementsPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex justify-between items-end border-b-4 border-secondary/20 pb-8">
          <div>
            <h2 className="text-4xl font-black text-primary tracking-tighter">Fluxos do Reino</h2>
            <p className="text-primary/60 font-medium mt-2 italic text-lg text-primary">Rastreabilidade soberana de cada bem patrimonial.</p>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-sm font-black uppercase hover:bg-primary/90 transition-all shadow-xl border-b-4 border-secondary">
            <Plus className="w-5 h-5 text-secondary" /> Registrar Movimentação
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatBox icon={ArrowLeftRight} label="Transferências" value="128" color="text-blue-600" />
          <StatBox icon={Zap} label="Empréstimos Ativos" value="42" color="text-amber-600" />
          <StatBox icon={Package} label="Devoluções" value="03" color="text-emerald-600" />
        </div>

        <div className="bg-white border-2 border-secondary/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="divide-y-2 divide-secondary/10">
            {movements.map(mov => (
              <div key={mov.id} className="p-8 hover:bg-secondary/5 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
                    mov.type === 'TRANSFERÊNCIA' ? 'bg-blue-100 border-blue-200 text-blue-600' : 
                    mov.type === 'EMPRÉSTIMO' ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-emerald-100 border-emerald-200 text-emerald-600'
                  }`}>
                    {mov.type === 'TRANSFERÊNCIA' ? <ArrowLeftRight className="w-8 h-8" /> : 
                     mov.type === 'EMPRÉSTIMO' ? <Zap className="w-8 h-8" /> : <Package className="w-8 h-8" />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-primary">{mov.asset}</span>
                      <span className="text-[10px] bg-secondary/20 text-primary border border-secondary px-2 py-1 rounded-lg font-black uppercase tracking-tighter shadow-sm">{mov.code}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs font-bold text-primary/40 uppercase">{mov.origin}</span>
                      <ArrowRight className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-black text-primary bg-secondary/10 px-3 py-1 rounded-lg border border-secondary/20">{mov.dest}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-16">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-sm font-black text-primary">
                      <User className="w-4 h-4 text-secondary" /> {mov.user}
                    </div>
                    <div className="flex items-center justify-end gap-2 text-[10px] text-primary/40 font-bold mt-2 uppercase tracking-widest">
                      <Calendar className="w-4 h-4" /> {mov.date}
                    </div>
                  </div>
                  
                  <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase border-2 shadow-sm ${
                    mov.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {mov.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="bg-white border-2 border-secondary/10 p-8 rounded-[2rem] flex items-center gap-6 shadow-lg">
      <div className={`w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-primary">{value}</p>
      </div>
    </div>
  );
}

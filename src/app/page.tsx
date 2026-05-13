import Shell from "@/components/layout/Shell";
import { 
  Package, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Zap
} from "lucide-react";

const stats = [
  { label: "Acervo Total", value: "2,842", icon: Package, color: "text-blue-600", bg: "bg-blue-100", trend: "+12%" },
  { label: "Em Pleno Uso", value: "2,405", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", trend: "94%" },
  { label: "Em Reparo", value: "32", icon: Wrench, color: "text-amber-600", bg: "bg-amber-100", trend: "-5%" },
  { label: "Alertas de Auditoria", value: "05", icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-200", trend: "+2" },
];

export default function Dashboard() {
  return (
    <Shell>
      <div className="space-y-10">
        {/* Royal Header */}
        <div className="flex justify-between items-center bg-white p-8 rounded-3xl border-2 border-secondary/20 shadow-xl shadow-secondary/5">
          <div>
            <h2 className="text-4xl font-black text-primary tracking-tight">Sala de Comando</h2>
            <p className="text-primary/60 font-medium mt-2">Visão consolidada do tesouro patrimonial do Reino.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-widest">Estado de Auditoria</p>
                 <p className="text-lg font-black text-emerald-700">100% Protegido</p>
               </div>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border-2 border-secondary/10 p-8 rounded-3xl shadow-lg hover:border-secondary transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full">
                  {stat.trend} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <div className="mt-8 relative z-10">
                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">{stat.label}</p>
                <p className="text-4xl font-black text-primary mt-2">{stat.value}</p>
              </div>
              
              {/* Decorative Background Icon */}
              <stat.icon className="absolute -bottom-6 -right-6 w-32 h-32 text-primary/5 rotate-12 group-hover:rotate-0 transition-transform" />
            </div>
          ))}
        </div>

        {/* Charts & Analytics - Royal Gold Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border-2 border-secondary/10 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-primary flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" /> Valorização do Acervo
              </h3>
              <select className="bg-secondary/10 border-none rounded-xl px-4 py-2 text-xs font-bold text-primary">
                <option>Últimos 12 Meses</option>
              </select>
            </div>
            <div className="h-72 w-full bg-secondary/5 rounded-2xl flex items-center justify-center border-2 border-dashed border-secondary/20">
              <p className="text-secondary font-bold text-sm uppercase tracking-widest italic">Análise de Crescimento em Tempo Real</p>
            </div>
          </div>

          <div className="bg-primary text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" /> Distribuição de Capital
            </h3>
            <div className="space-y-6 relative z-10">
              <CategoryBar label="Infraestrutura" percent={65} color="bg-secondary" />
              <CategoryBar label="Tecnologia" percent={42} color="bg-emerald-400" />
              <CategoryBar label="Mobiliário" percent={18} color="bg-amber-400" />
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border-2 border-secondary/10 rounded-3xl overflow-hidden shadow-lg">
          <div className="p-8 border-b border-secondary/10 flex justify-between items-center">
            <h3 className="text-xl font-black text-primary">Atos Recentes de Movimentação</h3>
            <button className="px-6 py-2 bg-secondary/10 text-secondary rounded-xl text-xs font-black uppercase hover:bg-secondary hover:text-primary transition-all">
              Ver Histórico Real
            </button>
          </div>
          <div className="divide-y divide-secondary/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-secondary/20 shadow-inner">
                    <Package className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-primary">Estação de Trabalho Real #00{i}</p>
                    <p className="text-xs text-primary/60 font-medium">Movimentado para: Setor de Governança</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary/40 uppercase">Há {i * 5} min</p>
                  <p className="text-xs font-black text-emerald-600 mt-1 uppercase tracking-widest">Sincronizado</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function CategoryBar({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
        <span>{label}</span>
        <span className="text-secondary">{percent}%</span>
      </div>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} shadow-lg shadow-black/20`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

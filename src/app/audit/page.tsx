import Shell from "@/components/layout/Shell";
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertCircle,
  Plus, 
  User,
  ArrowRight,
  ShieldCheck,
  Star
} from "lucide-react";

const audits = [
  { id: "1", title: "Censo Patrimonial Real 2024", type: "ANUAL", status: "Em Andamento", progress: 65, auditor: "Carlos Silva" },
  { id: "2", title: "Conferência de Acervo TI", type: "SETORIAL", status: "Pendente", progress: 0, auditor: "Ana Clara" },
  { id: "3", title: "Auditoria de Bens Móveis", type: "CÍCLICA", status: "Concluído", progress: 100, auditor: "Ricardo Porto" },
];

export default function AuditPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex justify-between items-end border-b-4 border-secondary/20 pb-8">
          <div>
            <h2 className="text-4xl font-black text-primary tracking-tighter">Auditoria Régia</h2>
            <p className="text-primary/60 font-medium mt-2 italic text-lg text-primary">Conferência soberana da integridade do tesouro patrimonial.</p>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-sm font-black uppercase hover:bg-primary/90 transition-all shadow-xl border-b-4 border-secondary">
            <Plus className="w-5 h-5 text-secondary" /> Novo Ato de Auditoria
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {audits.map(audit => (
            <div key={audit.id} className="bg-white border-2 border-secondary/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl group hover:border-secondary transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-secondary/30 px-3 py-1 rounded-lg border border-secondary/50">
                  {audit.type}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  audit.status === 'Concluído' ? 'text-emerald-600' : audit.status === 'Pendente' ? 'text-primary/40' : 'text-amber-600'
                }`}>
                  {audit.status}
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-primary mb-3 leading-tight">{audit.title}</h3>
              
              <div className="flex items-center gap-2 text-xs font-bold text-primary/40 mb-8 uppercase tracking-widest">
                <User className="w-4 h-4 text-secondary" /> Auditor: {audit.auditor}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider text-primary">
                  <span>Progresso do Inventário</span>
                  <span className="text-secondary">{audit.progress}%</span>
                </div>
                <div className="w-full h-3 bg-secondary/10 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-secondary transition-all duration-1000 shadow-lg" style={{ width: `${audit.progress}%` }}></div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t-2 border-secondary/10 flex justify-between items-center">
                <button className="text-xs font-black text-primary flex items-center gap-2 hover:text-secondary transition-colors uppercase tracking-widest">
                   {audit.status === 'Concluído' ? 'Ver Laudo Real' : 'Continuar Checklist'} <ArrowRight className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Decorative Star for completed audits */}
              {audit.status === 'Concluído' && (
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary text-primary flex items-center justify-center rotate-45 shadow-lg">
                  <Star className="w-6 h-6 -rotate-45 fill-primary" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Real-time Summary Card */}
        <div className="bg-primary text-white border-b-8 border-secondary rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div>
                 <h3 className="text-2xl font-black mb-2">Resumo da Integridade</h3>
                 <p className="text-secondary font-bold opacity-80 italic">Status em tempo real de todo o acervo patrimonial.</p>
              </div>
              <div className="flex gap-12">
                 <BigStat label="Conferidos" value="2.842" color="text-secondary" />
                 <BigStat label="Divergentes" value="12" color="text-amber-400" />
                 <BigStat label="Em Risco" value="0" color="text-emerald-400" />
              </div>
           </div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -mb-48 -mr-48 blur-3xl"></div>
        </div>
      </div>
    </Shell>
  );
}

function BigStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="text-center">
       <p className={`text-4xl font-black ${color}`}>{value}</p>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">{label}</p>
    </div>
  );
}

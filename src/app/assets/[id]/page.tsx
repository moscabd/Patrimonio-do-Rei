"use client";

import Shell from "@/components/layout/Shell";
import { 
  ArrowLeft, 
  Edit3, 
  History, 
  FileText, 
  Info,
  Calendar,
  User,
  ShieldCheck,
  Download,
  Clock,
  Eye,
  Plus,
  Star
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AssetDetailPage() {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <Shell>
      <div className="space-y-8">
        {/* Royal Sub-Header */}
        <div className="flex justify-between items-center border-b-4 border-secondary/20 pb-8">
          <div className="flex items-center gap-6">
            <Link href="/assets" className="p-3 bg-secondary/10 hover:bg-secondary rounded-2xl text-secondary hover:text-primary transition-all shadow-sm">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-primary uppercase tracking-widest bg-secondary px-3 py-1 rounded-lg shadow-md">REI-001</span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 border-2 border-emerald-200 px-3 py-1 rounded-full uppercase tracking-widest">Soberania Ativa</span>
              </div>
              <h2 className="text-3xl font-black text-primary mt-2">Servidor Imperial Dell PowerEdge R750</h2>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 border-2 border-secondary text-secondary rounded-2xl text-sm font-black uppercase hover:bg-secondary hover:text-primary transition-all shadow-lg">
              <Edit3 className="w-4 h-4" /> Editar Atributos
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl text-sm font-black uppercase hover:bg-primary/90 transition-all shadow-xl border-b-4 border-secondary">
              <Star className="w-4 h-4 text-secondary" /> Marcar como Favorito
            </button>
          </div>
        </div>

        {/* Custom Tabs - Royal Style */}
        <div className="flex gap-12 border-b-2 border-secondary/10">
          {[
            { id: "info", label: "Memorial Descritivo", icon: Info },
            { id: "docs", label: "Arquivo de Evidências", icon: FileText },
            { id: "history", label: "Crônica de Auditoria", icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? "text-primary" : "text-primary/30 hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-secondary" : "text-primary/20"}`} />
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {activeTab === "info" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white border-2 border-secondary/10 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary border-b-2 border-secondary/10 pb-4">Especificações do Acervo</h3>
                    <div className="space-y-4">
                      <DetailRow label="Cédula de Identidade" value="REI-DELL-XJ9283" />
                      <DetailRow label="Fabricante Imperial" value="Dell / PowerEdge" />
                      <DetailRow label="Categoria do Bem" value="TI / Infraestrutura" />
                      <DetailRow label="Data de Ingresso" value="12/03/2024" />
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                  </div>
                  
                  <div className="bg-white border-2 border-secondary/10 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary border-b-2 border-secondary/10 pb-4">Custódia & Localização</h3>
                    <div className="space-y-4">
                      <DetailRow label="Guardião Responsável" value="Carlos Silva" />
                      <DetailRow label="Sede de Alocação" value="Matriz Imperial" />
                      <DetailRow label="Câmara / Sala" value="Câmara de Dados 01" />
                      <DetailRow label="Posicionamento" value="Rack A3" />
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                  </div>
                </div>

                <div className="bg-white border-2 border-secondary/10 rounded-[2.5rem] p-8 shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary border-b-2 border-secondary/10 pb-4 mb-6">Memorial Detalhado</h3>
                  <p className="text-lg font-medium text-primary/70 leading-relaxed italic border-l-4 border-secondary pl-6">
                    Bem patrimonial de alta importância estratégica, dotado de processadores de última geração e redundância total de energia. 
                    Constitui a base da soberania digital do Reino para o processamento de dados fiscais e operacionais.
                  </p>
                </div>
              </>
            )}

            {activeTab === "docs" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-primary">Arquivo de Evidências</h3>
                  <button className="flex items-center gap-2 px-5 py-2 bg-secondary text-primary rounded-xl text-xs font-black uppercase shadow-lg">
                    <Plus className="w-4 h-4" /> Novo Aditivo
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DocumentCard name="Certificado Fiscal.pdf" type="FISCAL" size="1.2 MB" date="12/03/24" />
                  <DocumentCard name="Manual de Operação.pdf" type="TÉCNICO" size="4.5 MB" date="13/03/24" />
                  <DocumentCard name="Garantia Vitalícia.pdf" type="PROTEÇÃO" size="840 KB" date="15/03/24" />
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-white border-2 border-secondary/10 rounded-[2.5rem] p-10 shadow-2xl">
                <h3 className="text-2xl font-black text-primary mb-10">Crônica de Auditoria</h3>
                <div className="space-y-12 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-secondary/20 rounded-full"></div>
                  <TimelineItem date="22/04/2024" user="Sistema Central" action="Ato de Movimentação" desc="O item foi realocado para a Câmara de Dados 01 após inspeção técnica." />
                  <TimelineItem date="15/03/2024" user="Carlos Silva" action="Adição de Memória" desc="Inserção de manuais técnicos e atualização de categoria para 'Estratégico'." />
                  <TimelineItem date="12/03/2024" user="Chancelaria" action="Ingresso no Reino" desc="Registro inicial do bem patrimonial após recebimento da chancelaria fiscal." />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Royal Life Cycle */}
          <div className="space-y-8">
            <div className="bg-primary text-white border-b-8 border-secondary rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-8">Ciclo de Soberania</h3>
              <div className="space-y-6 relative z-10">
                <StatusStep label="Ingresso" date="12/03/24" active />
                <StatusStep label="Consagração" date="15/03/24" active />
                <StatusStep label="Auditoria Q1" date="22/04/24" active />
                <StatusStep label="Garantia" date="12/03/27" />
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16 blur-3xl"></div>
            </div>

            <div className="bg-white border-2 border-secondary/10 rounded-[2.5rem] p-8 shadow-xl text-center">
               <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center text-secondary mx-auto mb-6 shadow-inner">
                  <ShieldCheck className="w-10 h-10" />
               </div>
               <h4 className="text-lg font-black text-primary uppercase tracking-tight">Bem Protegido</h4>
               <p className="text-xs text-primary/40 font-bold mt-2 leading-relaxed">Este item está sob vigilância constante e auditoria automatizada do Reino.</p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-secondary/10 pb-2">
      <span className="font-bold text-primary/40 uppercase tracking-widest text-[10px]">{label}</span>
      <span className="font-black text-primary">{value}</span>
    </div>
  );
}

function DocumentCard({ name, type, size, date }: { name: string, type: string, size: string, date: string }) {
  return (
    <div className="bg-white border-2 border-secondary/10 p-5 rounded-3xl flex items-center gap-5 group hover:border-secondary transition-all shadow-lg">
      <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-inner">
        <FileText className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-primary truncate">{name}</p>
        <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{type} • {size}</p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button className="p-2 bg-secondary/10 hover:bg-secondary rounded-xl text-secondary hover:text-primary transition-all"><Download className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

function TimelineItem({ date, user, action, desc }: { date: string, user: string, action: string, desc: string }) {
  return (
    <div className="relative pl-12">
      <div className="absolute left-0 top-1.5 w-8 h-8 bg-white border-2 border-secondary rounded-xl flex items-center justify-center z-10 shadow-lg">
        <Clock className="w-4 h-4 text-secondary" />
      </div>
      <div>
        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{date}</p>
        <p className="text-xl font-black text-primary mt-1">{action}</p>
        <p className="text-xs font-bold text-primary/40 uppercase mt-1">Por: {user}</p>
        <p className="text-sm font-medium text-primary/60 mt-3 leading-relaxed border-l-2 border-secondary/20 pl-4 italic">{desc}</p>
      </div>
    </div>
  );
}

function StatusStep({ label, date, active = false }: { label: string, date: string, active?: boolean }) {
  return (
    <div className="flex justify-between items-center text-xs font-bold">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full border-2 ${active ? "bg-secondary border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-primary border-secondary"}`}></div>
        <span className={active ? "text-secondary font-black" : "text-white/40"}>{label}</span>
      </div>
      <span className="text-white/40">{date}</span>
    </div>
  );
}

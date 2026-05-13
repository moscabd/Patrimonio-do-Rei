"use client";

import { useState } from "react";
import { Info, FileText, History, Clock, Download, Plus, ShieldCheck, Edit3, X, Loader2 } from "lucide-react";
import { updateAsset } from "@/app/actions/asset";

export default function DetailTabs({ asset }: { asset: any }) {
  const [activeTab, setActiveTab] = useState("info");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="animate-in animate-in-delay-1 flex gap-6 border-b border-border overflow-x-auto">
            {[
              { id: "info", label: "Detalhes", icon: Info },
              { id: "docs", label: "Documentos", icon: FileText },
              { id: "history", label: "Histórico", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id ? "text-secondary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full shadow-[0_0_8px_hsla(45,93%,47%,0.4)]" />
                )}
              </button>
            ))}
          </div>

          {activeTab === "info" && (
            <>
              <div className="animate-in grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard title="Identificação">
                  <DetailRow label="Código" value={asset.tagNumber} />
                  <DetailRow label="Nome" value={asset.name} />
                  <DetailRow label="Categoria" value={asset.category} />
                  <DetailRow label="Valor" value={asset.currentValue ? `R$ ${asset.currentValue}` : "-"} />
                </DetailCard>
                <DetailCard title="Localização">
                  <DetailRow label="Status" value={asset.status} />
                  <DetailRow label="Responsável" value="Não atribuído" />
                  <DetailRow label="Setor" value="Geral" />
                  <DetailRow label="Data Registro" value={new Date(asset.createdAt).toLocaleDateString()} />
                </DetailCard>
              </div>

              <div className="animate-in animate-in-delay-1 bg-card border border-border rounded-2xl p-6 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setIsEditModalOpen(true)} className="p-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary hover:text-background transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-4">Descrição</h3>
                <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-secondary/30 pl-4">
                  {asset.description || "Nenhuma descrição fornecida para este item."}
                </p>
              </div>
            </>
          )}

          {activeTab === "docs" && (
            <div className="animate-in space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground">Documentos</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-bold hover:bg-secondary hover:text-background transition-all">
                  <Plus className="w-3 h-3" /> Fazer Upload
                </button>
              </div>
              <div className="bg-card border border-border p-8 rounded-xl flex flex-col items-center justify-center text-center">
                <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-bold text-foreground">Nenhum documento</p>
                <p className="text-xs text-muted-foreground mt-1">Faça o upload de notas fiscais ou garantias aqui.</p>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="animate-in bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">Linha do Tempo</h3>
              <div className="space-y-8 relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0.5 w-6 h-6 bg-card border-2 border-secondary rounded-lg flex items-center justify-center z-10">
                    <Clock className="w-3 h-3 text-secondary" />
                  </div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{new Date(asset.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm font-bold text-foreground mt-1">Criação do Registro</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Por: Sistema</p>
                  <p className="text-xs text-muted-foreground mt-2 border-l-2 border-border pl-3">Ativo registrado no banco de dados.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <div className="animate-in animate-in-delay-2 bg-primary rounded-2xl p-6 border-b-4 border-secondary relative overflow-hidden">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-6">Ciclo de Vida</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_hsla(45,93%,47%,0.5)]" />
                  <span className="text-secondary font-bold">Registro Atual</span>
                </div>
                <span className="text-white/40 font-mono">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-secondary/10 rounded-full -mb-12 -mr-12 blur-2xl" />
          </div>

          <div className="animate-in animate-in-delay-3 bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Bem Protegido</h4>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Sob vigilância e auditoria do Banco de Dados Central.</p>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">Editar Patrimônio</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={async (formData) => {
              setLoading(true);
              try {
                await updateAsset(asset.id, formData);
                setIsEditModalOpen(false);
              } finally {
                setLoading(false);
              }
            }} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Código</label>
                <input name="tagNumber" defaultValue={asset.tagNumber} required className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nome do Item</label>
                <input name="name" defaultValue={asset.name} required className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Categoria</label>
                  <input name="category" defaultValue={asset.category} required className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                  <select name="status" defaultValue={asset.status} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50">
                    <option value="ACTIVE">Ativo</option>
                    <option value="IN_USE">Em Uso</option>
                    <option value="MAINTENANCE">Manutenção</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Valor (R$)</label>
                <input name="currentValue" defaultValue={asset.currentValue} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary pb-3 border-b border-border">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

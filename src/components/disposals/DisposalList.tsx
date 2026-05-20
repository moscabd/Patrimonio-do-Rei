"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  X,
  Loader2,
  Save,
  AlertCircle,
  Gift,
  AlertTriangle,
  Wrench
} from "lucide-react";

interface Disposal {
  id: string;
  description: string;
  quantity: number;
  value: any;
  date: any;
  reason: string;
  notes: string | null;
}

const reasonConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  DESCARTADA: { icon: Trash2, color: "text-red-400", bg: "bg-red-500/15 border-red-500/20", label: "Descartado" },
  DOADA: { icon: Gift, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20", label: "Doado" },
  QUEBROU: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/20", label: "Quebrou" },
  ESTRAGOU: { icon: Wrench, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/20", label: "Estragou" },
  ROUBADA: { icon: AlertCircle, color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/20", label: "Roubado" },
  PERDIDA: { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-500/15 border-gray-500/20", label: "Perdido" },
};

function formatDate(date: any): string {
  return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatValue(value: any): string {
  return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

export default function DisposalList({ disposals }: { disposals: Disposal[] }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingDisposal, setEditingDisposal] = useState<Disposal | null>(null);
  
  // States for Edit Form
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("DESCARTADA");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEdit = (d: Disposal) => {
    setEditingDisposal(d);
    setDescription(d.description);
    setQuantity(d.quantity);
    setValue(Number(d.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 }).replace('.', ','));
    
    // Safely format date for input field
    const dateObj = new Date(d.date);
    const dateString = dateObj.toISOString().split('T')[0];
    setDate(dateString);
    
    setReason(d.reason);
    setNotes(d.notes || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDisposal) return;
    setLoading(true);

    try {
      const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      
      const res = await fetch(`/api/disposals/${editingDisposal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          quantity,
          value: numericValue,
          date,
          reason,
          notes,
        }),
      });

      if (res.ok) {
        setEditingDisposal(null);
        router.refresh();
        alert("Registro de descarte atualizado com sucesso!");
      } else {
        alert("Erro ao salvar alterações.");
      }
    } catch (err) {
      alert("Erro ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este registro de descarte/doação?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/disposals/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
        alert("Registro excluído com sucesso!");
      } else {
        alert("Erro ao excluir registro.");
      }
    } catch (err) {
      alert("Erro ao excluir registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Table View (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Descrição</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">Qtd</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Valor</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Data</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">Motivo</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Observações</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {disposals.map((d) => {
                const config = reasonConfig[d.reason] || { color: "text-muted-foreground", bg: "bg-muted border-border", label: d.reason };
                return (
                  <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground">{d.description}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-foreground">{d.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">
                      {formatValue(d.value)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(d.date)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {d.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(d)}
                          disabled={loading}
                          className="p-2 border border-secondary/30 text-secondary rounded-xl hover:bg-secondary/10 transition-all disabled:opacity-50"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          disabled={loading}
                          className="p-2 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-all disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* List View (Mobile) */}
        <div className="md:hidden divide-y divide-border">
          {disposals.map((d) => {
            const config = reasonConfig[d.reason] || { color: "text-muted-foreground", bg: "bg-muted border-border", label: d.reason };
            return (
              <div key={d.id} className="p-4 hover:bg-muted/20 transition-colors space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(d.date)}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{d.quantity}x</span>
                  <span className="font-bold text-foreground">{formatValue(d.value)}</span>
                </div>
                {d.notes && (
                  <p className="text-xs text-muted-foreground">{d.notes}</p>
                )}
                
                <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleEdit(d)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-secondary/30 text-secondary rounded-lg text-xs font-bold hover:bg-secondary/10 transition-all disabled:opacity-50"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/10 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal (Portal) */}
      {mounted && editingDisposal && createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">Editar Registro</h3>
              <button 
                onClick={() => setEditingDisposal(null)} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Descrição do Item</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: GELADEIRA ELETROLUX 260LTS"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Quantidade</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Valor (R$)</label>
                  <input
                    type="text"
                    required
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="Ex: 400,00"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Motivo</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  >
                    <option value="DESCARTADA">Descartado</option>
                    <option value="DOADA">Doado</option>
                    <option value="QUEBROU">Quebrou</option>
                    <option value="ESTRAGOU">Estragou (sem conserto)</option>
                    <option value="ROUBADA">Roubado</option>
                    <option value="PERDIDA">Perdido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Observações</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Doada para Márcio, Sem conserto, etc."
                  rows={3}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingDisposal(null)} 
                  className="flex-1 px-4 py-3 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 px-4 py-3 bg-secondary text-background rounded-xl text-sm font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/layout/Shell';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewDisposalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    value: '',
    date: new Date().toISOString().split('T')[0],
    reason: 'DESCARTADA',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/disposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value.replace(',', '.')),
        }),
      });

      if (res.ok) {
        router.push('/disposals');
      } else {
        alert('Erro ao criar registro');
      }
    } catch (err) {
      alert('Erro ao criar registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/disposals" className="p-2 border border-border rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Novo Registro de Descarte/Doação</h2>
            <p className="text-muted-foreground text-sm">Registre bens descartados, doados ou danificados</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Descrição do Item</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: GELADEIRA ELETROLUX 260LTS"
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Quantidade</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Valor (R$)</label>
              <input
                type="text"
                required
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: e.target.value })}
                placeholder="Ex: 400,00"
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Data</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Motivo</label>
              <select
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
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
            <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Doada para Márcio, Sem conserto, etc."
              rows={3}
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/disposals"
              className="px-6 py-2.5 border border-border rounded-xl font-bold text-sm hover:bg-muted transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-background rounded-xl font-bold hover:bg-secondary/90 disabled:opacity-50 transition-all"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

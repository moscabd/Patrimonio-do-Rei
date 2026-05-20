'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/layout/Shell';
import { Save, Building2, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    organization: 'Núcleo REI RABINO',
    cnpj: '09.621.597/0001-66',
    location: 'PERDIGÃO/MG',
    president: 'Càssio Eduardo Paiva',
    vicePresident: 'EVANDRO APARECIDO MACHADO',
    fiscalPresident: 'JÕAO BATISTA ALVES SORES',
    member1: 'ANA CÉLIA ALVARENGA SOARES',
    member2: 'LETÍCIA MORAIS',
  });

  useEffect(() => {
    fetch('/api/committee')
      .then(res => res.json())
      .then(data => {
        if (data) setFormData(data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/committee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 border border-border rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Configurações do Núcleo</h2>
            <p className="text-muted-foreground text-sm">Informações da Comissão de Patrimônio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-foreground">Dados da Organização</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={e => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Localização</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-foreground">Comissão de Patrimônio</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Presidente</label>
                <input
                  type="text"
                  value={formData.president}
                  onChange={e => setFormData({ ...formData, president: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Vice-Presidente</label>
                <input
                  type="text"
                  value={formData.vicePresident}
                  onChange={e => setFormData({ ...formData, vicePresident: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Presidente do Conselho Fiscal</label>
                <input
                  type="text"
                  value={formData.fiscalPresident}
                  onChange={e => setFormData({ ...formData, fiscalPresident: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">1º Membro</label>
                  <input
                    type="text"
                    value={formData.member1}
                    onChange={e => setFormData({ ...formData, member1: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">2º Membro</label>
                  <input
                    type="text"
                    value={formData.member2}
                    onChange={e => setFormData({ ...formData, member2: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {saved && (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                ✓ Salvo com sucesso!
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-background rounded-xl font-bold hover:bg-secondary/90 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

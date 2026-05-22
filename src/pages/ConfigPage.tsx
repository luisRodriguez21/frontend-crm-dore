import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Zap, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { metalPriceApi, wholesaleApi } from '../api/services';
import { Modal, ConfirmDialog, PageLoader } from '../components/ui';
import type { WholesaleRange, MetalType, MetalPrices } from '../types';
import { fmtCurrency, fmtDateTime } from '../utils/helpers';

function MetalOverrideForm({ current, onSave, onCancel }: {
  current: MetalPrices | null; onSave: () => void; onCancel: () => void;
}) {
  const [goldPrice, setGoldPrice] = useState(current?.gold?.spotPricePerGram?.toString() || '');
  const [silverPrice, setSilverPrice] = useState(current?.silver?.spotPricePerGram?.toString() || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        goldPrice && metalPriceApi.setOverride({ metalType: 'GOLD', spotPricePerGram: parseFloat(goldPrice), note }),
        silverPrice && metalPriceApi.setOverride({ metalType: 'SILVER', spotPricePerGram: parseFloat(silverPrice), note }),
      ]);
      toast.success('Precios actualizados manualmente');
      onSave();
    } catch { toast.error('Error al actualizar precios'); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="rounded-lg bg-amber-500/8 border border-amber-500/20 px-4 py-3 flex items-start gap-2.5">
        <Shield size={14} className="text-amber-700 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">Este override se usará hasta la próxima actualización automática o hasta que lo cambies de nuevo.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Precio Oro (MXN/g)</label>
          <input className="input font-mono" type="number" step="0.01" value={goldPrice} onChange={e => setGoldPrice(e.target.value)} placeholder="1842.50" required />
        </div>
        <div>
          <label className="label">Precio Plata (MXN/g)</label>
          <input className="input font-mono" type="number" step="0.01" value={silverPrice} onChange={e => setSilverPrice(e.target.value)} placeholder="23.15" required />
        </div>
      </div>
      <div>
        <label className="label">Motivo del ajuste</label>
        <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Ajuste por cierre de mercado, etc." />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-gold flex-1 justify-center">
          {loading ? 'Aplicando...' : 'Aplicar override'}
        </button>
      </div>
    </form>
  );
}

function RangeForm({ initial, onSave, onCancel }: {
  initial?: Partial<WholesaleRange>; onSave: (d: Partial<WholesaleRange>) => Promise<void>; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    metalType: (initial?.metalType || 'GOLD') as MetalType,
    minAmount: initial?.minAmount?.toString() || '',
    maxAmount: initial?.maxAmount?.toString() || '',
    markupPerGram: initial?.markupPerGram?.toString() || '',
    label: initial?.label || '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        metalType: form.metalType,
        minAmount: parseFloat(form.minAmount),
        maxAmount: form.maxAmount ? parseFloat(form.maxAmount) : undefined,
        markupPerGram: parseFloat(form.markupPerGram),
        label: form.label || undefined,
      });
    } catch { toast.error('Error al guardar'); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Metal</label>
          <select className="input" value={form.metalType} onChange={e => setForm(p => ({ ...p, metalType: e.target.value as MetalType }))}>
            <option value="GOLD">Oro</option>
            <option value="SILVER">Plata</option>
          </select></div>
        <div><label className="label">Etiqueta</label>
          <input className="input" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Mayoreo Básico" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Monto mínimo (MXN)</label>
          <input className="input font-mono" type="number" required value={form.minAmount} onChange={e => setForm(p => ({ ...p, minAmount: e.target.value }))} placeholder="5000" /></div>
        <div><label className="label">Monto máximo (MXN)</label>
          <input className="input font-mono" type="number" value={form.maxAmount} onChange={e => setForm(p => ({ ...p, maxAmount: e.target.value }))} placeholder="Sin límite" /></div>
      </div>
      <div><label className="label">Ajuste por gramo (MXN, negativo = descuento)</label>
        <input className="input font-mono" type="number" step="0.5" required value={form.markupPerGram} onChange={e => setForm(p => ({ ...p, markupPerGram: e.target.value }))} placeholder="-10" />
        <p className="text-xs text-[var(--text-faint)] mt-1">Ej: -10 = reduce $10/g del precio final</p>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-gold flex-1 justify-center">{loading ? 'Guardando...' : initial?.id ? 'Actualizar' : 'Crear rango'}</button>
      </div>
    </form>
  );
}

export default function ConfigPage() {
  const [prices, setPrices] = useState<MetalPrices | null>(null);
  const [ranges, setRanges] = useState<WholesaleRange[]>([]);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [rangeFormOpen, setRangeFormOpen] = useState(false);
  const [editingRange, setEditingRange] = useState<WholesaleRange | null>(null);
  const [deletingRange, setDeletingRange] = useState<WholesaleRange | null>(null);
  const [loadingRanges, setLoadingRanges] = useState(true);
  const [metalFilter, setMetalFilter] = useState<MetalType | ''>('');

  const loadPrices = useCallback(async () => {
    try { const res = await metalPriceApi.getCurrent(); setPrices(res.data.data!); } catch { }
  }, []);

  const loadRanges = useCallback(async () => {
    setLoadingRanges(true);
    try { const res = await wholesaleApi.list(metalFilter || undefined); setRanges(res.data.data as WholesaleRange[]); }
    finally { setLoadingRanges(false); }
  }, [metalFilter]);

  useEffect(() => { loadPrices(); }, [loadPrices]);
  useEffect(() => { loadRanges(); }, [loadRanges]);

  async function handleSaveRange(data: Partial<WholesaleRange>) {
    if (editingRange) { await wholesaleApi.update(editingRange.id, data); toast.success('Rango actualizado'); }
    else { await wholesaleApi.create(data); toast.success('Rango creado'); }
    setRangeFormOpen(false); setEditingRange(null); loadRanges();
  }

  async function handleDeleteRange() {
    if (!deletingRange) return;
    try { await wholesaleApi.delete(deletingRange.id); toast.success('Rango eliminado'); setDeletingRange(null); loadRanges(); }
    catch { toast.error('Error al eliminar'); }
  }

  return (
    <div className="space-y-6 stagger max-w-4xl">
      <div>
        <h1 className="section-title">Configuración</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Panel de administración del sistema</p>
      </div>

      {/* Metal Prices */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[var(--gold)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Cotización de Metales</h3>
          </div>
          <button onClick={() => setOverrideOpen(true)} className="btn-gold text-xs py-2">
            Override manual
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { metal: 'Oro', data: prices?.gold, accent: '#a16207', badge: 'bg-amber-50 text-amber-700' },
            { metal: 'Plata', data: prices?.silver, accent: '#475569', badge: 'bg-slate-100 text-slate-600' },
          ].map(({ metal, data, accent, badge }) => (
            <div key={metal} className="rounded-xl border border-[var(--border)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`badge ${badge} text-xs`}>{metal}</span>
                {data?.isManualOverride && <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">Manual override</span>}
              </div>
              <p className="font-body text-2xl font-bold" style={{ color: accent }}>
                ${data ? data.spotPricePerGram.toFixed(4) : '—'}
                <span className="text-sm font-body font-normal text-[var(--text-faint)] ml-1">MXN/g</span>
              </p>
              {data && <p className="text-xs text-[var(--text-faint)] mt-1">Actualizado: {fmtDateTime(data.recordedAt)} · {data.source}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Wholesale Ranges */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text-primary)]">Rangos de Mayoreo</h3>
          <div className="flex items-center gap-2">
            <select value={metalFilter} onChange={e => setMetalFilter(e.target.value as MetalType | '')} className="input py-1.5 text-xs w-auto">
              <option value="">Todos</option>
              <option value="GOLD">Oro</option>
              <option value="SILVER">Plata</option>
            </select>
            <button onClick={() => { setEditingRange(null); setRangeFormOpen(true); }} className="btn-gold text-xs py-2">
              <Plus size={12} /> Nuevo rango
            </button>
          </div>
        </div>

        {loadingRanges ? <PageLoader /> : ranges.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-faint)] text-sm">Sin rangos configurados. Crea el primero.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {ranges.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-black/[0.04] transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${r.metalType === 'GOLD' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.label && <span className="font-medium text-[var(--text-primary)] text-sm">{r.label}</span>}
                    <span className="text-xs text-[var(--text-faint)]">
                      {fmtCurrency(r.minAmount)} — {r.maxAmount ? fmtCurrency(r.maxAmount) : 'Sin límite'}
                    </span>
                  </div>
                  <p className={`text-sm font-mono font-semibold mt-0.5 ${Number(r.markupPerGram) < 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {Number(r.markupPerGram) > 0 ? '+' : ''}{r.markupPerGram} MXN/g
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingRange(r); setRangeFormOpen(true); }} className="p-1.5 rounded hover:bg-black/[0.05] text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setDeletingRange(r)} className="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-faint)] hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={overrideOpen} onClose={() => setOverrideOpen(false)} title="Override manual de precios" size="md">
        <MetalOverrideForm current={prices} onSave={() => { setOverrideOpen(false); loadPrices(); }} onCancel={() => setOverrideOpen(false)} />
      </Modal>

      <Modal open={rangeFormOpen} onClose={() => { setRangeFormOpen(false); setEditingRange(null); }} title={editingRange ? 'Editar rango' : 'Nuevo rango de mayoreo'} size="md">
        <RangeForm initial={editingRange || undefined} onSave={handleSaveRange} onCancel={() => { setRangeFormOpen(false); setEditingRange(null); }} />
      </Modal>

      <ConfirmDialog open={!!deletingRange} onClose={() => setDeletingRange(null)} onConfirm={handleDeleteRange}
        title="¿Eliminar rango?" message={`Se eliminará el rango "${deletingRange?.label || deletingRange?.id}". No se puede deshacer.`} />
    </div>
  );
}

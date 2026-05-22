import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Package, Edit2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesApi } from '../api/services';
import { StatusBadge, SourceBadge, PriorityBadge, MetalBadge, SearchInput, Pagination, PageLoader, Modal, Empty } from '../components/ui';
import type { Sale, SaleStatus } from '../types';
import { fmtCurrency, fmtDateTime, DISCOUNT_LABELS, STATUS_CONFIG } from '../utils/helpers';

// ─── Sales List Page ──────────────────────────────────────────
export function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaleStatus | ''>('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesApi.list({ page, limit: 15, search: search || undefined, status: statusFilter || undefined });
      setSales(res.data.data as unknown as Sale[]);
      setTotal(res.data.total);
    } catch { toast.error('Error al cargar ventas'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Ventas</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{total} registradas</p>
        </div>
        <Link to="/sales/new" className="btn-gold"><Plus size={15} /> Nueva venta</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48"><SearchInput value={search} onChange={setSearch} placeholder="Número, cliente, tracking..." /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as SaleStatus | '')} className="input w-auto">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : sales.length === 0 ? (
          <Empty icon="📦" title="Sin ventas" description={search || statusFilter ? 'Intenta otros filtros' : 'Crea tu primera venta'} action={!search && !statusFilter ? <Link to="/sales/new" className="btn-gold text-sm">Crear venta</Link> : undefined} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left">
                    {['# Venta', 'Cliente', 'Canal', 'Metal', 'Total', 'Estado', 'Prioridad', 'Fecha', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {sales.map(s => (
                    <tr key={s.id} className="hover:bg-black/[0.04] transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-[var(--gold)]">{s.saleNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[var(--text-primary)] font-medium">{(s as unknown as { client: { name: string } }).client?.name}</p>
                      </td>
                      <td className="px-4 py-3.5"><SourceBadge source={s.source} /></td>
                      <td className="px-4 py-3.5"><MetalBadge metal={s.metalType} /></td>
                      <td className="px-4 py-3.5 font-body font-semibold text-[var(--text-primary)] tabular-nums">{fmtCurrency(s.total)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3.5"><PriorityBadge priority={s.priority} /></td>
                      <td className="px-4 py-3.5 text-xs text-[var(--text-faint)] whitespace-nowrap">{fmtDateTime(s.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <Link to={`/sales/${s.id}`} className="p-1.5 rounded hover:bg-black/[0.05] text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors inline-flex">
                          <ExternalLink size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-[var(--border)]">
              <Pagination page={page} totalPages={Math.ceil(total / 15)} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sale Detail Page ─────────────────────────────────────────
export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ status: '', trackingNumber: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    salesApi.getOne(id)
      .then(res => { setSale(res.data.data!); setForm({ status: res.data.data!.status, trackingNumber: res.data.data!.trackingNumber || '', notes: res.data.data!.notes || '' }); })
      .catch(() => toast.error('Venta no encontrada'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await salesApi.update(id!, form);
      setSale(res.data.data!);
      setEditOpen(false);
      toast.success('Venta actualizada');
    } catch { toast.error('Error al actualizar'); }
    finally { setSaving(false); }
  }

  if (loading) return <PageLoader />;
  if (!sale) return <div className="text-center py-20 text-[var(--text-faint)]">Venta no encontrada</div>;

  return (
    <div className="space-y-6 stagger max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/sales')} className="btn-ghost p-2"><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-body text-2xl font-bold text-[var(--text-primary)]">{sale.saleNumber}</h1>
            <StatusBadge status={sale.status} />
            <SourceBadge source={sale.source} />
            <PriorityBadge priority={sale.priority} />
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">{fmtDateTime(sale.createdAt)} · Vendedor: {sale.seller?.name}</p>
        </div>
        <button onClick={() => setEditOpen(true)} className="btn-ghost"><Edit2 size={14} /> Editar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Client info */}
        <div className="card p-4">
          <p className="label mb-3">Cliente</p>
          <p className="font-semibold text-[var(--text-primary)]">{sale.client?.name}</p>
          {sale.client?.phone && <p className="text-sm text-[var(--text-muted)] mt-1">📞 {sale.client.phone}</p>}
          {sale.client?.email && <p className="text-sm text-[var(--text-muted)]">✉ {sale.client.email}</p>}
          {sale.client?.isWholesaleMember && <span className="mt-2 inline-block badge bg-amber-50 text-amber-700 border border-amber-200">👑 Mayorista</span>}
        </div>

        {/* Pricing summary */}
        <div className="card p-4">
          <p className="label mb-3">Resumen financiero</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Metal</span><MetalBadge metal={sale.metalType} />
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Tipo</span><span>{DISCOUNT_LABELS[sale.discountType]}</span>
            </div>
            { /* TODO: aqui validar de que fue la venta, si fue de plata renderizar solo eso */}
            {sale.goldPriceUsed && <div className="flex justify-between text-[var(--text-faint)] text-xs">
              <span>Spot oro usado</span><span className="font-body">${Number(sale.goldPriceUsed).toFixed(4)}/g</span>
            </div>}
            {sale.silverPriceUsed && <div className="flex justify-between text-[var(--text-faint)] text-xs">
              <span>Spot plata usado</span><span className="font-body">${Number(sale.silverPriceUsed).toFixed(4)}/g</span>
            </div>}
            <div className="border-t border-[var(--border)] pt-1.5 flex justify-between font-bold text-[var(--text-primary)]">
              <span>Total</span><span className="font-body text-[var(--gold)]">{fmtCurrency(Number(sale.total))}</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="card p-4">
          <p className="label mb-3">Envío</p>
          <div className="space-y-1.5 text-sm text-[var(--text-muted)]">
            <p>{sale.trackingNumber ? <><span className="text-[var(--text-faint)] text-xs">Tracking:</span> <span className="font-body text-[var(--text-primary)]">{sale.trackingNumber}</span></> : 'Sin número de tracking'}</p>
            {sale.notes && <p className="text-xs mt-2 p-2 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">{sale.notes}</p>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
          <Package size={14} className="text-[var(--gold)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Productos ({sale.items?.length || 0})</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {sale.items?.map(item => (
            <div key={item.id} className="px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-faint)]">
                <Package size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">{item.product?.name}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--text-faint)]">
                  <span>{item.quantity} pza · {Number(item.weightGrams).toFixed(2)}g/pza</span>
                  <span className="font-body">
                    ${Number(item.finalPricePerGram).toFixed(2)}/g
                    <span className="text-[var(--text-faint)]"> (spot + hechura + ajustes)</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-body font-bold text-[var(--text-primary)]">{fmtCurrency(Number(item.totalPrice))}</p>
                <p className="text-xs text-[var(--text-faint)]">{fmtCurrency(Number(item.unitPrice))}/pza</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-[var(--bg-elevated)] flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--text-primary)]">Total de la venta</span>
          <span className="font-body font-bold text-lg text-[var(--gold)]">{fmtCurrency(Number(sale.total))}</span>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Actualizar venta" size="md">
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div><label className="label">Estado</label>
            <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select></div>
          <div><label className="label">Número de tracking</label>
            <input className="input" value={form.trackingNumber} onChange={e => setForm(p => ({ ...p, trackingNumber: e.target.value }))} placeholder="MX123456789" /></div>
          <div><label className="label">Notas</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditOpen(false)} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center">{saving ? 'Guardando...' : 'Actualizar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

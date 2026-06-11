import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, History, Star, Phone, Mail, MapPin, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientsApi } from '../api/services';
import { Modal, ConfirmDialog, SearchInput, Pagination, PageLoader, StatusBadge, Empty } from '../components/ui';
import type { Client, ClientHistory } from '../types';
import { fmtCurrency, fmtDate } from '../utils/helpers';


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

// ─── Client Form ──────────────────────────────────────────────
function ClientForm({ initial, onSave, onCancel }: {
  initial?: Partial<Client>; onSave: (data: Partial<Client>) => Promise<void>; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    birthday: initial?.birthday ? initial.birthday.split('T')[0] : '',
    isWholesaleMember: initial?.isWholesaleMember || false,
    notes: initial?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); }
    catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al guardar';
      toast.error(msg);
    } finally { setLoading(false); }
  }

  /* const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
     <div><label className="label">{label}</label>{children}</div>
   ); */

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <Field label="Nombre completo *">
        <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ana Martínez" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email">
          <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="ana@ejemplo.com" />
        </Field>
        <Field label="Teléfono">
          <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="555-0000-000" />
        </Field>
      </div>
      <Field label="Fecha de nacimiento">
        <input className="input" type="date" value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} />
      </Field>
      <Field label="Notas">
        <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Preferencias, observaciones..." />
      </Field>
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={form.isWholesaleMember} onChange={e => setForm(p => ({ ...p, isWholesaleMember: e.target.checked }))} />
          <div className={`w-10 h-5 rounded-full transition-colors ${form.isWholesaleMember ? 'bg-amber-500' : 'bg-[var(--border)]'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${form.isWholesaleMember ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Kit de inicio activo</p>
          <p className="text-xs text-[var(--text-muted)]">Tiene acceso a precios de mayoreo con kit</p>
        </div>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">Cancelar</button>
        <button type="submit" disabled={loading || !form.name} className="btn-gold flex-1 justify-center">
          {loading ? 'Guardando...' : initial?.id ? 'Actualizar' : 'Crear cliente'}
        </button>
      </div>
    </form>
  );
}

// ─── History Modal ─────────────────────────────────────────────
function HistoryModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [history, setHistory] = useState<ClientHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsApi.history(client.id)
      .then(res => setHistory(res.data.data!))
      .catch(() => toast.error('Error al cargar historial'))
      .finally(() => setLoading(false));
  }, [client.id]);

  return (
    <Modal open onClose={onClose} title={`Historial · ${client.name}`} size="xl">
      {loading ? (
        <div className="p-8 flex justify-center"><PageLoader /></div>
      ) : history ? (
        <div className="p-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Compras', value: String(history.totalPurchases) },
              { label: 'Total gastado', value: fmtCurrency(history.totalSpent) },
              { label: 'Promedio', value: fmtCurrency(history.averageOrderValue) },
              { label: 'Favorito', value: history.favoriteProduct || '—' },
            ].map(s => (
              <div key={s.label} className="card p-3 text-center">
                <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 truncate">{s.value}</p>
              </div>
            ))}
          </div>
          {/* Purchase list */}
          <div>
            <h4 className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-3">Pedidos</h4>
            {history.purchases.length === 0 ? (
              <p className="text-sm text-[var(--text-faint)] text-center py-6">Sin compras aún</p>
            ) : (
              <div className="space-y-2">
                {history.purchases.map(p => (
                  <div key={p.saleNumber} className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-4 py-3">
                    <div>
                      <span className="font-mono text-xs text-[var(--gold)]">{p.saleNumber}</span>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{p.itemCount} producto{p.itemCount !== 1 ? 's' : ''} · {p.seller} · {fmtDate(p.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--text-primary)] tabular-nums">{fmtCurrency(p.total)}</p>
                      <div className="flex justify-end mt-1"><StatusBadge status={p.status} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [history, setHistory] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientsApi.list({ page, limit: 15, search: search || undefined });
      setClients(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Error al cargar clientes'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  async function handleSave(data: Partial<Client>) {
    if (editing) {
      await clientsApi.update(editing.id, data);
      toast.success('Cliente actualizado');
    } else {
      await clientsApi.create(data);
      toast.success('Cliente creado');
    }
    setFormOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDelLoading(true);
    try {
      await clientsApi.delete(deleting.id);
      toast.success('Cliente eliminado');
      setDeleting(null);
      load();
    } catch { toast.error('Error al eliminar'); }
    finally { setDelLoading(false); }
  }

  return (
    <div className="space-y-5 stagger">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Clientes</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{total} registrados</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-gold">
          <Plus size={15} /> Nuevo cliente
        </button>
      </div>

      {/* Search */}
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, email o teléfono..." />

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : clients.length === 0 ? (
          <Empty icon="👤" title="Sin clientes" description={search ? 'Intenta otra búsqueda' : 'Agrega tu primer cliente'} action={
            !search ? <button onClick={() => setFormOpen(true)} className="btn-gold text-sm">Crear cliente</button> : undefined
          } />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left">
                    {['Cliente', 'Contacto', 'Tipo', 'Desde', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {clients.map(c => (
                    <tr key={c.id} className="hover:bg-black/[0.04] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-sm font-semibold text-[var(--gold)]">
                            {c.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{c.name}</p>
                            {c.birthday && <p className="text-[11px] text-[var(--text-faint)]">🎂 {fmtDate(c.birthday)}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          {c.phone && <p className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Phone size={10} />{c.phone}</p>}
                          {c.email && <p className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Mail size={10} />{c.email}</p>}
                          {c.addresses?.[0] && <p className="text-xs text-[var(--text-faint)] flex items-center gap-1"><MapPin size={10} />{c.addresses[0].city}, {c.addresses[0].state}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.isWholesaleMember
                          ? <span className="badge bg-amber-50 text-amber-700 border border-amber-200"><Crown size={10} />Mayorista</span>
                          : <span className="badge bg-stone-100 text-stone-600"><Star size={10} />Menudeo</span>}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[var(--text-faint)]">{fmtDate(c.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setHistory(c)} title="Historial" className="p-1.5 rounded hover:bg-black/[0.05] text-[var(--text-faint)] hover:text-blue-600 transition-colors">
                            <History size={14} />
                          </button>
                          <button onClick={() => { setEditing(c); setFormOpen(true); }} title="Editar" className="p-1.5 rounded hover:bg-black/[0.05] text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleting(c)} title="Eliminar" className="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-faint)] hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
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

      {/* Modals */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? 'Editar cliente' : 'Nuevo cliente'} size="lg">
        <ClientForm initial={editing || undefined} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditing(null); }} />
      </Modal>

      {history && <HistoryModal client={history} onClose={() => setHistory(null)} />}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={delLoading}
        title="¿Eliminar cliente?"
        message={`Esta acción eliminará a ${deleting?.name} y todos sus datos. No se puede deshacer.`}
      />
    </div>
  );
}

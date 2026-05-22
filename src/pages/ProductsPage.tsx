import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Package, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, suppliersApi } from '../api/services';
import { Modal, ConfirmDialog, SearchInput, Pagination, PageLoader, MetalBadge, Empty } from '../components/ui';
import type { Product, Supplier, MetalType, PricingType } from '../types';
import { fmtCurrency } from '../utils/helpers';

// ─── Product Form ─────────────────────────────────────────────
function ProductForm({ initial, suppliers, onSave, onCancel }: {
  initial?: Partial<Product>; suppliers: Supplier[];
  onSave: (d: Partial<Product>) => Promise<void>; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    supplierId: initial?.supplier?.id || '',
    metalType: (initial?.metalType || 'GOLD') as MetalType,
    pricingType: (initial?.pricingType || 'BY_GRAM') as PricingType,
    baseGramMarkup: initial?.baseGramMarkup?.toString() || '',
    fixedPrice: initial?.fixedPrice?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...form,
        baseGramMarkup: form.baseGramMarkup ? Number(form.baseGramMarkup) : undefined,
        fixedPrice: form.fixedPrice ? Number(form.fixedPrice) : undefined,
        supplierId: form.supplierId || undefined,
      });
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div><label className="label">Nombre *</label>
        <input className="input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Cadena Cubana 14k" /></div>
      <div><label className="label">Descripción</label>
        <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Metal</label>
          <select className="input" value={form.metalType} onChange={e => setForm(p => ({ ...p, metalType: e.target.value as MetalType }))}>
            <option value="GOLD">Oro</option>
            <option value="SILVER">Plata</option>
            <option value="MIXED">Mixto</option>
          </select></div>
        <div><label className="label">Tipo de precio</label>
          <select className="input" value={form.pricingType} onChange={e => setForm(p => ({ ...p, pricingType: e.target.value as PricingType }))}>
            <option value="BY_GRAM">Por gramo</option>
            <option value="FIXED">Precio fijo</option>
          </select></div>
      </div>
      {form.pricingType === 'BY_GRAM' ? (
        <div><label className="label">Hechura base (MXN/g)</label>
          <input className="input" type="number" step="0.01" required value={form.baseGramMarkup} onChange={e => setForm(p => ({ ...p, baseGramMarkup: e.target.value }))} placeholder="22.00" /></div>
      ) : (
        <div><label className="label">Precio fijo (MXN)</label>
          <input className="input" type="number" step="0.01" required value={form.fixedPrice} onChange={e => setForm(p => ({ ...p, fixedPrice: e.target.value }))} placeholder="1850.00" /></div>
      )}
      <div><label className="label">Proveedor</label>
        <select className="input" value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}>
          <option value="">Sin proveedor</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select></div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-gold flex-1 justify-center">{loading ? 'Guardando...' : initial?.id ? 'Actualizar' : 'Crear'}</button>
      </div>
    </form>
  );
}

// ─── Supplier Form ────────────────────────────────────────────
function SupplierForm({ initial, onSave, onCancel }: {
  initial?: Partial<Supplier>; onSave: (d: Partial<Supplier>) => Promise<void>; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '', address: initial?.address || '',
    phone: initial?.phone || '', email: initial?.email || '', notes: initial?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); }
    catch { toast.error('Error al guardar'); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div><label className="label">Nombre *</label>
        <input className="input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Don Pedro Joyería" /></div>
      <div><label className="label">Dirección</label>
        <input className="input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Teléfono</label>
          <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
        <div><label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
      </div>
      <div><label className="label">Notas</label>
        <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-gold flex-1 justify-center">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ProductsPage() {
  const [tab, setTab] = useState<'products' | 'suppliers'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalP, setTotalP] = useState(0);
  const [totalS, setTotalS] = useState(0);
  const [pageP, setPageP] = useState(1);
  const [pageS, setPageS] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | Supplier | null>(null);
  const [deleting, setDeleting] = useState<Product | Supplier | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({ page: pageP, limit: 12, search: search || undefined });
      setProducts(res.data.data); setTotalP(res.data.total);
    } finally { setLoading(false); }
  }, [pageP, search]);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await suppliersApi.list({ page: pageS, limit: 12, search: search || undefined });
      setSuppliers(res.data.data); setTotalS(res.data.total);
    } finally { setLoading(false); }
  }, [pageS, search]);

  // Always load suppliers for the product form
  useEffect(() => { suppliersApi.list({ limit: 100 }).then(r => setSuppliers(r.data.data)); }, []);
  useEffect(() => { if (tab === 'products') loadProducts(); else loadSuppliers(); }, [tab, loadProducts, loadSuppliers]);
  useEffect(() => { setPageP(1); setPageS(1); }, [search, tab]);

  async function handleSaveProduct(data: Partial<Product>) {
    if ((editing as Product)?.id && tab === 'products') { await productsApi.update((editing as Product).id, data); toast.success('Producto actualizado'); }
    else { await productsApi.create(data); toast.success('Producto creado'); }
    setFormOpen(false); setEditing(null); loadProducts();
  }
  async function handleSaveSupplier(data: Partial<Supplier>) {
    if ((editing as Supplier)?.id && tab === 'suppliers') { await suppliersApi.update((editing as Supplier).id, data); toast.success('Proveedor actualizado'); }
    else { await suppliersApi.create(data); toast.success('Proveedor creado'); }
    setFormOpen(false); setEditing(null); loadSuppliers();
  }
  async function handleDelete() {
    if (!deleting) return;
    setDelLoading(true);
    try {
      if (tab === 'products') await productsApi.delete((deleting as Product).id);
      else await suppliersApi.delete((deleting as Supplier).id);
      toast.success('Eliminado');
      setDeleting(null);
      tab === 'products' ? loadProducts() : loadSuppliers();
    } catch { toast.error('Error'); }
    finally { setDelLoading(false); }
  }

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Inventario</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Productos y proveedores</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-gold">
          <Plus size={15} /> {tab === 'products' ? 'Nuevo producto' : 'Nuevo proveedor'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg w-fit">
        {([['products', 'Productos', Package], ['suppliers', 'Proveedores', Truck]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === key ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder={`Buscar ${tab === 'products' ? 'productos' : 'proveedores'}...`} />

      {/* Products grid */}
      {tab === 'products' && (
        <div className="card overflow-hidden">
          {loading ? <PageLoader /> : products.length === 0 ? <Empty icon="💎" title="Sin productos" description="Agrega tu primer producto" action={<button onClick={() => setFormOpen(true)} className="btn-gold text-sm">Crear producto</button>} /> : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
                {products.map(p => (
                  <div key={p.id} className="bg-[var(--bg-card)] p-4 hover:bg-[var(--bg-elevated)] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <MetalBadge metal={p.metalType} />
                          <span className={`badge text-[10px] ${p.pricingType === 'BY_GRAM' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}>
                            {p.pricingType === 'BY_GRAM' ? 'Por gramo' : 'Precio fijo'}
                          </span>
                        </div>
                        <p className="font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                        {p.description && <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{p.description}</p>}
                        <p className="text-sm font-semibold text-[var(--gold)] mt-2 font-mono">
                          {p.pricingType === 'BY_GRAM' ? `+${fmtCurrency(p.baseGramMarkup || 0)}/g hechura` : fmtCurrency(p.fixedPrice || 0)}
                        </p>
                        {p.supplier && <p className="text-[11px] text-[var(--text-faint)] mt-1">📦 {p.supplier.name}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditing(p); setFormOpen(true); }} className="p-1.5 rounded hover:bg-black/[0.05] text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleting(p)} className="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-faint)] hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-[var(--border)]">
                <Pagination page={pageP} totalPages={Math.ceil(totalP / 12)} onChange={setPageP} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Suppliers table */}
      {tab === 'suppliers' && (
        <div className="card overflow-hidden">
          {loading ? <PageLoader /> : suppliers.length === 0 ? <Empty icon="🏪" title="Sin proveedores" description="Registra tu primer proveedor" action={<button onClick={() => setFormOpen(true)} className="btn-gold text-sm">Crear proveedor</button>} /> : (
            <>
              <div className="divide-y divide-[var(--border)]">
                {suppliers.map(s => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-black/[0.04] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)]">
                      <Truck size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)]">{s.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {s.phone && <span className="text-xs text-[var(--text-faint)]">📞 {s.phone}</span>}
                        {s.email && <span className="text-xs text-[var(--text-faint)]">✉ {s.email}</span>}
                        {s._count && <span className="text-xs text-[var(--text-faint)]">📦 {s._count.products} productos</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(s); setFormOpen(true); }} className="p-1.5 rounded hover:bg-black/[0.05] text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleting(s)} className="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-faint)] hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-[var(--border)]">
                <Pagination page={pageS} totalPages={Math.ceil(totalS / 12)} onChange={setPageS} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Forms */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={tab === 'products' ? (editing ? 'Editar producto' : 'Nuevo producto') : (editing ? 'Editar proveedor' : 'Nuevo proveedor')} size="lg">
        {tab === 'products'
          ? <ProductForm initial={(editing as Product) || undefined} suppliers={suppliers} onSave={handleSaveProduct} onCancel={() => { setFormOpen(false); setEditing(null); }} />
          : <SupplierForm initial={(editing as Supplier) || undefined} onSave={handleSaveSupplier} onCancel={() => { setFormOpen(false); setEditing(null); }} />}
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={delLoading}
        title={`¿Eliminar ${tab === 'products' ? 'producto' : 'proveedor'}?`}
        message={`Se desactivará "${(deleting as Product | Supplier)?.name}". Esta acción no se puede deshacer.`} />
    </div>
  );
}

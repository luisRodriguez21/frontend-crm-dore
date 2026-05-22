import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search, ChevronDown, Calculator, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesApi, clientsApi, productsApi } from '../api/services';
import { Modal, Spinner } from '../components/ui';
import type { Client, Product, SaleItemInput, CreateSaleInput, SalePreview, MetalType, SaleSource, SalePriority, DiscountType } from '../types';
import { fmtCurrency, DISCOUNT_LABELS, SOURCE_CONFIG, PRIORITY_CONFIG } from '../utils/helpers';

// ─── Client Selector ──────────────────────────────────────────
function ClientSelector({ value, onChange }: { value: Client | null; onChange: (c: Client) => void }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await clientsApi.list({ search: q, limit: 6 });
      setResults(res.data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => doSearch(search), 280);
    return () => clearTimeout(id);
  }, [search, doSearch]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await clientsApi.create(newClient);
      onChange(res.data.data!);
      setCreateOpen(false);
      setOpen(false);
      toast.success('Cliente creado');
    } catch { toast.error('Error al crear cliente'); }
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="input flex items-center justify-between text-left">
        {value ? (
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--gold)]/20 flex items-center justify-center text-xs text-[var(--gold)] font-bold">{value.name[0]}</span>
            <span className="text-[var(--text-primary)]">{value.name}</span>
            {value.isWholesaleMember && <span className="badge bg-amber-50 text-amber-700 text-[10px]">👑 Mayorista</span>}
          </span>
        ) : <span className="text-[var(--text-faint)]">Selecciona o busca un cliente</span>}
        <ChevronDown size={14} className="text-[var(--text-faint)] shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 card border-[var(--border-light)] shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-[var(--border)]">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                className="input pl-8 text-xs py-2" placeholder="Nombre, email o teléfono..." />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {loading && <div className="p-3 flex justify-center"><Spinner size={14} /></div>}
            {!loading && results.map(c => (
              <button key={c.id} type="button" onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-black/[0.05] transition-colors text-left">
                <span className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-sm text-[var(--gold)] font-bold">{c.name[0]}</span>
                <div>
                  <p className="text-sm text-[var(--text-primary)]">{c.name}</p>
                  <p className="text-xs text-[var(--text-faint)]">{c.phone || c.email || 'Sin contacto'}</p>
                </div>
                {c.isWholesaleMember && <span className="ml-auto badge bg-amber-50 text-amber-700 text-[10px]">Kit activo</span>}
              </button>
            ))}
            {!loading && results.length === 0 && search && (
              <p className="text-xs text-[var(--text-faint)] text-center py-3">Sin resultados para "{search}"</p>
            )}
          </div>
          <div className="p-2 border-t border-[var(--border)]">
            <button type="button" onClick={() => { setCreateOpen(true); setOpen(false); }}
              className="w-full btn-ghost text-xs justify-center py-2"><Plus size={12} /> Agregar nuevo cliente</button>
          </div>
        </div>
      )}

      {/* Quick create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Agregar cliente rápido" size="sm">
        <form onSubmit={handleCreate} className="p-5 space-y-3">
          <div><label className="label">Nombre *</label>
            <input className="input" required value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Teléfono</label>
            <input className="input" value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} /></div>
          <div><label className="label">Email</label>
            <input className="input" type="email" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" className="btn-gold flex-1 justify-center">Crear</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Product Row ──────────────────────────────────────────────
function ProductRow({ item, products, onChange, onRemove, calcItem }: {
  item: SaleItemInput; products: Product[];
  onChange: (updated: SaleItemInput) => void;
  onRemove: () => void;
  calcItem?: { finalPricePerGram: number; unitPrice: number; totalPrice: number } | null;
}) {
  const [prodSearch, setProdSearch] = useState('');
  const [openProd, setOpenProd] = useState(false);
  const filtered = products.filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()));
  const selected = item._product;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-3">
      <div className="flex items-start gap-3">
        {/* Product picker */}
        <div className="flex-1 relative">
          <label className="label">Producto</label>
          <button type="button" onClick={() => setOpenProd(o => !o)} className="input flex items-center justify-between">
            <span className={selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-faint)]'}>
              {selected ? selected.name : 'Seleccionar producto...'}
            </span>
            <ChevronDown size={13} className="text-[var(--text-faint)] shrink-0" />
          </button>
          {openProd && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 card border-[var(--border-light)] shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-[var(--border)]">
                <input autoFocus value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                  className="input text-xs py-2" placeholder="Buscar producto..." />
              </div>
              <div className="max-h-44 overflow-y-auto">
                {filtered.map(p => (
                  <button key={p.id} type="button" onClick={() => { onChange({ ...item, productId: p.id, _product: p }); setOpenProd(false); setProdSearch(''); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-black/[0.05] transition-colors text-left">
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">{p.name}</p>
                      <p className="text-[11px] text-[var(--text-faint)]">
                        {p.pricingType === 'BY_GRAM' ? `Hechura: +${fmtCurrency(p.baseGramMarkup || 0)}/g` : `Precio fijo: ${fmtCurrency(p.fixedPrice || 0)}`}
                      </p>
                    </div>
                    <span className={`badge text-[10px] ${p.metalType === 'GOLD' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {p.metalType === 'GOLD' ? 'Oro' : p.metalType === 'SILVER' ? 'Plata' : 'Mixto'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button type="button" onClick={onRemove} className="mt-6 p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-faint)] hover:text-red-600 transition-colors shrink-0">
          <Trash2 size={14} />
        </button>
      </div>

      {selected && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Cantidad</label>
            <input type="number" min={1} className="input" value={item.quantity}
              onChange={e => onChange({ ...item, quantity: parseInt(e.target.value) || 1 })} />
          </div>
          {selected.pricingType === 'BY_GRAM' && (
            <div>
              <label className="label">Peso por pieza (g)</label>
              <input type="number" min={0.01} step={0.01} className="input" value={item.weightGrams || ''}
                onChange={e => onChange({ ...item, weightGrams: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: 3.5" />
            </div>
          )}
        </div>
      )}

      {/* Calculated result */}
      {calcItem && selected?.pricingType === 'BY_GRAM' && (
        <div className="rounded-lg bg-[var(--gold)]/5 border border-[var(--gold)]/15 px-3 py-2 flex items-center justify-between text-xs">
          <span className="text-[var(--text-faint)]">${calcItem.finalPricePerGram.toFixed(2)}/g × {item.weightGrams}g × {item.quantity}</span>
          <span className="font-semibold text-[var(--gold)] font-mono">{fmtCurrency(calcItem.totalPrice)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Breakdown Panel ──────────────────────────────────────────
function BreakdownPanel({ preview, loading }: { preview: SalePreview | null; loading: boolean }) {
  if (loading) return (
    <div className="card p-5 flex items-center justify-center gap-2 text-[var(--text-faint)] text-sm">
      <Spinner size={14} /> Calculando...
    </div>
  );
  if (!preview) return (
    <div className="card p-5 flex flex-col items-center gap-2 text-center">
      <Calculator size={24} className="text-[var(--text-faint)] opacity-50" />
      <p className="text-sm text-[var(--text-faint)]">El desglose aparecerá aquí cuando agregues productos</p>
    </div>
  );

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <Calculator size={14} className="text-[var(--gold)]" />
        <span className="text-sm font-semibold text-[var(--text-primary)]">Desglose de precios</span>
      </div>
      <div className="p-4 space-y-2 text-xs">
        {preview.goldPriceUsed && (
          <div className="flex justify-between text-[var(--text-faint)]">
            <span>Spot Oro</span>
            <span className="font-mono text-amber-700">${preview.goldPriceUsed.toFixed(4)}/g</span>
          </div>
        )}
        {preview.silverPriceUsed && (
          <div className="flex justify-between text-[var(--text-faint)]">
            <span>Spot Plata</span>
            <span className="font-mono text-slate-600">${preview.silverPriceUsed.toFixed(4)}/g</span>
          </div>
        )}
        {preview.wholesaleRangeApplied && (
          <div className="flex justify-between text-emerald-700 bg-emerald-50 rounded px-2 py-1 -mx-2">
            <span>Rango mayoreo aplicado</span>
            <span>{preview.wholesaleRangeApplied}</span>
          </div>
        )}
        <div className="divider !my-3" />
        {preview.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-[var(--text-muted)] truncate pr-2">{item.productName} × {item.quantity}</span>
            <span className="font-mono text-[var(--text-primary)] shrink-0">{fmtCurrency(item.totalPrice)}</span>
          </div>
        ))}
        <div className="divider !my-3" />
        <div className="flex justify-between text-[var(--text-muted)]">
          <span>Subtotal</span><span className="font-mono">{fmtCurrency(preview.subtotal)}</span>
        </div>
        {preview.totalDiscount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Descuento mayoreo</span><span className="font-mono">- {fmtCurrency(preview.totalDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold pt-1 border-t border-[var(--border)]">
          <span className="text-[var(--text-primary)]">Total</span>
          <span className="font-body text-[var(--gold)]">{fmtCurrency(preview.total)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function NewSalePage() {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<SaleItemInput[]>([{ productId: '', quantity: 1, weightGrams: 0 }]);
  const [metalType, setMetalType] = useState<MetalType>('GOLD');
  const [source, setSource] = useState<SaleSource>('WHATSAPP');
  const [priority, setPriority] = useState<SalePriority>('MEDIUM');
  const [discountType, setDiscountType] = useState<DiscountType>('RETAIL');
  const [extraMarkup, setExtraMarkup] = useState(0);
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<SalePreview | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shippingFile, setShippingFile] = useState<string | null>(null);

  useEffect(() => {
    productsApi.list({ limit: 100 }).then(r => setProducts(r.data.data));
  }, []);

  // Auto-detect metal type from selected products
  useEffect(() => {
    const filledItems = items.filter(i => i._product);
    if (filledItems.length === 0) return;
    const metals = new Set(filledItems.map(i => i._product!.metalType));
    if (metals.size === 1) setMetalType([...metals][0] as MetalType);
    else setMetalType('MIXED');
  }, [items]);

  // Auto-set discount type if client is wholesale member
  useEffect(() => {
    if (client?.isWholesaleMember && discountType === 'RETAIL') setDiscountType('WHOLESALE_CLIENT');
    if (!client?.isWholesaleMember && discountType === 'WHOLESALE_CLIENT') setDiscountType('RETAIL');
  }, [client]);

  // Live preview calculation
  const doPreview = useCallback(async () => {
    const validItems = items.filter(i => i.productId && (i.weightGrams > 0 || i._product?.pricingType === 'FIXED'));
    if (!client || validItems.length === 0) { setPreview(null); return; }
    setCalcLoading(true);
    try {
      const payload: CreateSaleInput = {
        clientId: client.id, metalType, source, priority, discountType,
        extraMarkupPerGram: extraMarkup,
        items: validItems.map(i => ({ productId: i.productId, quantity: i.quantity, weightGrams: i.weightGrams })),
      };
      const res = await salesApi.preview(payload);
      setPreview(res.data.data!);
    } catch { setPreview(null); }
    finally { setCalcLoading(false); }
  }, [client, items, metalType, source, priority, discountType, extraMarkup]);

  useEffect(() => {
    const id = setTimeout(doPreview, 400);
    return () => clearTimeout(id);
  }, [doPreview]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client) { toast.error('Selecciona un cliente'); return; }
    const validItems = items.filter(i => i.productId && (i.weightGrams > 0 || i._product?.pricingType === 'FIXED'));
    if (validItems.length === 0) { toast.error('Agrega al menos un producto'); return; }

    setSubmitting(true);
    try {
      const res = await salesApi.create({
        clientId: client.id, metalType, source, priority, discountType,
        extraMarkupPerGram: extraMarkup, notes,
        items: validItems.map(i => ({ productId: i.productId, quantity: i.quantity, weightGrams: i.weightGrams })),
      });
      const sale = res.data.data?.sale;
      toast.success(`Venta ${sale?.saleNumber} creada`);
      navigate(`/sales/${sale?.id}`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al crear venta');
    } finally { setSubmitting(false); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setShippingFile(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 stagger">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Nueva Venta</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Registra una nueva transacción</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] text-xs font-bold">1</span>
              Cliente
            </h3>
            <ClientSelector value={client} onChange={setClient} />
          </div>

          {/* Products */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] text-xs font-bold">2</span>
              Productos
            </h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <ProductRow
                  key={idx}
                  item={item}
                  products={products}
                  onChange={updated => setItems(prev => prev.map((x, i) => i === idx ? updated : x))}
                  onRemove={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                  calcItem={preview?.items[idx] || null}
                />
              ))}
            </div>
            <button type="button" onClick={() => setItems(p => [...p, { productId: '', quantity: 1, weightGrams: 0 }])}
              className="btn-ghost w-full justify-center text-xs">
              <Plus size={13} /> Agregar otro producto
            </button>
          </div>

          {/* Pricing options */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] text-xs font-bold">3</span>
              Tipo de venta y ajustes
            </h3>
            <div>
              <label className="label">Tipo de descuento</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(DISCOUNT_LABELS) as [DiscountType, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setDiscountType(key)}
                    className={`px-3 py-2.5 rounded-lg border text-sm transition-all ${discountType === key ? 'border-[var(--gold)] bg-[var(--gold)]/8 text-[var(--gold)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)]'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Ajuste manual por gramo (MXN)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] text-sm">+</span>
                <input type="number" step="0.5" value={extraMarkup} onChange={e => setExtraMarkup(parseFloat(e.target.value) || 0)}
                  className="input pl-6" placeholder="0" />
              </div>
              <p className="text-xs text-[var(--text-faint)] mt-1">Ajuste adicional al precio final por gramo (+/−)</p>
            </div>
          </div>

          {/* Meta info */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] text-xs font-bold">4</span>
              Canal, prioridad y notas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Canal de origen</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.entries(SOURCE_CONFIG) as [SaleSource, typeof SOURCE_CONFIG[SaleSource]][]).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setSource(key)}
                      className={`px-2 py-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${source === key ? 'border-[var(--gold)] bg-[var(--gold)]/8 text-[var(--gold)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)]'}`}>
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Prioridad de envío</label>
                <div className="space-y-1.5">
                  {(Object.entries(PRIORITY_CONFIG) as [SalePriority, typeof PRIORITY_CONFIG[SalePriority]][]).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setPriority(key)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition-all ${priority === key ? 'border-[var(--gold)] bg-[var(--gold)]/8' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)]'}`}>
                      <span className={cfg.color}>{cfg.label}</span>
                      {priority === key && <CheckCircle size={12} className="text-[var(--gold)]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="label">Notas internas</label>
              <textarea className="input resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones especiales, notas de envío..." />
            </div>
            {/* Image upload mockup */}
            <div>
              <label className="label">Comprobante de envío (simulado)</label>
              <label className="flex flex-col items-center gap-2 border border-dashed border-[var(--border)] rounded-xl p-4 cursor-pointer hover:border-[var(--gold)]/40 transition-colors">
                {shippingFile ? (
                  <img src={shippingFile} alt="Comprobante" className="max-h-24 rounded-lg object-contain" />
                ) : (
                  <><Upload size={20} className="text-[var(--text-faint)]" />
                    <span className="text-xs text-[var(--text-faint)]">Haz clic para subir imagen</span></>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        </div>

        {/* Right: Breakdown + Submit */}
        <div className="space-y-4 lg:sticky lg:top-20 self-start">
          <BreakdownPanel preview={preview} loading={calcLoading} />

          {!client && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={13} /> Selecciona un cliente para continuar
            </div>
          )}

          <button type="submit" disabled={submitting || !client || !preview}
            className="btn-gold w-full justify-center py-3 text-sm font-semibold">
            {submitting ? <><Spinner size={14} /> Guardando venta...</> : `Confirmar venta${preview ? ` · ${fmtCurrency(preview.total)}` : ''}`}
          </button>
          <button type="button" onClick={() => navigate('/sales')} className="btn-ghost w-full justify-center text-xs">
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

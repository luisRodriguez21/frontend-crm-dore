import { type ReactNode, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import type { SaleStatus, SaleSource, SalePriority, MetalType } from '../../types';
import { STATUS_CONFIG, SOURCE_CONFIG, PRIORITY_CONFIG, METAL_CONFIG } from '../../utils/helpers';

// ─── Modal ────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}
export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} card shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h3 className="font-body text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
            <button onClick={onClose} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors rounded p-1 hover:bg-black/[0.05]">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-[var(--gold)] ${className}`} />;
}

// ─── Full Page Loader ─────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={28} />
        <span className="text-sm text-[var(--text-faint)]">Cargando...</span>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
export function Empty({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {icon && <div className="text-4xl opacity-30 mb-2">{icon}</div>}
      <div>
        <p className="text-[var(--text-primary)] font-medium">{title}</p>
        {description && <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
export function StatusBadge({ status }: { status: SaleStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`badge border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Source Badge ─────────────────────────────────────────────
export function SourceBadge({ source }: { source: SaleSource }) {
  const cfg = SOURCE_CONFIG[source];
  return (
    <span className={`badge ${cfg.color}`}>
      <span>{cfg.icon}</span> {cfg.label}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────────────────────
export function PriorityBadge({ priority }: { priority: SalePriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

// ─── Metal Badge ──────────────────────────────────────────────
export function MetalBadge({ metal }: { metal: MetalType }) {
  const cfg = METAL_CONFIG[metal];
  return <span className={`badge ${cfg.color}`}>{cfg.label}</span>;
}

// ─── Confirm Dialog ───────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--text-primary)]">{title}</h4>
          <p className="text-sm text-[var(--text-muted)] mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 btn-danger justify-center">
            {loading ? <Spinner size={14} /> : 'Eliminar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Search Input ─────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Buscar...' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 pr-4"
      />
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-end mt-4">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="btn-ghost px-3 py-2 text-xs disabled:opacity-30">← Anterior</button>
      <span className="text-xs text-[var(--text-muted)] px-2">Página {page} de {totalPages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="btn-ghost px-3 py-2 text-xs disabled:opacity-30">Siguiente →</button>
    </div>
  );
}

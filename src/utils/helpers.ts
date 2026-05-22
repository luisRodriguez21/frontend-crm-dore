import type { SaleStatus, SaleSource, SalePriority, MetalType, DiscountType } from '../types';

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n);

export const fmtNum = (n: number, decimals = 2) => n.toFixed(decimals);

export const fmtDate = (d: string) =>
  new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));

export const fmtDateTime = (d: string) =>
  new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

// ─── Status labels & colors ───────────────────────────────────
export const STATUS_CONFIG: Record<SaleStatus, { label: string; color: string; dot: string }> = {
  PENDING_SHIPMENT: { label: 'Pendiente',  color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  SHIPPED:          { label: 'Enviado',    color: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-500' },
  DELIVERED:        { label: 'Entregado',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED:        { label: 'Cancelado',  color: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-500' },
};

export const PRIORITY_CONFIG: Record<SalePriority, { label: string; color: string }> = {
  LOW:    { label: 'Baja',    color: 'text-stone-500' },
  MEDIUM: { label: 'Media',   color: 'text-blue-600' },
  HIGH:   { label: 'Alta',    color: 'text-amber-700' },
  URGENT: { label: 'Urgente', color: 'text-red-600' },
};

export const SOURCE_CONFIG: Record<SaleSource, { label: string; icon: string; color: string }> = {
  FACEBOOK:  { label: 'Facebook',  icon: '📘', color: 'bg-blue-50 text-blue-700' },
  WHATSAPP:  { label: 'WhatsApp',  icon: '💬', color: 'bg-emerald-50 text-emerald-700' },
  TIKTOK:    { label: 'TikTok',    icon: '🎵', color: 'bg-pink-50 text-pink-700' },
  INSTAGRAM: { label: 'Instagram', icon: '📸', color: 'bg-purple-50 text-purple-700' },
  WEBSITE:   { label: 'Website',   icon: '🌐', color: 'bg-sky-50 text-sky-700' },
  OTHER:     { label: 'Otro',      icon: '📦', color: 'bg-stone-100 text-stone-600' },
};

export const METAL_CONFIG: Record<MetalType, { label: string; color: string; accent: string }> = {
  GOLD:   { label: 'Oro',   color: 'bg-amber-50 text-amber-700',   accent: '#a16207' },
  SILVER: { label: 'Plata', color: 'bg-slate-100 text-slate-600',  accent: '#475569' },
  MIXED:  { label: 'Mixto', color: 'bg-violet-50 text-violet-700', accent: '#6d28d9' },
};

export const DISCOUNT_LABELS: Record<DiscountType, string> = {
  RETAIL:               'Menudeo',
  WHOLESALE_CLIENT:     'Mayoreo (Con Kit)',
  WHOLESALE_NON_CLIENT: 'Mayoreo (Sin Kit)',
  CUSTOM:               'Personalizado',
};

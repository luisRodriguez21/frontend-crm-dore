import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Users, Package, Settings,
  LogOut, TrendingUp, TrendingDown, Menu, X, ChevronDown
} from 'lucide-react';
import { metalPriceApi } from '../../api/services';
import { useAuth } from '../../store/AuthContext';
import type { MetalPrices } from '../../types';
import { fmtNum } from '../../utils/helpers';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sales/new', label: 'Nueva Venta', icon: ShoppingBag },
  { to: '/sales', label: 'Ventas', icon: ShoppingBag },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/config', label: 'Config.', icon: Settings, adminOnly: true },
];

function PriceTicker({ prices, prev }: { prices: MetalPrices | null; prev: MetalPrices | null }) {
  if (!prices) return (
    <div className="flex items-center gap-6 text-xs text-[var(--text-faint)] animate-pulse">
      <span>Cargando cotizaciones...</span>
    </div>
  );

  const goldDiff = prev ? prices.gold.spotPricePerGram - prev.gold.spotPricePerGram : 0;
  const silverDiff = prev ? prices.silver.spotPricePerGram - prev.silver.spotPricePerGram : 0;

  const Item = ({ label, value, diff, accent }: { label: string; value: number; diff: number; accent: string }) => {
    const up = diff >= 0;
    return (
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-faint)] text-xs font-mono uppercase tracking-widest">{label}</span>
        <span style={{ color: accent }} className="font-mono font-semibold text-sm tabular-nums">
          ${fmtNum(value, 2)}
          <span className="text-[10px] text-[var(--text-faint)] ml-1">MXN/g</span>
        </span>
        <span className={`flex items-center gap-0.5 text-xs font-mono ${up ? 'text-emerald-600' : 'text-red-600'}`}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(diff).toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-6">
      <Item label="Au" value={prices.gold.spotPricePerGram} diff={goldDiff} accent="#a16207" />
      <div className="w-px h-4 bg-[var(--border)]" />
      <Item label="Ag" value={prices.silver.spotPricePerGram} diff={silverDiff} accent="#475569" />
      {prices.gold.isManualOverride && (
        <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
          Manual
        </span>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [prices, setPrices] = useState<MetalPrices | null>(null);
  const [prevPrices, setPrevPrices] = useState<MetalPrices | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await metalPriceApi.getCurrent();
      if (res.data.data) {
        setPrevPrices(prices);
        setPrices(res.data.data);
      }
    } catch { /* silent */ }
  }, [prices]);

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 60_000); // refresh every 60s
    return () => clearInterval(id);
  }, []);

  const visibleNav = NAV_ITEMS.filter(i => !i.adminOnly || isAdmin);
  // Deduplicate sales
  const deduped = visibleNav.filter((item, idx, arr) =>
    item.to !== '/sales' || !arr.some((a, ai) => ai < idx && a.to === '/sales')
  );
  const navItems = [
    deduped.find(i => i.to === '/')!,
    deduped.find(i => i.to === '/sales/new')!,
    deduped.find(i => i.to === '/sales')!,
    deduped.find(i => i.to === '/clients')!,
    deduped.find(i => i.to === '/products')!,
    ...(isAdmin ? [deduped.find(i => i.to === '/config')!] : []),
  ].filter(Boolean);

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-[var(--border)] bg-[var(--bg-secondary)]/90 backdrop-blur-md flex items-center">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 w-56 shrink-0 border-r border-[var(--border)] h-full">
          <div className="w-7 h-7 rounded-lg bg-[#ce6f69] flex items-center justify-center shadow-gold-glow">
            <img src="../public/logo.png" />
          </div>
          <div className="leading-tight">
            <p className="font-body text-sm font-bold text-[var(--text-primary)] leading-none">JOYERÍA DORÉ</p>
          </div>
        </div>

        {/* Price ticker */}
        <div className="flex-1 flex items-center px-6">
          <PriceTicker prices={prices} prev={prevPrices} />
        </div>

        {/* Right side: user menu */}
        <div className="flex items-center gap-2 px-4 border-l border-[var(--border)] h-full">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#ce6f69] flex items-center justify-center text-yellow-50 text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium text-[var(--text-primary)] leading-none">{user?.name}</p>
                <p className="text-[10px] text-[var(--text-faint)] mt-0.5">{user?.role === 'ADMIN' ? 'Admin' : 'Vendedor'}</p>
              </div>
              <ChevronDown size={13} className="text-[var(--text-faint)]" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 card border border-[var(--border)] py-1 shadow-2xl z-50">
                <button
                  onClick={() => { logout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden p-2 btn-ghost">
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-14 left-0 bottom-0 z-30 w-56 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.to ||
              (item.to !== '/' && item.to !== '/sales/new' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${active
                  ? 'bg-[var(--gold)]/10 text-[var(--gold)] font-medium'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.04]'
                  }`}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
                {active && <div className="ml-auto w-1 h-1 rounded-full bg-[var(--gold)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <div className="rounded-lg bg-[var(--gold)]/5 border border-[var(--gold)]/15 p-3">
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-widest mb-1">Cotización actual</p>
            {prices ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-700 font-mono">Oro</span>
                  <span className="text-[var(--text-primary)] font-mono tabular-nums">${fmtNum(prices.gold.spotPricePerGram)}/g</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-mono">Plata</span>
                  <span className="text-[var(--text-primary)] font-mono tabular-nums">${fmtNum(prices.silver.spotPricePerGram)}/g</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-faint)] animate-pulse">Cargando...</p>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />}
    </>
  );
}

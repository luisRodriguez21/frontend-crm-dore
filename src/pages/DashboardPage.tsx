import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, Clock, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { salesApi } from '../api/services';
import { PageLoader, StatusBadge, SourceBadge } from '../components/ui';
import type { DashboardStats } from '../types';
import { fmtCurrency, fmtDateTime, SOURCE_CONFIG } from '../utils/helpers';

const SOURCE_COLORS: Record<string, string> = {
  FACEBOOK: '#3b82f6',
  WHATSAPP: '#22c55e',
  TIKTOK: '#ec4899',
  INSTAGRAM: '#a855f7',
  WEBSITE: '#06b6d4',
  OTHER: '#64748b',
};

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="stat-card card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider">{label}</p>
          <p className="text-md font-body font-bold text-[var(--text-primary)] mt-1">{value}</p>
          {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card border-[var(--border-light)] p-3 text-xs shadow-xl">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      <p className="font-semibold text-[var(--text-primary)]">{fmtCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salesApi.dashboard()
      .then(res => setStats(res.data.data!))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return null;

  const chartData = stats.salesBySource.map(s => ({
    name: SOURCE_CONFIG[s.source]?.label || s.source,
    source: s.source,
    total: s.total,
    count: s.count,
  }));

  return (
    <div className="space-y-6 stagger">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Resumen de operaciones</p>
        </div>
        <Link to="/sales/new" className="btn-gold">
          <Plus size={15} />
          Nueva Venta
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ventas hoy"
          value={String(stats.todaySales)}
          sub={`${fmtCurrency(stats.todayRevenue)} facturado`}
          icon={TrendingUp}
          accent="#a16207"
        />
        <StatCard
          label="Este mes"
          value={fmtCurrency(stats.thisMonthRevenue)}
          sub="ingresos totales"
          icon={DollarSign}
          accent="#15803d"
        />
        <StatCard
          label="Pendientes de envío"
          value={String(stats.pendingShipments)}
          sub="pedidos por enviar"
          icon={Clock}
          accent="#b91c1c"
        />
        <StatCard
          label="Canales activos"
          value={String(stats.salesBySource.length)}
          sub="con ventas registradas"
          icon={Package}
          accent="#4338ca"
        />
      </div>

      {/* Charts + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart by source */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Ventas por Canal</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map(entry => (
                    <Cell key={entry.source} fill={SOURCE_COLORS[entry.source] || '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[var(--text-faint)] text-sm">
              Sin datos de ventas aún
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Estado de Pedidos</h3>
          <div className="space-y-3">
            {stats.salesByStatus.map(s => (
              <div key={s.status} className="flex items-center justify-between">
                <StatusBadge status={s.status} />
                <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">{s.count}</span>
              </div>
            ))}
            {stats.salesByStatus.length === 0 && (
              <p className="text-sm text-[var(--text-faint)] text-center py-6">Sin ventas registradas</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-sm text-[var(--text-primary)]">Ventas Recientes</h3>
          <Link to="/sales" className="text-xs text-[var(--gold)] hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={11} />
          </Link>
        </div>
        {stats.recentSales.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-faint)] text-sm">Sin ventas aún</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {stats.recentSales.map(sale => (
              <Link
                key={sale.id}
                to={`/sales/${sale.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-black/[0.04] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[var(--gold)]">{sale.saleNumber}</span>
                    <SourceBadge source={sale.source} />
                  </div>
                  <p className="text-sm text-[var(--text-primary)] mt-0.5 truncate">{sale.clientName}</p>
                  <p className="text-xs text-[var(--text-faint)] mt-0.5">{fmtDateTime(sale.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-[var(--text-primary)] tabular-nums">{fmtCurrency(sale.total)}</p>
                  <div className="flex justify-end mt-1">
                    <StatusBadge status={sale.status} />
                  </div>
                </div>
                <ArrowRight size={14} className="text-[var(--text-faint)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

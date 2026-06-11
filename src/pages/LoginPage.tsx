import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Gem, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '../api/services';
import { useAuth } from '../store/AuthContext';
import type { AuthUser } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data.data!;
      const authUser: AuthUser = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      login(token, authUser);
      toast.success(`Bienvenido, ${user.name}`);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Credenciales inválidas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-300/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[var(--border)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[var(--border)]" />
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: 'linear-gradient(hsl(35,20%,82%) 1px, transparent 1px), linear-gradient(90deg, hsl(35,20%,82%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Glow behind card */}
        <div className="absolute inset-0 rounded-2xl bg-amber-400/15 blur-2xl scale-110" />

        <div className="relative card border-[var(--border-light)] overflow-hidden">
          {/* Gold top accent */}
          <div className="h-[2px] bg-[#ce6f69]" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#ce6f69] flex items-center justify-center shadow-pink-glow mb-4 animate-pulse-pink">
                <img src="/logo.png" />
              </div>
              <h1 className="font-display text-4xl pb-2 font-bold text-[var(--text-primary)] tracking-tight">
                Iniciar sesión
              </h1>
              <p className="text-[var(--text-faint)] text-s uppercase tracking-[0.2em] mt-1">
                Joyería · Doré
              </p>
            </div>

            {/* Divider with diamond */}
            <div className="flex items-center gap-3 mb-7">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-[var(--gold)] text-[10px]">◆</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@joyeria.com"
                  className="input"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="btn-pink w-full justify-center py-3 mt-2 text-sm font-semibold"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Verificando...</>
                  : 'Iniciar sesión'}
              </button>
            </form>

            <p className="text-center text-[10px] text-[var(--text-faint)] mt-6 uppercase tracking-wider">
              Acceso restringido · Personal autorizado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'login' | 'register' | 'forgot';

export function Auth() {
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const clear = () => { setError(''); setSuccess(''); };

  const handleLogin = async () => {
    if (!email || !password) { setError('Rellena todos los campos'); return; }
    setLoading(true); clear();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message === 'Invalid login credentials'
      ? 'Email o contraseña incorrectos'
      : error.message);
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password) { setError('Rellena todos los campos'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true); clear();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name: name || email.split('@')[0] } },
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('¡Cuenta creada! Revisa tu email para confirmar.');
    }
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!email) { setError('Introduce tu email'); return; }
    setLoading(true); clear();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setSuccess('Email enviado. Revisa tu bandeja de entrada.');
    setLoading(false);
  };

  const handleSubmit = () => {
    if (mode === 'login')    handleLogin();
    if (mode === 'register') handleRegister();
    if (mode === 'forgot')   handleForgot();
  };

  const titles = {
    login:    { h: 'Bienvenido de nuevo', sub: 'Accede a tu cuenta' },
    register: { h: 'Crear cuenta', sub: 'Empieza a gestionar tus finanzas' },
    forgot:   { h: 'Recuperar contraseña', sub: 'Te enviamos un enlace al email' },
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0A0A0A 0%, #111118 50%, #0A0A0A 100%)' }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #5856D6 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #0A84FF 0%, transparent 70%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-3xl flex items-center justify-center mb-4 shadow-brand"
            style={{ background: 'linear-gradient(135deg, #5856D6 0%, #0A84FF 100%)' }}
          >
            <Zap size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-white font-black text-2xl tracking-tight">FinanzApp</h1>
          <p className="text-white/40 text-sm mt-0.5">Personal Finance</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-6 shadow-dropdown"
          style={{ backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              <h2 className="text-white font-black text-xl mb-1">{titles[mode].h}</h2>
              <p className="text-white/40 text-sm mb-6">{titles[mode].sub}</p>

              <div className="space-y-3">
                {/* Name field (register only) */}
                {mode === 'register' && (
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      placeholder="Tu nombre (opcional)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm font-medium text-white placeholder:text-white/30 outline-none transition-all"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(88,86,214,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    />
                  </div>
                )}

                {/* Email */}
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm font-medium text-white placeholder:text-white/30 outline-none transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(88,86,214,0.6)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>

                {/* Password */}
                {mode !== 'forgot' && (
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Contraseña"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      className="w-full pl-10 pr-12 py-3.5 rounded-2xl text-sm font-medium text-white placeholder:text-white/30 outline-none transition-all"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(88,86,214,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    />
                    <button
                      onClick={() => setShowPass(x => !x)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                )}

                {/* Error / Success */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs font-semibold text-down px-1"
                    >
                      {error}
                    </motion.p>
                  )}
                  {success && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs font-semibold text-up px-1"
                    >
                      {success}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-opacity mt-1"
                  style={{
                    background: 'linear-gradient(135deg, #5856D6 0%, #0A84FF 100%)',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Crear cuenta' : 'Enviar enlace'}
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Mode switchers */}
          <div className="mt-5 pt-5 border-t border-white/8 space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('register'); clear(); }}
                  className="w-full text-sm text-white/40 hover:text-white/70 transition-colors font-medium"
                >
                  ¿No tienes cuenta? <span className="text-brand font-bold">Regístrate</span>
                </button>
                <button
                  onClick={() => { setMode('forgot'); clear(); }}
                  className="w-full text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </>
            )}
            {mode === 'register' && (
              <button
                onClick={() => { setMode('login'); clear(); }}
                className="w-full text-sm text-white/40 hover:text-white/70 transition-colors font-medium"
              >
                ¿Ya tienes cuenta? <span className="text-brand font-bold">Inicia sesión</span>
              </button>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => { setMode('login'); clear(); }}
                className="w-full text-sm text-white/40 hover:text-white/70 transition-colors font-medium"
              >
                ← Volver al login
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Tus datos están cifrados y son privados
        </p>
      </motion.div>
    </div>
  );
}

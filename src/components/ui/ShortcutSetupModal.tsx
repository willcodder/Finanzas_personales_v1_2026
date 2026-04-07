import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Copy, Check, RefreshCw, Download, ChevronRight, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Hosted on GitHub Pages — same origin as the app
const SHORTCUT_URL =
  'https://willcodder.github.io/Finanzas_personales_v1_2026/finanzapp.shortcut';

export function ShortcutSetupModal({ open, onClose }: Props) {
  const { user } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open && user) fetchToken();
    if (!open) setStep(0);
  }, [open, user]);

  const fetchToken = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('user_data')
      .select('personal_token')
      .eq('user_id', user!.id)
      .single();
    setToken(data?.personal_token ?? null);
    setLoading(false);
  };

  const regenerate = async () => {
    setRegenerating(true);
    const newToken = crypto.randomUUID();
    await supabase
      .from('user_data')
      .update({ personal_token: newToken })
      .eq('user_id', user!.id);
    setToken(newToken);
    setRegenerating(false);
  };

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    // ── Step 0: Download ───────────────────────────────────────────────────
    {
      label: 'Descargar',
      icon: '📲',
      content: (
        <div className="space-y-5">
          <p className="text-sm text-white/55 leading-relaxed">
            Descarga el Atajo oficial de FinanzApp. Funciona sin apps extra — solo la app
            <strong className="text-white/70"> Atajos</strong> de Apple que ya tienes instalada.
          </p>

          {/* Big download button */}
          <a
            href={SHORTCUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #5856D6 0%, #0A84FF 100%)' }}
          >
            <Download size={20} />
            Descargar Atajo
          </a>

          <div className="rounded-2xl bg-white/5 border border-white/8 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Instrucciones</p>
            {[
              'Pulsa "Descargar Atajo" desde Safari en tu iPhone',
              'Pulsa "Obtener atajo" cuando se abra la app Atajos',
              'Introduce tu token personal cuando te lo pida',
              '¡Listo! Úsalo desde la pantalla de inicio o el widget',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #5856D6, #0A84FF)' }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand/70 transition-colors"
          >
            Ver mi token <ChevronRight size={14} />
          </button>
        </div>
      ),
    },

    // ── Step 1: Token ──────────────────────────────────────────────────────
    {
      label: 'Tu token',
      icon: '🔑',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">
            Al instalar el Atajo, iOS te pedirá este token para identificar tu cuenta.
            Cópialo y pégalo en el campo que aparezca.
          </p>

          {loading ? (
            <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ) : token ? (
            <>
              <div className="relative">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 pr-14">
                  <p className="text-2xs text-white/30 font-semibold uppercase tracking-widest mb-1.5">
                    Token personal
                  </p>
                  <p className="text-white font-mono text-sm break-all leading-relaxed">
                    {token}
                  </p>
                </div>
                <button
                  onClick={copyToken}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  {copied
                    ? <Check size={16} className="text-green-400" />
                    : <Copy size={16} className="text-white/60" />
                  }
                </button>
              </div>

              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-green-400/80 text-center"
                >
                  ✓ Token copiado al portapapeles
                </motion.p>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400/80">
                No se encontró token. Asegúrate de haber ejecutado el SQL de configuración en Supabase.
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-yellow-500/8 border border-yellow-500/15 p-3.5">
            <p className="text-xs text-yellow-400/70 leading-relaxed">
              <strong>Importante:</strong> no compartas tu token. Si lo haces por error, pulsa "Regenerar" para invalidarlo.
            </p>
          </div>

          <button
            onClick={regenerate}
            disabled={regenerating}
            className="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            <RefreshCw size={11} className={regenerating ? 'animate-spin' : ''} />
            {regenerating ? 'Regenerando...' : 'Regenerar token'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] z-50 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{ backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #5856D6 0%, #0A84FF 100%)' }}
                >
                  <Smartphone size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Atajo de iPhone</p>
                  <p className="text-2xs text-white/30">Añade gastos en 2 segundos</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all"
              >
                <X size={15} className="text-white/60" />
              </button>
            </div>

            {/* Tab pills */}
            <div className="flex gap-1.5 px-5 py-3 border-b border-white/8 flex-shrink-0">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    step === i ? 'text-white' : 'text-white/35 hover:text-white/60 hover:bg-white/5'
                  }`}
                  style={
                    step === i
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(88,86,214,0.5) 0%, rgba(10,132,255,0.3) 100%)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }
                      : {}
                  }
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {steps[step].content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/8 flex-shrink-0">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setStep(i)}
                    className={`cursor-pointer rounded-full transition-all ${
                      i === step ? 'w-4 h-1.5 bg-brand' : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #5856D6, #0A84FF)' }}
              >
                <Zap size={13} />
                Listo
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Copy, Check, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const BASE = 'https://willcodder.github.io/Finanzas_personales_v1_2026';

export function ShortcutSetupModal({ open, onClose }: Props) {
  const { user }                      = useAuthStore();
  const [token, setToken]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied]           = useState<string | null>(null);
  const [step, setStep]               = useState(0);

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
    const t = crypto.randomUUID();
    await supabase
      .from('user_data')
      .update({ personal_token: t })
      .eq('user_id', user!.id);
    setToken(t);
    setRegenerating(false);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const expenseUrl = token ? `${BASE}/?q=expense&t=${token}` : null;
  const incomeUrl  = token ? `${BASE}/?q=income&t=${token}`  : null;

  const steps = [
    // ── Paso 0: Cómo funciona ─────────────────────────────────────────────
    {
      label: 'Qué es',
      icon: '⚡',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">
            Cada usuario tiene una <strong className="text-white/80">URL única y cifrada</strong> que
            identifica su cuenta. Añádela a la pantalla de inicio del iPhone y tendrás
            acceso instantáneo sin iniciar sesión.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: '💸', title: 'Gasto rápido', desc: 'Abre en modo gasto', color: 'rgba(255,59,48,0.12)', border: 'rgba(255,59,48,0.25)' },
              { icon: '💰', title: 'Ingreso rápido', desc: 'Abre en modo ingreso', color: 'rgba(48,209,88,0.12)', border: 'rgba(48,209,88,0.25)' },
            ].map(({ icon, title, desc, color, border }) => (
              <div
                key={title}
                className="rounded-2xl p-4 space-y-1.5"
                style={{ background: color, border: `1px solid ${border}` }}
              >
                <span className="text-2xl">{icon}</span>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl p-3.5"
            style={{ background: 'rgba(88,86,214,0.12)', border: '1px solid rgba(88,86,214,0.25)' }}
          >
            <p className="text-xs text-white/60 leading-relaxed">
              🔒 Tu URL incluye un token único de 32 caracteres. Nadie más puede acceder
              a tus datos. Si lo compartes por error, regénéralo en 1 segundo.
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
          >
            Ver mis URLs personales <ChevronRight size={15} />
          </button>
        </div>
      ),
    },

    // ── Paso 1: URLs personalizadas ───────────────────────────────────────
    {
      label: 'Mis URLs',
      icon: '🔗',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">
            Estas URLs son <strong className="text-white/75">exclusivamente tuyas</strong>.
            Cópialas y ábrelas en Safari para instalarlas en tu iPhone.
          </p>

          {loading ? (
            <div className="space-y-2">
              <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
              <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            </div>
          ) : token ? (
            <>
              {[
                { label: '💸 Gasto rápido', url: expenseUrl!, key: 'expense' },
                { label: '💰 Ingreso rápido', url: incomeUrl!, key: 'income' },
              ].map(({ label, url, key }) => (
                <div
                  key={key}
                  className="rounded-2xl p-4"
                  style={{ background: '#2C2C2E', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-white">{label}</p>
                    <button
                      onClick={() => copy(url, key)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: copied === key
                          ? 'rgba(48,209,88,0.2)'
                          : 'rgba(10,132,255,0.2)',
                      }}
                    >
                      {copied === key ? (
                        <><Check size={11} className="text-green-400" /><span className="text-green-400">Copiada</span></>
                      ) : (
                        <><Copy size={11} className="text-brand" /><span className="text-brand">Copiar</span></>
                      )}
                    </button>
                  </div>
                  <p className="text-2xs text-white/25 font-mono break-all leading-relaxed">{url}</p>
                </div>
              ))}

              <button
                onClick={regenerate}
                disabled={regenerating}
                className="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors"
              >
                <RefreshCw size={11} className={regenerating ? 'animate-spin' : ''} />
                {regenerating ? 'Regenerando…' : 'Regenerar token (invalida las URLs anteriores)'}
              </button>
            </>
          ) : (
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)' }}
            >
              <p className="text-sm text-red-400/80">
                No se encontró token. Ejecuta el SQL de configuración en Supabase primero.
              </p>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand/70 transition-colors"
          >
            Cómo instalar en iPhone <ChevronRight size={14} />
          </button>
        </div>
      ),
    },

    // ── Paso 2: Instrucciones ─────────────────────────────────────────────
    {
      label: 'Instalar',
      icon: '📲',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">
            En tu iPhone, con <strong className="text-white/75">Safari</strong>:
          </p>

          {[
            { n: '1', icon: '📋', title: 'Copia tu URL', detail: 'Pulsa "Copiar" en el paso anterior para la URL que quieras (gasto o ingreso).' },
            { n: '2', icon: '🌐', title: 'Pégala en Safari', detail: 'Abre Safari, pega la URL en la barra de dirección y carga la página.' },
            { n: '3', icon: '⬆️', title: 'Pulsa compartir', detail: 'El icono de cuadrado con flecha ↑ en la barra de Safari.' },
            { n: '4', icon: '➕', title: '"Añadir a inicio"', detail: 'Busca "Añadir a pantalla de inicio", ponle nombre (ej: "💸 Gasto") y pulsa Añadir.' },
            { n: '5', icon: '🚀', title: '¡Listo!', detail: 'El icono aparece en tu pantalla. Al abrirlo, accede directo a tus datos.' },
          ].map(({ n, icon, title, detail }) => (
            <div key={n} className="flex gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
              >
                {n}
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">{icon} {title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}

          <div
            className="rounded-2xl p-3.5"
            style={{ background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)' }}
          >
            <p className="text-xs text-brand/80 leading-relaxed">
              💡 Instala los dos: uno para gastos y otro para ingresos. Tardarás 2 minutos en total.
            </p>
          </div>
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
                  style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
                >
                  <Smartphone size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Acceso rápido iPhone</p>
                  <p className="text-2xs text-white/30">URL única por usuario</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all"
              >
                <X size={15} className="text-white/60" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 py-2.5 border-b border-white/8 flex-shrink-0">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    step === i ? 'text-white' : 'text-white/30 hover:text-white/55 hover:bg-white/5'
                  }`}
                  style={step === i ? {
                    background: 'linear-gradient(135deg,rgba(88,86,214,0.5),rgba(10,132,255,0.3))',
                    border: '1px solid rgba(255,255,255,0.08)',
                  } : {}}
                >
                  <span>{s.icon}</span>
                  <span className="hidden sm:inline">{s.label}</span>
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
                style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
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

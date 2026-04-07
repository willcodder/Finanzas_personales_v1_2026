import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Copy, Check, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SUPABASE_URL = 'https://hicijarieecjfhkaefsw.supabase.co';
const ANON_KEY = 'sb_publishable_-2miYdpSur7pXIIE5ESe8Q_Q1JQYhcI';
const RPC_URL = `${SUPABASE_URL}/rest/v1/rpc/quick_add_transaction`;

export function ShortcutSetupModal({ open, onClose }: Props) {
  const { user } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (open && user) fetchToken();
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

  const regenerateToken = async () => {
    setLoading(true);
    const newToken = crypto.randomUUID();
    await supabase
      .from('user_data')
      .update({ personal_token: newToken })
      .eq('user_id', user!.id);
    setToken(newToken);
    setLoading(false);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      title: 'Tu token personal',
      icon: '🔑',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/50 leading-relaxed">
            Este token identifica tu cuenta. Nunca lo compartas. Si crees que está comprometido, regénéralo.
          </p>

          {loading ? (
            <div className="h-14 rounded-2xl bg-white/5 animate-pulse" />
          ) : token ? (
            <div className="relative">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 pr-12">
                <p className="text-xs text-white/30 font-medium mb-1 uppercase tracking-wider">Token</p>
                <p className="text-white/80 font-mono text-sm break-all leading-relaxed">{token}</p>
              </div>
              <button
                onClick={() => copy(token, 'token')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                {copied === 'token'
                  ? <Check size={14} className="text-green-400" />
                  : <Copy size={14} className="text-white/60" />
                }
              </button>
            </div>
          ) : (
            <p className="text-sm text-red-400/80">
              No se encontró token. Asegúrate de haber ejecutado el SQL de configuración.
            </p>
          )}

          <button
            onClick={regenerateToken}
            disabled={loading}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <RefreshCw size={12} />
            Regenerar token
          </button>
        </div>
      ),
    },
    {
      title: 'URL del Atajo',
      icon: '🔗',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/50 leading-relaxed">
            El Atajo hace una petición POST a esta URL con tus datos.
          </p>

          <div className="relative">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 pr-12">
              <p className="text-xs text-white/30 font-medium mb-1 uppercase tracking-wider">URL</p>
              <p className="text-white/70 font-mono text-xs break-all leading-relaxed">{RPC_URL}</p>
            </div>
            <button
              onClick={() => copy(RPC_URL, 'url')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              {copied === 'url'
                ? <Check size={14} className="text-green-400" />
                : <Copy size={14} className="text-white/60" />
              }
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-white/30 font-medium uppercase tracking-wider">Cabeceras (Headers)</p>
            {[
              { key: 'apikey', value: ANON_KEY },
              { key: 'Content-Type', value: 'application/json' },
            ].map(({ key, value }) => (
              <div key={key} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 px-3 py-2">
                <span className="text-xs text-brand font-mono flex-shrink-0">{key}:</span>
                <span className="text-xs text-white/50 font-mono truncate">{value}</span>
                <button onClick={() => copy(value, key)} className="ml-auto flex-shrink-0">
                  {copied === key
                    ? <Check size={11} className="text-green-400" />
                    : <Copy size={11} className="text-white/30 hover:text-white/60" />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Cuerpo JSON',
      icon: '📦',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/50 leading-relaxed">
            Este JSON es lo que envía el Atajo. Los valores de ejemplo los reemplazarás por variables del Atajo.
          </p>

          {token && (
            <div className="relative">
              <pre className="rounded-2xl bg-black/40 border border-white/10 p-4 pr-12 text-xs text-green-400/80 font-mono leading-relaxed overflow-x-auto">
{`{
  "p_token": "${token.slice(0, 8)}...${token.slice(-4)}",
  "p_amount": [Variable: Importe],
  "p_type": "expense",
  "p_category": [Variable: Categoría],
  "p_description": [Variable: Nota],
  "p_date": [Variable: Fecha actual]
}`}
              </pre>
              <button
                onClick={() => copy(JSON.stringify({
                  p_token: token,
                  p_amount: 0,
                  p_type: 'expense',
                  p_category: 'Comida',
                  p_description: '',
                  p_date: new Date().toISOString().split('T')[0],
                }), 'json')}
                className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                {copied === 'json'
                  ? <Check size={14} className="text-green-400" />
                  : <Copy size={14} className="text-white/60" />
                }
              </button>
            </div>
          )}

          <div>
            <p className="text-xs text-white/30 font-medium uppercase tracking-wider mb-2">Categorías disponibles</p>
            <div className="flex flex-wrap gap-1.5">
              {['Comida','Transporte','Ropa','Salud','Entretenimiento','Hogar','Trabajo','Otros'].map(cat => (
                <button
                  key={cat}
                  onClick={() => copy(cat, `cat-${cat}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 hover:bg-white/10 transition-all font-mono"
                >
                  {copied === `cat-${cat}` ? '✓' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Crear el Atajo en iPhone',
      icon: '📱',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-white/50 leading-relaxed">
            Abre la app <strong className="text-white/70">Atajos</strong> en tu iPhone y crea uno nuevo con estas acciones:
          </p>

          {[
            { step: '1', action: 'Solicitar entrada', detail: 'Tipo: Número → guarda en variable "Importe"' },
            { step: '2', action: 'Elegir del menú', detail: '"Gasto" → variable type = expense\n"Ingreso" → variable type = income' },
            { step: '3', action: 'Elegir del menú', detail: 'Añade las categorías: Comida, Transporte, Ropa, Salud, Entretenimiento, Hogar, Otros' },
            { step: '4', action: 'Solicitar entrada', detail: 'Tipo: Texto → "Nota (opcional)" → variable "Nota"' },
            { step: '5', action: 'Fecha actual', detail: 'Formato: Año-Mes-Día (YYYY-MM-DD) → variable "Hoy"' },
            { step: '6', action: 'Obtener contenido de URL', detail: 'Método: POST\nURL: la del paso 2\nHeaders: los del paso 2\nCuerpo: JSON del paso 3 con tus variables' },
            { step: '7', action: 'Notificación', detail: '"✅ Gasto añadido"' },
          ].map(({ step, action, detail }) => (
            <div key={step} className="flex gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: 'linear-gradient(135deg, #5856D6, #0A84FF)' }}
              >
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">{action}</p>
                <p className="text-xs text-white/40 leading-relaxed whitespace-pre-line">{detail}</p>
              </div>
            </div>
          ))}

          <div className="mt-4 rounded-2xl bg-brand/10 border border-brand/20 p-3">
            <p className="text-xs text-brand/80 leading-relaxed">
              <strong>Consejo:</strong> En la acción "Obtener contenido de URL", selecciona Solicitar como cuerpo → JSON → añade cada campo manualmente usando las variables que creaste.
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
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] z-50 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{ backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #5856D6 0%, #0A84FF 100%)' }}
                >
                  <Smartphone size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Atajo de iPhone</p>
                  <p className="text-2xs text-white/30">Añade gastos en segundos</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all"
              >
                <X size={15} className="text-white/60" />
              </button>
            </div>

            {/* Step tabs */}
            <div className="flex gap-1 px-4 py-3 border-b border-white/8 flex-shrink-0 overflow-x-auto scrollbar-hide">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeStep === i
                      ? 'text-white'
                      : 'text-white/35 hover:text-white/60 hover:bg-white/5'
                  }`}
                  style={activeStep === i ? { background: 'linear-gradient(135deg, rgba(88,86,214,0.5) 0%, rgba(10,132,255,0.3) 100%)', border: '1px solid rgba(255,255,255,0.08)' } : {}}
                >
                  <span>{s.icon}</span>
                  <span className="hidden sm:inline">{s.title}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
              ))}
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="text-base font-bold text-white mb-4">
                    {steps[activeStep].icon} {steps[activeStep].title}
                  </p>
                  {steps[activeStep].content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/8 flex-shrink-0">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="text-sm text-white/30 hover:text-white/60 disabled:opacity-0 transition-all"
              >
                Anterior
              </button>
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all ${i === activeStep ? 'w-4 h-1.5 bg-brand' : 'w-1.5 h-1.5 bg-white/15'}`}
                  />
                ))}
              </div>
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80 transition-all"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #5856D6, #0A84FF)' }}
                >
                  <Zap size={13} />
                  Listo
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

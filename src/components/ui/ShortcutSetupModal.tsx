import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Copy, Check, ChevronRight, Zap } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const BASE = 'https://willcodder.github.io/Finanzas_personales_v1_2026';
const EXPENSE_URL = `${BASE}/?q=expense`;
const INCOME_URL  = `${BASE}/?q=income`;

export function ShortcutSetupModal({ open, onClose }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [step, setStep]     = useState(0);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      label: 'Cómo funciona',
      icon: '📱',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">
            Sin descargas. Añade la app a tu pantalla de inicio desde Safari
            y tendrás un icono que abre directamente el formulario de añadir gastos.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.2)' }}
            >
              <span className="text-2xl">💸</span>
              <p className="text-sm font-bold text-white">Gasto rápido</p>
              <p className="text-xs text-white/40 leading-snug">Abre directo en modo gasto</p>
            </div>
            <div
              className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: 'rgba(48,209,88,0.12)', border: '1px solid rgba(48,209,88,0.2)' }}
            >
              <span className="text-2xl">💰</span>
              <p className="text-sm font-bold text-white">Ingreso rápido</p>
              <p className="text-xs text-white/40 leading-snug">Abre directo en modo ingreso</p>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
          >
            Ver cómo instalarlo <ChevronRight size={15} />
          </button>
        </div>
      ),
    },
    {
      label: 'Instalar',
      icon: '⬇️',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">
            Sigue estos pasos en tu iPhone con <strong className="text-white/75">Safari</strong>:
          </p>

          {[
            {
              n: '1', icon: '🌐',
              title: 'Abre la URL en Safari',
              detail: 'Copia la URL de "Gasto rápido" o "Ingreso rápido" y ábrela en Safari.',
            },
            {
              n: '2', icon: '⬆️',
              title: 'Pulsa el botón compartir',
              detail: 'El icono de cuadrado con flecha hacia arriba, en la barra inferior de Safari.',
            },
            {
              n: '3', icon: '➕',
              title: '"Añadir a pantalla de inicio"',
              detail: 'Desplázate en el menú hasta encontrar esta opción y pulsa "Añadir".',
            },
            {
              n: '4', icon: '⚡',
              title: '¡Listo!',
              detail: 'Aparecerá un icono en tu pantalla de inicio. Al pulsarlo, se abre el formulario al instante.',
            },
          ].map(({ n, icon, title, detail }) => (
            <div key={n} className="flex gap-3">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
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

          <button
            onClick={() => setStep(2)}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
          >
            Ver las URLs <ChevronRight size={15} />
          </button>
        </div>
      ),
    },
    {
      label: 'URLs',
      icon: '🔗',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">
            Copia la URL que quieras y ábrela en Safari para instalarla.
          </p>

          {[
            { label: '💸 Gasto rápido', url: EXPENSE_URL, key: 'expense' },
            { label: '💰 Ingreso rápido', url: INCOME_URL, key: 'income' },
          ].map(({ label, url, key }) => (
            <div
              key={key}
              className="rounded-2xl p-4"
              style={{ background: '#2C2C2E', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{label}</p>
                <button
                  onClick={() => copy(url, key)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: copied === key ? 'rgba(48,209,88,0.2)' : 'rgba(10,132,255,0.2)' }}
                >
                  {copied === key
                    ? <><Check size={11} className="text-green-400" /><span className="text-green-400">Copiada</span></>
                    : <><Copy size={11} className="text-brand" /><span className="text-brand">Copiar</span></>
                  }
                </button>
              </div>
              <p className="text-xs text-white/30 font-mono break-all leading-relaxed">{url}</p>
            </div>
          ))}

          <div
            className="rounded-2xl p-3.5"
            style={{ background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)' }}
          >
            <p className="text-xs text-brand/80 leading-relaxed">
              <strong>Consejo:</strong> Instala los dos — uno para gastos y otro para ingresos. Ponles nombres como "💸 Gasto" y "💰 Ingreso" al guardarlos.
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
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] z-50 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
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
                  <p className="text-2xs text-white/30">Añade a pantalla de inicio</p>
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

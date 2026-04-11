import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Smartphone, Copy, Check, Zap, RefreshCw, Database,
  ChevronRight, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const BASE = 'https://willcodder.github.io/Finanzas_personales_v1_2026';

const SQL = `-- Ejecutar UNA VEZ en Supabase → SQL Editor
ALTER TABLE public.user_data
  ADD COLUMN IF NOT EXISTS personal_token UUID DEFAULT gen_random_uuid();
UPDATE public.user_data SET personal_token=gen_random_uuid() WHERE personal_token IS NULL;

CREATE OR REPLACE FUNCTION public.get_quick_add_data(p_token UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT data INTO v_data FROM public.user_data WHERE personal_token=p_token;
  IF v_data IS NULL THEN RETURN '{"error":"not_found"}'::JSON; END IF;
  RETURN json_build_object('categories',COALESCE(v_data->'categories','[]'),'account_id',v_data->'accounts'->0->>'id');
END; $$;
GRANT EXECUTE ON FUNCTION public.get_quick_add_data(UUID) TO anon;

CREATE OR REPLACE FUNCTION public.quick_add_transaction(
  p_token UUID,p_amount TEXT,p_type TEXT,
  p_category TEXT,p_description TEXT DEFAULT '',p_date TEXT DEFAULT NULL
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id UUID;v_data JSONB;v_tid TEXT;v_acc TEXT;v_cat TEXT;v_tx JSONB;
BEGIN
  SELECT user_id,data INTO v_user_id,v_data FROM public.user_data WHERE personal_token=p_token;
  IF v_user_id IS NULL THEN RETURN '{"error":"token_invalid"}'::JSON; END IF;
  SELECT cat->>'id' INTO v_cat FROM jsonb_array_elements(COALESCE(v_data->'categories','[]')) cat WHERE lower(cat->>'name')=lower(p_category) LIMIT 1;
  IF v_cat IS NULL THEN SELECT cat->>'id' INTO v_cat FROM jsonb_array_elements(COALESCE(v_data->'categories','[]')) cat WHERE cat->>'type'=p_type OR cat->>'type'='both' LIMIT 1; END IF;
  v_tid:='qt_'||floor(extract(epoch from clock_timestamp())*1000)::bigint::text;
  v_acc:=v_data->'accounts'->0->>'id';
  v_tx:=jsonb_build_object('id',v_tid,'amount',(p_amount::NUMERIC),'type',p_type,'categoryId',COALESCE(v_cat,'other'),'description',COALESCE(p_description,''),'date',COALESCE(p_date,to_char(NOW(),'YYYY-MM-DD')),'accountId',COALESCE(v_acc,''));
  UPDATE public.user_data SET data=jsonb_set(data,'{transactions}',COALESCE(data->'transactions','[]')||v_tx),updated_at=NOW() WHERE user_id=v_user_id;
  RETURN json_build_object('ok',true,'id',v_tid);
END; $$;
GRANT EXECUTE ON FUNCTION public.quick_add_transaction(UUID,TEXT,TEXT,TEXT,TEXT,TEXT) TO anon,authenticated;`;

type Status = 'loading' | 'no-sql' | 'ready';

export function ShortcutSetupModal({ open, onClose }: Props) {
  const { user }                        = useAuthStore();
  const [status, setStatus]             = useState<Status>('loading');
  const [token, setToken]               = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied]             = useState<string | null>(null);
  const [step, setStep]                 = useState(0);

  useEffect(() => {
    if (open && user) init();
    if (!open) { setStep(0); setStatus('loading'); }
  }, [open, user]);

  const init = async () => {
    setStatus('loading');
    const { data, error } = await supabase
      .from('user_data')
      .select('personal_token')
      .eq('user_id', user!.id)
      .single();

    if (error || data?.personal_token === undefined) {
      // Column doesn't exist → SQL not run yet
      setStatus('no-sql');
      return;
    }

    if (!data.personal_token) {
      // Column exists but no token → auto-generate
      const t = crypto.randomUUID();
      await supabase.from('user_data').update({ personal_token: t }).eq('user_id', user!.id);
      setToken(t);
    } else {
      setToken(data.personal_token);
    }
    setStatus('ready');
  };

  const regenerate = async () => {
    setRegenerating(true);
    const t = crypto.randomUUID();
    await supabase.from('user_data').update({ personal_token: t }).eq('user_id', user!.id);
    setToken(t);
    setRegenerating(false);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2500);
  };

  const expenseUrl = token ? `${BASE}/?q=expense&t=${token}` : '';
  const incomeUrl  = token ? `${BASE}/?q=income&t=${token}`  : '';

  // ── SQL not run yet ────────────────────────────────────────────────────
  if (status === 'no-sql') {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] z-50 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
              style={{ backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}>
                    <Database size={17} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Configuración inicial</p>
                    <p className="text-2xs text-white/30">Solo una vez</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center"><X size={15} className="text-white/60" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl" style={{ background: 'rgba(255,159,10,0.1)', border: '1px solid rgba(255,159,10,0.25)' }}>
                  <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-400/80 leading-relaxed">
                    Necesitas ejecutar este SQL en Supabase antes de poder usar el acceso rápido.
                  </p>
                </div>

                <p className="text-sm text-white/55 leading-relaxed">
                  Copia el SQL, ve a <strong className="text-white/75">Supabase → SQL Editor</strong> y ejecútalo. Solo hay que hacerlo una vez y funcionará para todos los usuarios.
                </p>

                <div className="relative">
                  <pre className="rounded-2xl p-4 pr-12 text-2xs font-mono text-green-400/80 leading-relaxed overflow-auto max-h-52"
                    style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {SQL}
                  </pre>
                  <button onClick={() => copy(SQL, 'sql')}
                    className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                    {copied === 'sql' ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-white/50" />}
                  </button>
                </div>

                {copied === 'sql' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-400/80 text-center">
                    ✓ Copiado — pégalo en Supabase → SQL Editor → Run
                  </motion.p>
                )}

                <button
                  onClick={init}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
                >
                  Ya lo ejecuté — Continuar <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] z-50 rounded-3xl p-8 flex items-center justify-center"
              style={{ backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-brand"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── Ready — show tabs ──────────────────────────────────────────────────
  const steps = [
    {
      label: 'Mis URLs',
      icon: '🔗',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">
            Estas URLs son <strong className="text-white/80">únicas para tu cuenta</strong>.
            Llevan tu token cifrado embebido — nadie más puede usarlas.
          </p>

          {[
            { label: '💸 Gasto rápido',  url: expenseUrl, key: 'expense' },
            { label: '💰 Ingreso rápido', url: incomeUrl,  key: 'income'  },
          ].map(({ label, url, key }) => (
            <div key={key} className="rounded-2xl p-4 space-y-2"
              style={{ background: '#2C2C2E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">{label}</p>
                <button onClick={() => copy(url, key)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: copied === key ? 'rgba(48,209,88,0.2)' : 'rgba(10,132,255,0.2)' }}>
                  {copied === key
                    ? <><Check size={11} className="text-green-400" /><span className="text-green-400">Copiada</span></>
                    : <><Copy size={11} className="text-brand" /><span className="text-brand">Copiar</span></>
                  }
                </button>
              </div>
              <p className="text-2xs text-white/30 font-mono break-all leading-relaxed">{url}</p>
            </div>
          ))}

          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(88,86,214,0.1)', border: '1px solid rgba(88,86,214,0.2)' }}>
            <p className="text-xs text-white/50 leading-relaxed">
              🔒 Si compartes la URL por error, pulsa "Regenerar" — las URLs antiguas dejan de funcionar al instante.
            </p>
          </div>

          <button onClick={regenerate} disabled={regenerating}
            className="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors">
            <RefreshCw size={11} className={regenerating ? 'animate-spin' : ''} />
            {regenerating ? 'Regenerando…' : 'Regenerar token'}
          </button>
        </div>
      ),
    },
    {
      label: 'Instalar',
      icon: '📲',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">
            Abre <strong className="text-white/75">Safari</strong> en tu iPhone y sigue estos pasos:
          </p>

          {/* URLs personalizadas visibles aquí también */}
          <div className="space-y-2">
            {[
              { label: '💸 Gasto rápido',  url: expenseUrl, key: 'exp2' },
              { label: '💰 Ingreso rápido', url: incomeUrl,  key: 'inc2' },
            ].map(({ label, url, key }) => (
              <div key={key} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: '#2C2C2E', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-semibold text-white/60 flex-1 min-w-0">
                  {label}
                  <span className="block text-2xs text-white/25 font-mono truncate mt-0.5">{url}</span>
                </span>
                <button onClick={() => copy(url, key)}
                  className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all">
                  {copied === key ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-white/40" />}
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-1">
            {[
              { n: '1', title: 'Copia la URL de arriba', detail: 'Pulsa el icono de copiar junto a la URL que quieras instalar.' },
              { n: '2', title: 'Pégala en Safari', detail: 'Abre Safari en tu iPhone, pega la URL y carga la página.' },
              { n: '3', title: 'Pulsa el botón compartir ⬆️', detail: 'El icono de cuadrado con flecha en la barra inferior de Safari.' },
              { n: '4', title: '"Añadir a pantalla de inicio"', detail: 'Ponle nombre corto: "💸 Gasto" o "💰 Ingreso" → Añadir.' },
              { n: '5', title: '¡Listo!', detail: 'El icono queda en tu pantalla. Al pulsarlo abre directo tu formulario.' },
            ].map(({ n, title, detail }) => (
              <div key={n} className="flex gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold text-white mt-0.5"
                  style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}>
                  {n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">{title}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
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
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}>
                  <Smartphone size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Acceso rápido iPhone</p>
                  <p className="text-2xs text-white/30 font-mono truncate max-w-[180px]">
                    {token ? `···${token.slice(-8)}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all">
                <X size={15} className="text-white/60" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 py-2.5 border-b border-white/8 flex-shrink-0">
              {steps.map((s, i) => (
                <button key={i} onClick={() => setStep(i)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    step === i ? 'text-white' : 'text-white/30 hover:text-white/55 hover:bg-white/5'
                  }`}
                  style={step === i ? {
                    background: 'linear-gradient(135deg,rgba(88,86,214,0.5),rgba(10,132,255,0.3))',
                    border: '1px solid rgba(255,255,255,0.08)',
                  } : {}}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                <motion.div key={step}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}>
                  {steps[step].content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/8 flex-shrink-0">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} onClick={() => setStep(i)}
                    className={`cursor-pointer rounded-full transition-all ${
                      i === step ? 'w-4 h-1.5 bg-brand' : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
                    }`} />
                ))}
              </div>
              <button onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}>
                <Zap size={13} /> Listo
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

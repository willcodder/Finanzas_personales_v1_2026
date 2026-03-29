import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Debt, CategoryColor } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCompact, formatDate, percentage } from '../utils/format';
import { colorMap, colorOptions } from '../utils/colors';

const ICONS = ['💳','🏦','🏠','🚗','🎓','💊','📱','💻','🛒','💰','🤝','📋','🏢','💼'];

function DebtForm({ onClose }: { onClose: () => void }) {
  const { addDebt } = useStore();
  const [name, setName]           = useState('');
  const [creditor, setCreditor]   = useState('');
  const [total, setTotal]         = useState('');
  const [remaining, setRemaining] = useState('');
  const [rate, setRate]           = useState('');
  const [dueDate, setDueDate]     = useState('');
  const [icon, setIcon]           = useState('💳');
  const [color, setColor]         = useState<CategoryColor>('red');

  const submit = () => {
    if (!name || !total || !creditor) return;
    const t = parseFloat(total);
    addDebt({
      name, creditor,
      totalAmount: t,
      remainingAmount: remaining ? parseFloat(remaining) : t,
      interestRate: rate ? parseFloat(rate) : undefined,
      dueDate: dueDate ? new Date(dueDate + 'T12:00:00').toISOString() : undefined,
      icon, color,
    });
    onClose();
  };

  return (
    <div className="p-5 space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink">Icono</label>
        <div className="flex flex-wrap gap-1.5">
          {ICONS.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                icon === ic ? 'bg-down-light ring-1 ring-down' : 'bg-surface hover:bg-border/50'
              }`}
            >{ic}</button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink">Color</label>
        <div className="flex gap-2 flex-wrap">
          {colorOptions.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-card' : ''}`}
              style={{ backgroundColor: colorMap[c].hex }}
            />
          ))}
        </div>
      </div>
      <Input label="Nombre" placeholder="Ej. Tarjeta de crédito" value={name} onChange={e => setName(e.target.value)} />
      <Input label="Acreedor" placeholder="Ej. Banco Nacional" value={creditor} onChange={e => setCreditor(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Monto total" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={total} onChange={e => setTotal(e.target.value)} />
        <Input label="Saldo pendiente" type="number" inputMode="decimal" placeholder="= Total" prefix="$" value={remaining} onChange={e => setRemaining(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Tasa interés %" type="number" inputMode="decimal" placeholder="0.0" suffix="%" value={rate} onChange={e => setRate(e.target.value)} />
        <Input label="Vencimiento" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>
      <Button fullWidth size="lg" onClick={submit} disabled={!name || !total || !creditor} className="!bg-down hover:!bg-red-700">
        Registrar deuda
      </Button>
    </div>
  );
}

function PaymentForm({ debt, onClose }: { debt: Debt; onClose: () => void }) {
  const { addDebtPayment } = useStore();
  const [amount, setAmount] = useState('');
  const [note, setNote]     = useState('');
  const c = colorMap[debt.color];
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${c.hex}15` }}>
          {debt.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{debt.name}</p>
          <p className="text-xs text-down font-medium">Pendiente: {formatCompact(debt.remainingAmount)}</p>
        </div>
      </div>
      <Input label="Monto del pago" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={amount} onChange={e => setAmount(e.target.value)} />
      <Input label="Nota (opcional)" placeholder="Ej. Cuota mensual" value={note} onChange={e => setNote(e.target.value)} />
      <Button fullWidth size="lg" onClick={() => { if (amount) { addDebtPayment(debt.id, { amount: parseFloat(amount), date: new Date().toISOString(), note: note || undefined }); onClose(); } }} disabled={!amount} className="!bg-brand">
        Registrar pago
      </Button>
    </div>
  );
}

function DebtRow({ debt }: { debt: Debt }) {
  const { deleteDebt } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [showPay, setShowPay]   = useState(false);
  const [showDel, setShowDel]   = useState(false);

  const c = colorMap[debt.color];
  const paid    = debt.totalAmount - debt.remainingAmount;
  const paidPct = percentage(paid, debt.totalAmount);
  const done    = debt.remainingAmount <= 0;

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: `${c.hex}15` }}>
              {debt.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-ink text-sm">{debt.name}</p>
                {done && (
                  <span className="badge bg-up-light text-up flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> Saldada
                  </span>
                )}
                {debt.interestRate && !done && (
                  <span className="badge bg-warn-light text-warn">{debt.interestRate}% interés</span>
                )}
              </div>
              <p className="text-xs text-muted">{debt.creditor}</p>
              {debt.dueDate && <p className="text-xs text-subtle mt-0.5">Vence: {formatDate(debt.dueDate)}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <p className={`text-base font-semibold tabular-nums ${done ? 'text-up' : 'text-down'}`}>
                  {done ? '¡Saldada!' : formatCompact(debt.remainingAmount)}
                </p>
                <p className="text-xs text-muted">{paidPct}% pagado</p>
              </div>
              {!done && (
                <button onClick={() => setShowPay(true)} className="btn-primary text-xs px-3 py-1.5 rounded-lg">
                  Pagar
                </button>
              )}
              <button onClick={() => setShowDel(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-subtle hover:text-down hover:bg-down-light transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar value={paidPct} color={done ? '#16A34A' : c.hex} height={5} />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-muted tabular-nums">Pagado: {formatCompact(paid)}</span>
              <span className="text-xs text-muted tabular-nums">Total: {formatCompact(debt.totalAmount)}</span>
            </div>
          </div>

          {debt.payments.length > 0 && (
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-3 text-xs text-muted hover:text-ink transition-colors">
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {debt.payments.length} pago{debt.payments.length !== 1 ? 's' : ''} registrado{debt.payments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        <AnimatePresence>
          {expanded && debt.payments.length > 0 && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
              <div className="px-5 py-3 bg-surface">
                <div className="hidden md:grid grid-cols-[1fr_100px_1fr] gap-4 text-2xs font-semibold text-subtle uppercase tracking-wider mb-2">
                  <span>Fecha</span><span>Importe</span><span>Nota</span>
                </div>
                {[...debt.payments].reverse().map(p => (
                  <div key={p.id} className="flex md:grid md:grid-cols-[1fr_100px_1fr] gap-2 md:gap-4 items-center py-1.5 border-b border-border last:border-0">
                    <p className="text-xs text-muted">{formatDate(p.date)}</p>
                    <p className="text-xs font-semibold text-up tabular-nums">-{formatCompact(p.amount)}</p>
                    <p className="text-xs text-subtle">{p.note ?? '—'}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Modal isOpen={showPay} onClose={() => setShowPay(false)} title="Registrar pago">
        <PaymentForm debt={debt} onClose={() => setShowPay(false)} />
      </Modal>
      <Modal isOpen={showDel} onClose={() => setShowDel(false)} title="Eliminar deuda">
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">¿Eliminar esta deuda?</p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setShowDel(false)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={() => { deleteDebt(debt.id); setShowDel(false); }}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function Debts() {
  const { debts } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  const active = debts.filter(d => d.remainingAmount > 0);
  const paid   = debts.filter(d => d.remainingAmount <= 0);
  const totalDebt     = active.reduce((s, d) => s + d.remainingAmount, 0);
  const totalOriginal = active.reduce((s, d) => s + d.totalAmount, 0);

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 pt-6 pb-5 gap-4">
        <h1 className="text-xl font-semibold text-ink">Mis Deudas</h1>
        <Button onClick={() => setShowAdd(true)} className="!bg-down hover:!bg-red-700"><Plus size={15} /> Nueva deuda</Button>
      </div>

      <div className="px-6 md:px-8 pb-6 space-y-5">
        {/* Summary */}
        {active.length > 0 && (
          <Card padding>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-ink">Progreso de pago</span>
                  <span className="text-sm font-semibold text-down">
                    {percentage(totalOriginal - totalDebt, totalOriginal)}%
                  </span>
                </div>
                <ProgressBar value={percentage(totalOriginal - totalDebt, totalOriginal)} color="#16A34A" bg="#FEE2E2" height={6} />
              </div>
              <div className="flex gap-6 md:gap-8 flex-shrink-0">
                <div>
                  <p className="text-2xs text-muted uppercase tracking-wider mb-0.5">Pendiente</p>
                  <p className="text-lg font-semibold text-down tabular-nums">{formatCompact(totalDebt)}</p>
                </div>
                <div>
                  <p className="text-2xs text-muted uppercase tracking-wider mb-0.5">Total original</p>
                  <p className="text-lg font-semibold text-ink tabular-nums">{formatCompact(totalOriginal)}</p>
                </div>
                <div>
                  <p className="text-2xs text-muted uppercase tracking-wider mb-0.5">Deudas activas</p>
                  <p className="text-lg font-semibold text-ink tabular-nums">{active.length}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {active.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Pendientes · {active.length}</p>
            <div className="space-y-3">
              {active.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <DebtRow debt={d} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {paid.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Saldadas · {paid.length}</p>
            <div className="space-y-3">
              {paid.map(d => <DebtRow key={d.id} debt={d} />)}
            </div>
          </div>
        )}

        {debts.length === 0 && (
          <Card padding className="flex flex-col items-center text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-up-light flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-up" />
            </div>
            <h3 className="font-semibold text-ink mb-2">Sin deudas registradas</h3>
            <p className="text-sm text-muted max-w-xs">¡Genial! Si tienes deudas pendientes puedes registrarlas aquí para controlarlas.</p>
          </Card>
        )}
      </div>

      <button className="md:hidden fixed bottom-20 right-5 w-12 h-12 bg-down rounded-xl flex items-center justify-center shadow-dropdown z-20" onClick={() => setShowAdd(true)}>
        <Plus size={22} className="text-white" />
      </button>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nueva deuda">
        <DebtForm onClose={() => setShowAdd(false)} />
      </Modal>
    </PageWrapper>
  );
}

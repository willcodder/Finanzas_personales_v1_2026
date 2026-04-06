import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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

const ICONS = ['💳','🏦','🏠','🚗','🎓','💊','📱','💻','🛒','💰','🤝','📋'];

function DebtForm({ onClose }: { onClose: () => void }) {
  const { addDebt } = useStore();
  const [name, setName]               = useState('');
  const [creditor, setCreditor]       = useState('');
  const [totalAmount, setTotal]       = useState('');
  const [remainingAmount, setRemain]  = useState('');
  const [interestRate, setInterest]   = useState('');
  const [dueDate, setDueDate]         = useState('');
  const [icon, setIcon]               = useState('💳');
  const [color, setColor]             = useState<CategoryColor>('red');

  const submit = () => {
    if (!name || !totalAmount || !creditor) return;
    const total = parseFloat(totalAmount);
    addDebt({
      name, creditor, totalAmount: total,
      remainingAmount: remainingAmount ? parseFloat(remainingAmount) : total,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      dueDate: dueDate ? new Date(dueDate + 'T12:00:00').toISOString() : undefined,
      icon, color,
    });
    onClose();
  };

  return (
    <div className="p-5 space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold text-ink">Icono</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                icon === ic ? 'bg-down-light ring-2 ring-down' : 'bg-surface hover:bg-card-elevated'
              }`}
            >{ic}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-ink">Color</label>
        <div className="flex gap-2 flex-wrap">
          {colorOptions.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-card' : 'hover:scale-105'}`}
              style={{ backgroundColor: colorMap[c].hex }}
            />
          ))}
        </div>
      </div>

      <Input label="Nombre de la deuda" placeholder="Ej. Tarjeta de crédito" value={name} onChange={e => setName(e.target.value)} />
      <Input label="Acreedor" placeholder="Ej. Banco Nacional" value={creditor} onChange={e => setCreditor(e.target.value)} />
      <Input label="Monto total" type="number" inputMode="decimal" placeholder="0.00" prefix="€" value={totalAmount} onChange={e => setTotal(e.target.value)} />
      <Input label="Saldo pendiente (si difiere)" type="number" inputMode="decimal" placeholder="0.00" prefix="€" value={remainingAmount} onChange={e => setRemain(e.target.value)} />
      <Input label="Tasa de interés % (opcional)" type="number" inputMode="decimal" placeholder="0.00" value={interestRate} onChange={e => setInterest(e.target.value)} />
      <Input label="Fecha de vencimiento (opcional)" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />

      <Button fullWidth size="lg" onClick={submit} disabled={!name || !totalAmount || !creditor} className="!bg-down">
        Registrar deuda
      </Button>
    </div>
  );
}

function PaymentForm({ debt, onClose }: { debt: Debt; onClose: () => void }) {
  const { addDebtPayment } = useStore();
  const [amount, setAmount] = useState('');
  const [note, setNote]     = useState('');

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-down-light flex-shrink-0">{debt.icon}</div>
        <div>
          <p className="text-sm font-bold text-ink">{debt.name}</p>
          <p className="text-xs text-down font-semibold">Pendiente: {formatCompact(debt.remainingAmount)}</p>
        </div>
      </div>
      <Input label="Monto del pago" type="number" inputMode="decimal" placeholder="0.00" prefix="€" value={amount} onChange={e => setAmount(e.target.value)} />
      <Input label="Nota (opcional)" placeholder="Ej. Cuota mensual" value={note} onChange={e => setNote(e.target.value)} />
      <Button fullWidth size="lg" onClick={() => {
        if (!amount) return;
        addDebtPayment(debt.id, { amount: parseFloat(amount), date: new Date().toISOString(), note: note || undefined });
        onClose();
      }} disabled={!amount}>
        Registrar pago
      </Button>
    </div>
  );
}

function DebtCard({ debt }: { debt: Debt }) {
  const { deleteDebt } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [showPay, setShowPay]   = useState(false);
  const [showDel, setShowDel]   = useState(false);

  const colors = colorMap[debt.color];
  const paid   = debt.totalAmount - debt.remainingAmount;
  const paidPct = percentage(paid, debt.totalAmount);
  const done   = debt.remainingAmount <= 0;

  return (
    <>
      <Card>
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: done ? 'rgba(48,209,88,0.12)' : `${colors.hex}15` }}
            >
              {debt.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-black text-ink text-sm">{debt.name}</p>
                {done && (
                  <span className="text-2xs bg-up-light text-up px-2 py-0.5 rounded-full font-bold">Pagada ✓</span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">{debt.creditor}</p>
              {debt.interestRate && <p className="text-xs text-warn mt-0.5">⚡ {debt.interestRate}% interés</p>}
              {debt.dueDate && <p className="text-xs text-muted mt-0.5">📅 {formatDate(debt.dueDate)}</p>}
            </div>
            <div className="flex items-center gap-1.5">
              {!done && (
                <button
                  onClick={() => setShowPay(true)}
                  className="px-3 py-1.5 bg-brand-light text-brand rounded-xl text-xs font-bold transition-colors"
                >
                  Pagar
                </button>
              )}
              <button onClick={() => setShowDel(true)} className="w-8 h-8 flex items-center justify-center rounded-xl text-subtle hover:text-down hover:bg-down-light transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-2xs text-muted font-medium mb-1.5">
              <span>Pagado: {formatCompact(paid)}</span>
              <span>Total: {formatCompact(debt.totalAmount)}</span>
            </div>
            <ProgressBar value={paidPct} color={done ? '#30D158' : colors.hex} height={5} />
            <div className="flex justify-between mt-2">
              <span className={`text-sm font-black num-display ${done ? 'text-up' : 'text-down'}`}>
                {done ? '¡Completada! 🎉' : `Pendiente: ${formatCompact(debt.remainingAmount)}`}
              </span>
              <span className="text-xs text-muted font-semibold">{paidPct}%</span>
            </div>
          </div>

          {debt.payments.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-muted font-semibold hover:text-ink transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {debt.payments.length} pago{debt.payments.length !== 1 ? 's' : ''} registrado{debt.payments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        <AnimatePresence>
          {expanded && debt.payments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border"
            >
              <div className="px-5 py-3 space-y-2">
                {[...debt.payments].reverse().map(p => (
                  <div key={p.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="text-xs font-semibold text-ink">Pago del {formatDate(p.date)}</p>
                      {p.note && <p className="text-xs text-muted">{p.note}</p>}
                    </div>
                    <span className="text-sm font-black text-up num-display">-{formatCompact(p.amount)}</span>
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

  const activeDebts = debts.filter(d => d.remainingAmount > 0);
  const paidDebts   = debts.filter(d => d.remainingAmount <= 0);
  const totalDebt   = activeDebts.reduce((s, d) => s + d.remainingAmount, 0);
  const totalOrig   = activeDebts.reduce((s, d) => s + d.totalAmount, 0);

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 pt-6 pb-5 gap-4">
        <h1 className="text-2xl font-black text-ink">Mis Deudas</h1>
        <Button onClick={() => setShowAdd(true)} className="!bg-down"><Plus size={15} /> Nueva deuda</Button>
      </div>

      <div className="px-4 md:px-8 pb-8 space-y-5">
        {/* Summary hero */}
        {activeDebts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div
              className="rounded-3xl p-6"
              style={{ background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%)' }}
            >
              <p className="text-white/70 text-2xs font-bold uppercase tracking-widest mb-1">Total pendiente</p>
              <p className="text-4xl font-black text-white num-display tracking-tight mb-5">{formatCompact(totalDebt)}</p>
              <ProgressBar value={percentage(totalOrig - totalDebt, totalOrig)} color="rgba(255,255,255,0.9)" height={6} className="mb-3" />
              <div className="flex justify-between">
                <span className="text-white/70 text-xs font-semibold">{activeDebts.length} deuda{activeDebts.length !== 1 ? 's' : ''} activa{activeDebts.length !== 1 ? 's' : ''}</span>
                <span className="text-white/70 text-xs font-semibold">Total original: {formatCompact(totalOrig)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active */}
        {activeDebts.length > 0 && (
          <div>
            <p className="section-title mb-3 px-1">Pendientes</p>
            <div className="space-y-3">
              {activeDebts.map((debt, i) => (
                <motion.div key={debt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <DebtCard debt={debt} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Paid */}
        {paidDebts.length > 0 && (
          <div>
            <p className="section-title mb-3 px-1">Saldadas 🎉</p>
            <div className="space-y-3">
              {paidDebts.map(debt => <DebtCard key={debt.id} debt={debt} />)}
            </div>
          </div>
        )}

        {/* Empty */}
        {debts.length === 0 && (
          <Card padding className="flex flex-col items-center text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-up-light flex items-center justify-center mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="font-black text-ink text-lg mb-2">Sin deudas registradas</h3>
            <p className="text-sm text-muted max-w-xs mb-5">Si tienes deudas pendientes, regístralas para llevar el control.</p>
            <Button onClick={() => setShowAdd(true)} className="!bg-down"><Plus size={15} /> Registrar deuda</Button>
          </Card>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nueva deuda">
        <DebtForm onClose={() => setShowAdd(false)} />
      </Modal>
    </PageWrapper>
  );
}

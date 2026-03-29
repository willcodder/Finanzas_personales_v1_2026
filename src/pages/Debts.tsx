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

const ICONS = ['💳', '🏦', '🏠', '🚗', '🎓', '💊', '📱', '💻', '🛒', '💰', '🤝', '📋'];

function DebtForm({ onClose }: { onClose: () => void }) {
  const { addDebt } = useStore();
  const [name, setName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [icon, setIcon] = useState('💳');
  const [color, setColor] = useState<CategoryColor>('red');

  const handleSubmit = () => {
    if (!name || !totalAmount || !creditor) return;
    const total = parseFloat(totalAmount);
    const remaining = remainingAmount ? parseFloat(remainingAmount) : total;
    addDebt({
      name,
      creditor,
      totalAmount: total,
      remainingAmount: remaining,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      dueDate: dueDate ? new Date(dueDate + 'T12:00:00').toISOString() : undefined,
      icon,
      color,
    });
    onClose();
  };

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Icon picker */}
      <div>
        <p className="text-sm font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/80 mb-2 px-1">Icono</p>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                icon === ic
                  ? 'bg-[#FF3B30]/15 ring-1 ring-[#FF3B30]'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-sm font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/80 mb-2 px-1">Color</p>
        <div className="flex gap-2 flex-wrap">
          {colorOptions.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${
                color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1C1C1E]' : ''
              }`}
              style={{ backgroundColor: colorMap[c].hex }}
            />
          ))}
        </div>
      </div>

      <Input label="Nombre de la deuda" placeholder="Ej. Tarjeta de crédito" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Acreedor / Institución" placeholder="Ej. Banco Nacional" value={creditor} onChange={(e) => setCreditor(e.target.value)} />
      <Input label="Monto total" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
      <Input label="Saldo pendiente (si difiere del total)" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={remainingAmount} onChange={(e) => setRemainingAmount(e.target.value)} />
      <Input label="Tasa de interés % (opcional)" type="number" inputMode="decimal" placeholder="0.00" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
      <Input label="Fecha de vencimiento (opcional)" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

      <div className="pb-2">
        <Button
          fullWidth size="lg"
          onClick={handleSubmit}
          disabled={!name || !totalAmount || !creditor}
          className="!bg-[#FF3B30]"
        >
          Registrar deuda
        </Button>
      </div>
    </div>
  );
}

function PaymentForm({ debt, onClose }: { debt: Debt; onClose: () => void }) {
  const { addDebtPayment } = useStore();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!amount) return;
    addDebtPayment(debt.id, {
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      note: note || undefined,
    });
    onClose();
  };

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl p-4 flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[debt.color].light}`}>
          <span className="text-2xl">{debt.icon}</span>
        </div>
        <div>
          <p className="font-semibold text-[#1C1C1E] dark:text-white">{debt.name}</p>
          <p className="text-sm text-[#FF3B30]">Pendiente: {formatCompact(debt.remainingAmount)}</p>
        </div>
      </div>
      <Input
        label="Monto del pago"
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        prefix="$"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Input
        label="Nota (opcional)"
        placeholder="Ej. Cuota mensual"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="pb-2">
        <Button fullWidth size="lg" onClick={handleSubmit} disabled={!amount} className="!bg-[#007AFF]">
          Registrar pago
        </Button>
      </div>
    </div>
  );
}

function DebtCard({ debt }: { debt: Debt }) {
  const { deleteDebt } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const colors = colorMap[debt.color];
  const paid = debt.totalAmount - debt.remainingAmount;
  const paidPct = percentage(paid, debt.totalAmount);
  const isCompleted = debt.remainingAmount <= 0;

  return (
    <>
      <Card className="overflow-visible">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors.light}`}>
              <span className="text-2xl">{debt.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#1C1C1E] dark:text-white">{debt.name}</p>
                {isCompleted && (
                  <span className="text-xs bg-[#34C759]/15 text-[#34C759] px-2 py-0.5 rounded-full font-medium">
                    Pagada ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8E8E93] mt-0.5">{debt.creditor}</p>
              {debt.interestRate && (
                <p className="text-xs text-[#FF9500] mt-0.5">⚡ {debt.interestRate}% interés</p>
              )}
              {debt.dueDate && (
                <p className="text-xs text-[#8E8E93] mt-0.5">📅 Vence: {formatDate(debt.dueDate)}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!isCompleted && (
                <button
                  onClick={() => setShowPay(true)}
                  className="px-3 py-1.5 bg-[#007AFF]/10 text-[#007AFF] rounded-xl text-xs font-semibold"
                >
                  Pagar
                </button>
              )}
              <button
                onClick={() => setDeleteId(debt.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#C7C7CC] hover:text-[#FF3B30] transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-[#8E8E93] mb-1.5">
              <span>Pagado: {formatCompact(paid)}</span>
              <span>Total: {formatCompact(debt.totalAmount)}</span>
            </div>
            <ProgressBar value={paidPct} color={isCompleted ? '#34C759' : colors.hex} />
            <div className="flex justify-between mt-1.5">
              <span className={`text-sm font-semibold ${isCompleted ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                {isCompleted ? '¡Completada!' : `Pendiente: ${formatCompact(debt.remainingAmount)}`}
              </span>
              <span className="text-xs text-[#8E8E93]">{paidPct}% pagado</span>
            </div>
          </div>

          {/* Payment history toggle */}
          {debt.payments.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-[#8E8E93] font-medium"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {debt.payments.length} pago{debt.payments.length !== 1 ? 's' : ''} registrado{debt.payments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Payment history */}
        <AnimatePresence>
          {expanded && debt.payments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#F2F2F7] dark:border-[#2C2C2E]"
            >
              <div className="px-4 py-2 space-y-2">
                {[...debt.payments].reverse().map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="text-xs font-medium text-[#1C1C1E] dark:text-white">
                        Pago del {formatDate(p.date)}
                      </p>
                      {p.note && <p className="text-xs text-[#8E8E93]">{p.note}</p>}
                    </div>
                    <span className="text-sm font-semibold text-[#34C759]">-{formatCompact(p.amount)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Modal isOpen={showPay} onClose={() => setShowPay(false)} title="Registrar Pago">
        <PaymentForm debt={debt} onClose={() => setShowPay(false)} />
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar deuda">
        <div className="px-5 py-4 space-y-4">
          <p className="text-[#3A3A3C] dark:text-[#EBEBF5]/80">¿Eliminar esta deuda?</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={() => { deleteDebt(debt.id); setDeleteId(null); }}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function Debts() {
  const { debts } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  const activeDebts = debts.filter((d) => d.remainingAmount > 0);
  const paidDebts = debts.filter((d) => d.remainingAmount <= 0);

  const totalDebt = activeDebts.reduce((s, d) => s + d.remainingAmount, 0);
  const totalOriginal = activeDebts.reduce((s, d) => s + d.totalAmount, 0);

  return (
    <PageWrapper>
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-[#1C1C1E] dark:text-white tracking-tight mb-5">
          Mis Deudas
        </h1>

        {/* Summary */}
        {activeDebts.length > 0 && (
          <motion.div
            className="rounded-3xl p-5 mb-5"
            style={{ background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/70 text-sm mb-1">Deuda total pendiente</p>
            <p className="text-3xl font-bold text-white mb-4">{formatCompact(totalDebt)}</p>
            <ProgressBar
              value={percentage(totalOriginal - totalDebt, totalOriginal)}
              color="rgba(255,255,255,0.9)"
              height={6}
            />
            <div className="flex justify-between mt-2">
              <span className="text-white/70 text-xs">{activeDebts.length} deuda{activeDebts.length !== 1 ? 's' : ''} activa{activeDebts.length !== 1 ? 's' : ''}</span>
              <span className="text-white/70 text-xs">Total: {formatCompact(totalOriginal)}</span>
            </div>
          </motion.div>
        )}

        {/* Active debts */}
        {activeDebts.length > 0 && (
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#1C1C1E] dark:text-white mb-3">Pendientes</h2>
            <div className="space-y-3">
              {activeDebts.map((debt, i) => (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <DebtCard debt={debt} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Paid debts */}
        {paidDebts.length > 0 && (
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#1C1C1E] dark:text-white mb-3">Saldadas 🎉</h2>
            <div className="space-y-3">
              {paidDebts.map((debt) => (
                <DebtCard key={debt.id} debt={debt} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {debts.length === 0 && (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#34C759]/10 flex items-center justify-center mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="font-semibold text-[#1C1C1E] dark:text-white text-lg mb-2">Sin deudas registradas</h3>
            <p className="text-sm text-[#8E8E93] max-w-xs mb-6">
              Si tienes deudas pendientes, regístralas aquí para llevar un control.
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#FF3B30] rounded-full flex items-center justify-center shadow-apple-lg z-20"
        onClick={() => setShowAdd(true)}
        whileTap={{ scale: 0.92 }}
      >
        <Plus size={24} className="text-white" />
      </motion.button>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nueva Deuda">
        <DebtForm onClose={() => setShowAdd(false)} />
      </Modal>
    </PageWrapper>
  );
}

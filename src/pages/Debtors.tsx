import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronUp, UserX } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Debtor, CategoryColor } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCompact, formatDate, percentage } from '../utils/format';
import { colorMap, colorOptions } from '../utils/colors';

const ICONS = ['👤', '👦', '👧', '🧑', '👨', '👩', '🧔', '👴', '👵', '🤝', '💼', '🏠'];

function DebtorForm({ onClose }: { onClose: () => void }) {
  const { addDebtor } = useStore();
  const [name, setName]         = useState('');
  const [amount, setAmount]     = useState('');
  const [description, setDesc]  = useState('');
  const [date, setDate]         = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate]   = useState('');
  const [icon, setIcon]         = useState('👤');
  const [color, setColor]       = useState<CategoryColor>('blue');

  const submit = () => {
    if (!name || !amount) return;
    const amt = parseFloat(amount) || 0;
    addDebtor({
      name,
      amount: amt,
      remainingAmount: amt,
      description,
      date,
      dueDate: dueDate || undefined,
      icon,
      color,
    });
    onClose();
  };

  return (
    <div className="p-5 space-y-4">
      {/* Icon selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink">Icono</label>
        <div className="flex gap-2 flex-wrap">
          {ICONS.map(ic => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                icon === ic ? 'bg-brand-light ring-2 ring-brand' : 'bg-surface hover:bg-border'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
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

      <Input label="Nombre" placeholder="Ej. Juan García" value={name} onChange={e => setName(e.target.value)} />
      <Input label="Concepto / Para qué" placeholder="Ej. Préstamo para la mudanza" value={description} onChange={e => setDesc(e.target.value)} />
      <Input label="Cantidad prestada" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={amount} onChange={e => setAmount(e.target.value)} />
      <Input label="Fecha del préstamo" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input label="Fecha límite de devolución (opcional)" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />

      <Button fullWidth size="lg" onClick={submit} disabled={!name || !amount}>
        <Plus size={15} /> Añadir moroso
      </Button>
    </div>
  );
}

function PaymentForm({ debtor, onClose }: { debtor: Debtor; onClose: () => void }) {
  const { addDebtorPayment } = useStore();
  const [amount, setAmount] = useState('');
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote]     = useState('');

  const submit = () => {
    if (!amount) return;
    addDebtorPayment(debtor.id, {
      amount: parseFloat(amount) || 0,
      date,
      note: note || undefined,
    });
    onClose();
  };

  return (
    <div className="p-5 space-y-4">
      <p className="text-sm text-muted">Registrar un pago de <span className="font-semibold text-ink">{debtor.name}</span>. Pendiente: <span className="font-semibold text-up">{formatCompact(debtor.remainingAmount)}</span></p>
      <Input label="Cantidad recibida" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={amount} onChange={e => setAmount(e.target.value)} />
      <Input label="Fecha" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input label="Nota (opcional)" placeholder="Ej. Transferencia bancaria" value={note} onChange={e => setNote(e.target.value)} />
      <Button fullWidth onClick={submit} disabled={!amount}>
        Registrar cobro
      </Button>
    </div>
  );
}

function DebtorRow({ debtor, onDelete, onPayment }: { debtor: Debtor; onDelete: () => void; onPayment: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const c = colorMap[debtor.color];
  const recovered = debtor.amount - debtor.remainingAmount;
  const pct = percentage(recovered, debtor.amount);
  const isFullyPaid = debtor.remainingAmount === 0;

  return (
    <Card className="overflow-hidden">
      {/* Main row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer group hover:bg-surface/50 transition-colors"
        onClick={() => setExpanded(x => !x)}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${c.hex}15` }}
        >
          {debtor.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-ink text-sm truncate">{debtor.name}</p>
            {isFullyPaid && (
              <span className="text-2xs font-medium px-1.5 py-0.5 rounded-full bg-up-light text-up">Saldado</span>
            )}
          </div>
          <p className="text-xs text-muted truncate">{debtor.description}</p>
          <div className="mt-2">
            <ProgressBar value={pct} color={isFullyPaid ? '#16A34A' : c.hex} height={4} />
            <div className="flex justify-between mt-1">
              <span className="text-2xs text-muted">Cobrado {formatCompact(recovered)}</span>
              <span className="text-2xs text-muted">Pendiente {formatCompact(debtor.remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Amount + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-up tabular-nums">{formatCompact(debtor.remainingAmount)}</p>
            <p className="text-2xs text-muted">de {formatCompact(debtor.amount)}</p>
          </div>
          {expanded ? <ChevronUp size={14} className="text-subtle" /> : <ChevronDown size={14} className="text-subtle" />}
        </div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 space-y-3">
              {/* Dates */}
              <div className="flex gap-4 text-xs text-muted">
                <span>Prestado: {formatDate(debtor.date)}</span>
                {debtor.dueDate && <span>Límite: {formatDate(debtor.dueDate)}</span>}
              </div>

              {/* Payment history */}
              {debtor.payments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-ink mb-2">Historial de cobros</p>
                  <div className="space-y-1.5">
                    {debtor.payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between text-xs bg-surface rounded-lg px-3 py-2">
                        <div>
                          <span className="font-medium text-up">+{formatCompact(p.amount)}</span>
                          {p.note && <span className="text-muted ml-2">{p.note}</span>}
                        </div>
                        <span className="text-muted">{formatDate(p.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debtor.payments.length === 0 && (
                <p className="text-xs text-muted italic">Sin cobros registrados todavía.</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {!isFullyPaid && (
                  <Button size="sm" onClick={e => { e.stopPropagation(); onPayment(); }}>
                    Registrar cobro
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); onDelete(); }}>
                  <Trash2 size={13} /> Eliminar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function Debtors() {
  const { debtors, deleteDebtor } = useStore();
  const [showAdd, setShowAdd]           = useState(false);
  const [paymentDebtor, setPaymentDebtor] = useState<Debtor | null>(null);
  const [deleteId, setDeleteId]         = useState<string | null>(null);

  const totalLent      = debtors.reduce((s, d) => s + d.amount, 0);
  const totalRecovered = debtors.reduce((s, d) => s + (d.amount - d.remainingAmount), 0);
  const totalPending   = debtors.reduce((s, d) => s + d.remainingAmount, 0);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 pt-6 pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
            <UserX size={18} className="text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Morosos</h1>
            <p className="text-xs text-muted">Personas que te deben dinero</p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Nuevo moroso</Button>
      </div>

      <div className="px-6 md:px-8 pb-6 space-y-5">
        {/* Summary */}
        {debtors.length > 0 && (
          <Card padding>
            <p className="text-xs text-muted uppercase tracking-wider mb-3">Resumen</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xs text-muted mb-0.5">Total prestado</p>
                <p className="text-lg font-bold text-ink tabular-nums">{formatCompact(totalLent)}</p>
              </div>
              <div>
                <p className="text-2xs text-muted mb-0.5">Recuperado</p>
                <p className="text-lg font-bold text-up tabular-nums">{formatCompact(totalRecovered)}</p>
              </div>
              <div>
                <p className="text-2xs text-muted mb-0.5">Pendiente</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: '#16A34A' }}>{formatCompact(totalPending)}</p>
              </div>
            </div>
            {totalLent > 0 && (
              <div className="mt-3">
                <ProgressBar value={percentage(totalRecovered, totalLent)} color="#16A34A" height={6} />
                <p className="text-2xs text-muted mt-1">{percentage(totalRecovered, totalLent)}% recuperado</p>
              </div>
            )}
          </Card>
        )}

        {/* Debtors list */}
        {debtors.length === 0 ? (
          <Card padding className="flex flex-col items-center text-center py-16">
            <span className="text-4xl mb-3">🤝</span>
            <p className="font-medium text-ink mb-1">Sin morosos registrados</p>
            <p className="text-sm text-muted mb-5">Añade las personas que te deban dinero para hacer seguimiento.</p>
            <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Añadir moroso</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {debtors.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <DebtorRow
                  debtor={d}
                  onDelete={() => setDeleteId(d.id)}
                  onPayment={() => setPaymentDebtor(d)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        className="md:hidden fixed bottom-20 right-5 w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-dropdown z-20"
        onClick={() => setShowAdd(true)}
      >
        <Plus size={22} className="text-white" />
      </button>

      {/* Modals */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nuevo moroso">
        <DebtorForm onClose={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!paymentDebtor} onClose={() => setPaymentDebtor(null)} title="Registrar cobro">
        {paymentDebtor && (
          <PaymentForm debtor={paymentDebtor} onClose={() => setPaymentDebtor(null)} />
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar moroso">
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">¿Eliminar este moroso? Se perderá todo el historial de cobros.</p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={() => { if (deleteId) deleteDebtor(deleteId); setDeleteId(null); }}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

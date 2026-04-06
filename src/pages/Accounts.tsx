import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Account, AccountType, CategoryColor } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input, TextArea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatCompact } from '../utils/format';
import { colorMap, colorOptions } from '../utils/colors';

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string; desc: string }[] = [
  { value: 'checking',   label: 'Cuenta corriente',  icon: '🏦', desc: 'Gastos del día a día' },
  { value: 'savings',    label: 'Cuenta de ahorro',  icon: '💰', desc: 'Acumular dinero' },
  { value: 'credit',     label: 'Tarjeta de crédito', icon: '💳', desc: 'Saldo en crédito' },
  { value: 'cash',       label: 'Efectivo',           icon: '💵', desc: 'Dinero en metálico' },
  { value: 'investment', label: 'Inversión',          icon: '📈', desc: 'Acciones, fondos, cripto' },
];

function AccountForm({ onClose }: { onClose: () => void }) {
  const { addAccount } = useStore();
  const [name, setName]               = useState('');
  const [type, setType]               = useState<AccountType>('checking');
  const [initialBalance, setBalance]  = useState('');
  const [color, setColor]             = useState<CategoryColor>('blue');
  const [description, setDescription] = useState('');

  const selectedType = ACCOUNT_TYPES.find(t => t.value === type)!;

  const submit = () => {
    if (!name) return;
    addAccount({
      name, type,
      initialBalance: parseFloat(initialBalance) || 0,
      color, icon: selectedType.icon,
      description: description || undefined,
    });
    onClose();
  };

  return (
    <div className="p-5 space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold text-ink">Tipo de cuenta</label>
        <div className="space-y-2">
          {ACCOUNT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
                type === t.value
                  ? 'border-brand/40 bg-brand-light'
                  : 'border-border bg-surface hover:bg-card-elevated'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <div>
                <p className={`text-sm font-bold ${type === t.value ? 'text-brand' : 'text-ink'}`}>{t.label}</p>
                <p className="text-xs text-muted">{t.desc}</p>
              </div>
            </button>
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

      <Input label="Nombre" placeholder="Ej. BBVA Principal" value={name} onChange={e => setName(e.target.value)} />
      <TextArea
        label="Para qué uso esta cuenta (opcional)"
        placeholder="Ej. Recibo la nómina y pago facturas..."
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <Input label="Saldo inicial" type="number" inputMode="decimal" placeholder="0.00" prefix="€" value={initialBalance} onChange={e => setBalance(e.target.value)} />

      <Button fullWidth size="lg" onClick={submit} disabled={!name}>
        <Plus size={15} /> Añadir cuenta
      </Button>
    </div>
  );
}

export function Accounts() {
  const { accounts, transactions, savingGoals, debts, deleteAccount } = useStore();
  const [showAdd, setShowAdd]   = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function getBalance(acc: Account) {
    const txs = transactions.filter(t => t.accountId === acc.id);
    const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return acc.initialBalance + income - expense;
  }

  function getMonthlyFlow(acc: Account) {
    const now = new Date();
    const ym  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const txs = transactions.filter(t => t.accountId === acc.id && t.date.slice(0, 7) === ym);
    const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }

  const accountBalances   = accounts.reduce((s, a) => s + getBalance(a), 0);
  const positiveBalances  = accounts.reduce((s, a) => { const b = getBalance(a); return s + (b > 0 ? b : 0); }, 0);
  const totalSavings      = savingGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalDebts        = debts.reduce((s, d) => s + d.remainingAmount, 0);
  const totalAssets       = positiveBalances + totalSavings;
  const netWorth          = accountBalances + totalSavings - totalDebts;
  const assetPct          = totalAssets + totalDebts > 0 ? (totalAssets / (totalAssets + totalDebts)) * 100 : 100;

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 pt-6 pb-5 gap-4">
        <h1 className="text-2xl font-black text-ink">Mis Cuentas</h1>
        <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Nueva cuenta</Button>
      </div>

      <div className="px-4 md:px-8 pb-8 space-y-5">
        {/* Patrimony hero */}
        {accounts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div
              className="rounded-3xl p-6 md:p-8"
              style={{ background: 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-white/50 text-2xs font-bold uppercase tracking-widest mb-1">Patrimonio Neto</p>
              <p className={`text-4xl font-black num-display tracking-tight mb-6 ${netWorth >= 0 ? 'text-white' : 'text-down'}`}>
                {formatCompact(netWorth)}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Cuentas', value: accountBalances, color: accountBalances >= 0 ? '#FFFFFF' : '#FF3B30' },
                  { label: 'Ahorros', value: totalSavings, color: '#30D158' },
                  { label: 'Deudas',  value: -totalDebts, color: '#FF3B30' },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-white/40 text-2xs font-bold uppercase tracking-wider mb-1">{m.label}</p>
                    <p className="text-sm font-black num-display" style={{ color: m.color }}>{formatCompact(m.value)}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-up transition-all duration-700"
                  style={{ width: `${assetPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-2xs text-up font-semibold">Activos {formatCompact(totalAssets)}</span>
                <span className="text-2xs text-down font-semibold">Pasivos {formatCompact(totalDebts)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Account cards */}
        {accounts.length === 0 ? (
          <Card padding className="flex flex-col items-center text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-brand-light flex items-center justify-center mb-4">
              <Landmark size={28} className="text-brand" />
            </div>
            <p className="font-bold text-ink mb-1">Sin cuentas</p>
            <p className="text-sm text-muted mb-5">Añade tus cuentas para seguir tu patrimonio.</p>
            <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Añadir cuenta</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc, i) => {
              const c       = colorMap[acc.color];
              const balance = getBalance(acc);
              const { income, expense } = getMonthlyFlow(acc);
              const accType = ACCOUNT_TYPES.find(t => t.value === acc.type);
              return (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', damping: 24 }}
                >
                  <Card padding className="group relative h-full">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDeleteId(acc.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-subtle hover:text-down hover:bg-down-light transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Color bar */}
                    <div className="h-1 rounded-full mb-4" style={{ backgroundColor: c.hex, width: '40%' }} />

                    <div className="flex items-start gap-3 mb-5">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${c.hex}18` }}
                      >
                        {acc.icon}
                      </div>
                      <div className="min-w-0 flex-1 pr-8">
                        <p className="font-black text-ink text-sm truncate">{acc.name}</p>
                        <span className="badge mt-1" style={{ backgroundColor: `${c.hex}15`, color: c.hex }}>
                          {accType?.label}
                        </span>
                        {acc.description && (
                          <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">{acc.description}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-2xs text-muted font-bold uppercase tracking-widest mb-1">Saldo actual</p>
                    <p className={`text-3xl font-black num-display tracking-tight mb-5 ${balance >= 0 ? 'text-ink' : 'text-down'}`}>
                      {formatCompact(balance)}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <TrendingUp size={11} className="text-up" />
                          <p className="text-2xs text-muted font-medium">Este mes</p>
                        </div>
                        <p className="text-sm font-black text-up num-display">+{formatCompact(income)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <TrendingDown size={11} className="text-down" />
                          <p className="text-2xs text-muted font-medium">Gastos</p>
                        </div>
                        <p className="text-sm font-black text-down num-display">-{formatCompact(expense)}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nueva cuenta">
        <AccountForm onClose={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar cuenta">
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">¿Eliminar esta cuenta? Los movimientos asociados no se borrarán.</p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={() => { if (deleteId) { deleteAccount(deleteId); setDeleteId(null); } }}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

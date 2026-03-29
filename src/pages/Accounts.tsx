import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
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
  { value: 'checking',   label: 'Cuenta corriente', icon: '🏦', desc: 'Para gastos del día a día' },
  { value: 'savings',    label: 'Cuenta de ahorro',  icon: '💰', desc: 'Para acumular dinero' },
  { value: 'credit',     label: 'Tarjeta de crédito', icon: '💳', desc: 'Saldo disponible en crédito' },
  { value: 'cash',       label: 'Efectivo',           icon: '💵', desc: 'Dinero en efectivo' },
  { value: 'investment', label: 'Inversión',          icon: '📈', desc: 'Acciones, fondos, cripto...' },
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
      {/* Type selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink">Tipo de cuenta</label>
        <div className="space-y-2">
          {ACCOUNT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                type === t.value
                  ? 'border-brand bg-brand-light'
                  : 'border-border bg-surface hover:bg-border/30'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <div>
                <p className={`text-sm font-medium ${type === t.value ? 'text-brand' : 'text-ink'}`}>{t.label}</p>
                <p className="text-xs text-muted">{t.desc}</p>
              </div>
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

      <Input label="Nombre de la cuenta" placeholder="Ej. BBVA Principal" value={name} onChange={e => setName(e.target.value)} />
      <TextArea
        label="Para qué uso esta cuenta (opcional)"
        placeholder="Ej. Gastos del día a día, recibo la nómina aquí..."
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <Input label="Saldo inicial" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={initialBalance} onChange={e => setBalance(e.target.value)} />

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

  // Patrimony calculations
  const accountBalances = accounts.reduce((s, a) => s + getBalance(a), 0);
  const positiveAccountBalances = accounts.reduce((s, a) => {
    const b = getBalance(a);
    return s + (b > 0 ? b : 0);
  }, 0);
  const totalSavings = savingGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalDebtsRemaining = debts.reduce((s, d) => s + d.remainingAmount, 0);
  const totalAssets = positiveAccountBalances + totalSavings;
  const netWorth = accountBalances + totalSavings - totalDebtsRemaining;
  const assetPct = totalAssets + totalDebtsRemaining > 0 ? (totalAssets / (totalAssets + totalDebtsRemaining)) * 100 : 100;

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 pt-6 pb-5 gap-4">
        <h1 className="text-xl font-semibold text-ink">Mis Cuentas</h1>
        <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Nueva cuenta</Button>
      </div>

      <div className="px-6 md:px-8 pb-6 space-y-5">
        {/* Patrimony card */}
        {accounts.length > 0 && (
          <Card padding>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Patrimonio Neto</p>
            <p className={`text-3xl font-bold tabular-nums tracking-tight mb-4 ${netWorth >= 0 ? 'text-ink' : 'text-down'}`}>
              {formatCompact(netWorth)}
            </p>

            {/* Breakdown row */}
            <div className="flex gap-4 mb-4 flex-wrap">
              <div>
                <p className="text-2xs text-muted uppercase tracking-wider mb-0.5">Cuentas</p>
                <p className={`text-sm font-semibold tabular-nums ${accountBalances >= 0 ? 'text-ink' : 'text-down'}`}>{formatCompact(accountBalances)}</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-2xs text-muted uppercase tracking-wider mb-0.5">Ahorros</p>
                <p className="text-sm font-semibold tabular-nums text-up">{formatCompact(totalSavings)}</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-2xs text-muted uppercase tracking-wider mb-0.5">Deudas</p>
                <p className="text-sm font-semibold tabular-nums text-down">-{formatCompact(totalDebtsRemaining)}</p>
              </div>
            </div>

            {/* Asset/liability bar */}
            <div className="w-full h-2 rounded-full bg-down-light overflow-hidden">
              <div
                className="h-full rounded-full bg-up transition-all duration-500"
                style={{ width: `${assetPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-2xs text-up">Activos {formatCompact(totalAssets)}</span>
              <span className="text-2xs text-down">Pasivos {formatCompact(totalDebtsRemaining)}</span>
            </div>
          </Card>
        )}

        {/* Account cards */}
        {accounts.length === 0 ? (
          <Card padding className="flex flex-col items-center text-center py-16">
            <span className="text-4xl mb-3">🏦</span>
            <p className="font-medium text-ink mb-1">Sin cuentas registradas</p>
            <p className="text-sm text-muted mb-5">Añade tus cuentas para hacer seguimiento de tu patrimonio.</p>
            <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Añadir cuenta</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((acc, i) => {
              const c       = colorMap[acc.color];
              const balance = getBalance(acc);
              const { income, expense } = getMonthlyFlow(acc);
              const accType = ACCOUNT_TYPES.find(t => t.value === acc.type);
              return (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card padding className="group relative">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDeleteId(acc.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-subtle hover:text-down hover:bg-down-light transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${c.hex}15` }}
                      >
                        {acc.icon}
                      </div>
                      <div className="min-w-0 flex-1 pr-8">
                        <p className="font-semibold text-ink text-sm truncate">{acc.name}</p>
                        <span className="badge mt-0.5" style={{ backgroundColor: `${c.hex}12`, color: c.hex }}>
                          {accType?.label}
                        </span>
                        {acc.description && (
                          <p className="text-xs text-muted mt-1 line-clamp-2">{acc.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Balance */}
                    <p className="text-xs text-muted mb-0.5">Saldo actual</p>
                    <p className={`text-2xl font-bold tabular-nums tracking-tight mb-4 ${balance >= 0 ? 'text-ink' : 'text-down'}`}>
                      {formatCompact(balance)}
                    </p>

                    {/* Monthly flow */}
                    <div className="flex gap-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 flex-1">
                        <TrendingUp size={13} className="text-up flex-shrink-0" />
                        <div>
                          <p className="text-2xs text-muted">Este mes</p>
                          <p className="text-xs font-semibold text-up tabular-nums">+{formatCompact(income)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-1">
                        <TrendingDown size={13} className="text-down flex-shrink-0" />
                        <div>
                          <p className="text-2xs text-muted">Gastos</p>
                          <p className="text-xs font-semibold text-down tabular-nums">-{formatCompact(expense)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <button
        className="md:hidden fixed bottom-20 right-5 w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-dropdown z-20"
        onClick={() => setShowAdd(true)}
      >
        <Plus size={22} className="text-white" />
      </button>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nueva cuenta">
        <AccountForm onClose={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar cuenta">
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">¿Eliminar esta cuenta? Los movimientos asociados no se borrarán.</p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={() => { if (deleteId) deleteAccount(deleteId); setDeleteId(null); }}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

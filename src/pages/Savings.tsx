import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Target, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { SavingGoal, CategoryColor, GoalCategory } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCompact, formatDate, percentage } from '../utils/format';
import { colorMap, colorOptions } from '../utils/colors';

const ICONS = ['🎯','🏠','🚗','✈️','💻','📱','🎓','💍','🌴','🏖️','💪','🎸','📷','🛒','🏋️','🎉','🌍','🎨'];

const GOAL_CATEGORIES: { value: GoalCategory; label: string; icon: string }[] = [
  { value: 'emergency',  label: 'Emergencia', icon: '🛡️' },
  { value: 'travel',     label: 'Viajes',     icon: '✈️' },
  { value: 'home',       label: 'Hogar',      icon: '🏠' },
  { value: 'education',  label: 'Educación',  icon: '🎓' },
  { value: 'vehicle',    label: 'Vehículo',   icon: '🚗' },
  { value: 'tech',       label: 'Tecnología', icon: '💻' },
  { value: 'health',     label: 'Salud',      icon: '💪' },
  { value: 'retirement', label: 'Retiro',     icon: '🌴' },
  { value: 'other',      label: 'Otros',      icon: '🎯' },
];

function GoalForm({ onClose, initial }: { onClose: () => void; initial?: SavingGoal }) {
  const { addSavingGoal, updateSavingGoal } = useStore();
  const [name, setName]               = useState(initial?.name ?? '');
  const [targetAmount, setTarget]     = useState(initial?.targetAmount?.toString() ?? '');
  const [currentAmount, setCurrent]   = useState(initial?.currentAmount?.toString() ?? '0');
  const [deadline, setDeadline]       = useState(initial?.deadline?.split('T')[0] ?? '');
  const [icon, setIcon]               = useState(initial?.icon ?? '🎯');
  const [color, setColor]             = useState<CategoryColor>(initial?.color ?? 'indigo');
  const [goalCategory, setGoalCat]    = useState<GoalCategory>(initial?.goalCategory ?? 'other');

  const submit = () => {
    if (!name || !targetAmount) return;
    const data = {
      name, targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: deadline ? new Date(deadline + 'T12:00:00').toISOString() : undefined,
      icon, color, goalCategory,
    };
    if (initial) updateSavingGoal(initial.id, data);
    else addSavingGoal(data);
    onClose();
  };

  return (
    <div className="p-5 space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold text-ink">Tipo de objetivo</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_CATEGORIES.map(gc => (
            <button
              key={gc.value}
              onClick={() => setGoalCat(gc.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                goalCategory === gc.value
                  ? 'bg-brand-light border-brand/40 text-brand'
                  : 'border-border bg-surface text-muted hover:text-ink'
              }`}
            >
              <span>{gc.icon}</span>{gc.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-ink">Icono</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                icon === ic ? 'bg-brand-light ring-2 ring-brand' : 'bg-surface hover:bg-card-elevated'
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

      <Input label="Nombre de la meta" placeholder="Ej. Fondo de emergencia" value={name} onChange={e => setName(e.target.value)} />
      <Input label="Objetivo" type="number" inputMode="decimal" placeholder="0.00" prefix="€" value={targetAmount} onChange={e => setTarget(e.target.value)} />
      <Input label="Ya tengo ahorrado" type="number" inputMode="decimal" placeholder="0.00" prefix="€" value={currentAmount} onChange={e => setCurrent(e.target.value)} />
      <Input label="Fecha límite (opcional)" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />

      <Button fullWidth size="lg" onClick={submit} disabled={!name || !targetAmount}>
        {initial ? 'Guardar cambios' : 'Crear meta'}
      </Button>
    </div>
  );
}

function AddFundsForm({ goal, onClose }: { goal: SavingGoal; onClose: () => void }) {
  const { addToSaving } = useStore();
  const [amount, setAmount] = useState('');
  const c = colorMap[goal.color];
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: `${c.hex}15` }}>
          {goal.icon}
        </div>
        <div>
          <p className="text-sm font-bold text-ink">{goal.name}</p>
          <p className="text-xs text-muted">Faltan {formatCompact(remaining)}</p>
        </div>
      </div>
      <Input label="Monto a añadir" type="number" inputMode="decimal" placeholder="0.00" prefix="€" value={amount} onChange={e => setAmount(e.target.value)} />
      <Button fullWidth size="lg" onClick={() => { if (amount) { addToSaving(goal.id, parseFloat(amount)); onClose(); } }} disabled={!amount} className="!bg-up">
        Añadir al ahorro
      </Button>
    </div>
  );
}

function GoalCard({ goal, onAddFunds, onDelete }: { goal: SavingGoal; onAddFunds: () => void; onDelete: () => void }) {
  const c   = colorMap[goal.color];
  const pct = percentage(goal.currentAmount, goal.targetAmount);
  return (
    <Card padding className="group relative">
      <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onAddFunds} className="h-7 px-3 rounded-xl bg-up-light text-up text-xs font-bold transition-colors">
          + Añadir
        </button>
        <button onClick={onDelete} className="w-7 h-7 rounded-xl flex items-center justify-center text-subtle hover:text-down hover:bg-down-light transition-colors">
          <Trash2 size={12} />
        </button>
      </div>

      {/* Color accent bar */}
      <div className="h-1 rounded-full mb-4" style={{ backgroundColor: c.hex, width: `${pct}%`, minWidth: '8px' }} />

      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: `${c.hex}15` }}>
          {goal.icon}
        </div>
        <div className="min-w-0 flex-1 pr-20">
          <p className="font-black text-ink text-sm truncate">{goal.name}</p>
          {goal.deadline && (
            <p className="text-xs text-muted mt-0.5">📅 {formatDate(goal.deadline)}</p>
          )}
        </div>
      </div>

      <ProgressBar value={pct} color={c.hex} height={5} className="mb-3" />
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted num-display">{formatCompact(goal.currentAmount)}</span>
        <span className="text-sm font-black num-display" style={{ color: c.hex }}>{pct}%</span>
        <span className="text-xs text-muted num-display">{formatCompact(goal.targetAmount)}</span>
      </div>
    </Card>
  );
}

export function Savings() {
  const { savingGoals, deleteSavingGoal } = useStore();
  const [showAdd, setShowAdd]     = useState(false);
  const [addFunds, setAddFunds]   = useState<SavingGoal | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<GoalCategory | 'all'>('all');

  const active    = savingGoals.filter(g => g.currentAmount < g.targetAmount);
  const completed = savingGoals.filter(g => g.currentAmount >= g.targetAmount);
  const totalSaved  = savingGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = savingGoals.reduce((s, g) => s + g.targetAmount, 0);
  const overallPct  = percentage(totalSaved, totalTarget);

  const activeCats = Array.from(new Set(active.map(g => g.goalCategory)));
  const groupedActive = (filterCat === 'all'
    ? activeCats.map(cat => ({ cat, goals: active.filter(g => g.goalCategory === cat) }))
    : [{ cat: filterCat, goals: active.filter(g => g.goalCategory === filterCat) }]
  ).filter(g => g.goals.length > 0);

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 pt-6 pb-5 gap-4">
        <h1 className="text-2xl font-black text-ink">Metas de Ahorro</h1>
        <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Nueva meta</Button>
      </div>

      <div className="px-4 md:px-8 pb-8 space-y-5">
        {/* Summary hero */}
        {savingGoals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div
              className="rounded-3xl p-6"
              style={{ background: 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-white/50 text-2xs font-bold uppercase tracking-widest mb-1">Total ahorrado</p>
              <p className="text-4xl font-black text-white num-display tracking-tight mb-5">{formatCompact(totalSaved)}</p>

              <ProgressBar value={overallPct} color="#0A84FF" height={6} className="mb-3" />

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Ahorrado', value: totalSaved, color: '#30D158' },
                  { label: 'Objetivo', value: totalTarget, color: '#FFFFFF' },
                  { label: 'Restante', value: totalTarget - totalSaved, color: '#8E8E93' },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-white/40 text-2xs font-bold uppercase tracking-wider mb-1">{m.label}</p>
                    <p className="text-sm font-black num-display" style={{ color: m.color }}>{formatCompact(m.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Category filter */}
        {activeCats.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                filterCat === 'all' ? 'bg-brand border-brand text-white' : 'border-border text-muted hover:text-ink'
              }`}
            >Todas</button>
            {activeCats.map(cat => {
              const gc = GOAL_CATEGORIES.find(g => g.value === cat);
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    filterCat === cat ? 'bg-brand border-brand text-white' : 'border-border text-muted hover:text-ink'
                  }`}
                >
                  <span>{gc?.icon}</span>{gc?.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Active goals */}
        {active.length > 0 && (
          <div className="space-y-6">
            {groupedActive.map(({ cat, goals }) => {
              const gc        = GOAL_CATEGORIES.find(g => g.value === cat);
              const catSaved  = goals.reduce((s, g) => s + g.currentAmount, 0);
              const catTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
              const catPct    = percentage(catSaved, catTarget);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{gc?.icon}</span>
                      <p className="text-xs font-bold text-ink">{gc?.label}</p>
                      <span className="text-2xs text-muted bg-surface px-2 py-0.5 rounded-full">
                        {goals.length} meta{goals.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted num-display">{formatCompact(catSaved)} / {formatCompact(catTarget)}</span>
                      <span className="text-xs font-black text-brand">{catPct}%</span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {goals.map((goal, i) => (
                        <motion.div
                          key={goal.id} layout
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                        >
                          <GoalCard
                            goal={goal}
                            onAddFunds={() => setAddFunds(goal)}
                            onDelete={() => setDeleteId(goal.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <p className="section-title mb-3 px-1">Completadas · {completed.length}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {completed.map(goal => (
                <Card key={goal.id} padding className="group relative opacity-75 hover:opacity-100 transition-opacity">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setDeleteId(goal.id)} className="w-7 h-7 rounded-xl flex items-center justify-center text-subtle hover:text-down hover:bg-down-light transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-up-light">
                      {goal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-ink text-sm truncate">{goal.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 size={12} className="text-up" />
                        <p className="text-xs text-up font-bold num-display">{formatCompact(goal.targetAmount)} alcanzado</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {savingGoals.length === 0 && (
          <Card padding className="flex flex-col items-center text-center py-16">
            <div className="w-16 h-16 rounded-3xl gradient-brand flex items-center justify-center mb-4 shadow-brand">
              <Target size={26} className="text-white" />
            </div>
            <h3 className="font-black text-ink text-lg mb-2">Sin metas de ahorro</h3>
            <p className="text-sm text-muted max-w-xs mb-5">Crea tu primera meta y empieza a ahorrar hacia tus objetivos.</p>
            <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Crear meta</Button>
          </Card>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nueva meta de ahorro">
        <GoalForm onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal isOpen={!!addFunds} onClose={() => setAddFunds(null)} title="Añadir fondos">
        {addFunds && <AddFundsForm goal={addFunds} onClose={() => setAddFunds(null)} />}
      </Modal>
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar meta">
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">¿Eliminar esta meta de ahorro?</p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={() => { if (deleteId) deleteSavingGoal(deleteId); setDeleteId(null); }}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

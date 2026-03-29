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
  { value: 'emergency',  label: 'Fondo de emergencia', icon: '🛡️' },
  { value: 'travel',     label: 'Viajes',               icon: '✈️' },
  { value: 'home',       label: 'Hogar',                icon: '🏠' },
  { value: 'education',  label: 'Educación',            icon: '🎓' },
  { value: 'vehicle',    label: 'Vehículo',             icon: '🚗' },
  { value: 'tech',       label: 'Tecnología',           icon: '💻' },
  { value: 'health',     label: 'Salud',                icon: '💪' },
  { value: 'retirement', label: 'Retiro',               icon: '🌴' },
  { value: 'other',      label: 'Otros',                icon: '🎯' },
];

function GoalForm({ onClose, initial }: { onClose: () => void; initial?: SavingGoal }) {
  const { addSavingGoal, updateSavingGoal } = useStore();
  const [name, setName]                     = useState(initial?.name ?? '');
  const [targetAmount, setTargetAmount]     = useState(initial?.targetAmount?.toString() ?? '');
  const [currentAmount, setCurrentAmount]   = useState(initial?.currentAmount?.toString() ?? '0');
  const [deadline, setDeadline]             = useState(initial?.deadline?.split('T')[0] ?? '');
  const [icon, setIcon]                     = useState(initial?.icon ?? '🎯');
  const [color, setColor]                   = useState<CategoryColor>(initial?.color ?? 'indigo');
  const [goalCategory, setGoalCategory]     = useState<GoalCategory>(initial?.goalCategory ?? 'other');

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
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink">Tipo de objetivo</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_CATEGORIES.map(gc => (
            <button
              key={gc.value}
              onClick={() => setGoalCategory(gc.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                goalCategory === gc.value
                  ? 'bg-brand-light border-brand/40 text-brand'
                  : 'border-border bg-surface text-ink hover:bg-border/50'
              }`}
            >
              <span>{gc.icon}</span>{gc.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink">Icono</label>
        <div className="flex flex-wrap gap-1.5">
          {ICONS.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                icon === ic ? 'bg-brand-light ring-1 ring-brand' : 'bg-surface hover:bg-border/50'
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

      <Input label="Nombre de la meta" placeholder="Ej. Fondo de emergencia" value={name} onChange={e => setName(e.target.value)} />
      <Input label="Objetivo" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
      <Input label="Ya tengo ahorrado" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} />
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
      <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${c.hex}15` }}>
          {goal.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{goal.name}</p>
          <p className="text-xs text-muted">Faltan {formatCompact(remaining)}</p>
        </div>
      </div>
      <Input label="Monto a añadir" type="number" inputMode="decimal" placeholder="0.00" prefix="$" value={amount} onChange={e => setAmount(e.target.value)} />
      <Button fullWidth size="lg" onClick={() => { if (amount) { addToSaving(goal.id, parseFloat(amount)); onClose(); } }} disabled={!amount} className="!bg-up hover:!bg-green-700">
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
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onAddFunds} className="h-7 px-2.5 rounded-md bg-up-light text-up text-xs font-medium hover:bg-green-100 transition-colors">
          + Añadir
        </button>
        <button onClick={onDelete} className="w-7 h-7 rounded-md flex items-center justify-center text-subtle hover:text-down hover:bg-down-light transition-colors">
          <Trash2 size={12} />
        </button>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: `${c.hex}15` }}>
          {goal.icon}
        </div>
        <div className="min-w-0 flex-1 pr-16">
          <p className="font-semibold text-ink text-sm">{goal.name}</p>
          {goal.deadline && (
            <p className="text-xs text-subtle mt-0.5">📅 {formatDate(goal.deadline)}</p>
          )}
        </div>
      </div>

      <ProgressBar value={pct} color={c.hex} height={5} className="mb-2" />
      <div className="flex justify-between">
        <span className="text-xs text-muted tabular-nums">{formatCompact(goal.currentAmount)}</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color: c.hex }}>{pct}%</span>
        <span className="text-xs text-muted tabular-nums">{formatCompact(goal.targetAmount)}</span>
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

  const groupedActive: { cat: GoalCategory; goals: SavingGoal[] }[] =
    filterCat === 'all'
      ? activeCats.map(cat => ({ cat, goals: active.filter(g => g.goalCategory === cat) }))
      : [{ cat: filterCat, goals: active.filter(g => g.goalCategory === filterCat) }];

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 pt-6 pb-5 gap-4">
        <h1 className="text-xl font-semibold text-ink">Metas de Ahorro</h1>
        <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Nueva meta</Button>
      </div>

      <div className="px-6 md:px-8 pb-6 space-y-5">
        {savingGoals.length > 0 && (
          <Card padding>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-ink">Progreso total</span>
                  <span className="text-sm font-semibold text-brand">{overallPct}%</span>
                </div>
                <ProgressBar value={overallPct} color="#4F46E5" height={6} />
              </div>
              <div className="flex gap-6 md:gap-8 flex-shrink-0">
                <div>
                  <p className="text-2xs text-muted uppercase tracking-wider mb-0.5">Ahorrado</p>
                  <p className="text-lg font-semibold text-up tabular-nums">{formatCompact(totalSaved)}</p>
                </div>
                <div>
                  <p className="text-2xs text-muted uppercase tracking-wider mb-0.5">Objetivo</p>
                  <p className="text-lg font-semibold text-ink tabular-nums">{formatCompact(totalTarget)}</p>
                </div>
                <div>
                  <p className="text-2xs text-muted uppercase tracking-wider mb-0.5">Restante</p>
                  <p className="text-lg font-semibold text-muted tabular-nums">{formatCompact(totalTarget - totalSaved)}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeCats.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filterCat === 'all' ? 'bg-brand-light border-brand/40 text-brand' : 'border-border bg-surface text-muted hover:text-ink'
              }`}
            >
              Todas
            </button>
            {activeCats.map(cat => {
              const gc = GOAL_CATEGORIES.find(g => g.value === cat);
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filterCat === cat ? 'bg-brand-light border-brand/40 text-brand' : 'border-border bg-surface text-muted hover:text-ink'
                  }`}
                >
                  <span>{gc?.icon}</span>{gc?.label}
                </button>
              );
            })}
          </div>
        )}

        {active.length > 0 && (
          <div className="space-y-6">
            {groupedActive.map(({ cat, goals }) => {
              const gc        = GOAL_CATEGORIES.find(g => g.value === cat);
              const catSaved  = goals.reduce((s, g) => s + g.currentAmount, 0);
              const catTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
              const catPct    = percentage(catSaved, catTarget);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{gc?.icon}</span>
                      <p className="text-xs font-semibold text-ink">{gc?.label}</p>
                      <span className="text-xs text-muted">· {goals.length} meta{goals.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted tabular-nums">{formatCompact(catSaved)} / {formatCompact(catTarget)}</span>
                      <span className="text-xs font-semibold text-brand">{catPct}%</span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {goals.map((goal, i) => (
                        <motion.div
                          key={goal.id} layout
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04 }}
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

        {completed.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Completadas · {completed.length}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {completed.map(goal => (
                <Card key={goal.id} padding className="group relative opacity-80">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setDeleteId(goal.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-subtle hover:text-down hover:bg-down-light transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-up-light">
                      {goal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink text-sm">{goal.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={12} className="text-up" />
                        <p className="text-xs text-up font-medium">{formatCompact(goal.targetAmount)} alcanzado</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {savingGoals.length === 0 && (
          <Card padding className="flex flex-col items-center text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mb-4">
              <Target size={28} className="text-brand" />
            </div>
            <h3 className="font-semibold text-ink mb-2">Sin metas de ahorro</h3>
            <p className="text-sm text-muted max-w-xs mb-5">Crea tu primera meta para empezar a ahorrar.</p>
            <Button onClick={() => setShowAdd(true)}><Plus size={15} /> Crear meta</Button>
          </Card>
        )}
      </div>

      <button className="md:hidden fixed bottom-20 right-5 w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-dropdown z-20" onClick={() => setShowAdd(true)}>
        <Plus size={22} className="text-white" />
      </button>

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

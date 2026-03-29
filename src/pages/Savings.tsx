import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Target } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { SavingGoal, CategoryColor } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCompact, formatDate, percentage } from '../utils/format';
import { colorMap, colorOptions } from '../utils/colors';

const ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🌴', '🏖️', '💪', '🎸', '📷', '🛒', '🏋️'];

function GoalForm({ onClose, initial }: { onClose: () => void; initial?: SavingGoal }) {
  const { addSavingGoal, updateSavingGoal } = useStore();
  const [name, setName] = useState(initial?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(initial?.targetAmount?.toString() ?? '');
  const [currentAmount, setCurrentAmount] = useState(initial?.currentAmount?.toString() ?? '0');
  const [deadline, setDeadline] = useState(initial?.deadline?.split('T')[0] ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '🎯');
  const [color, setColor] = useState<CategoryColor>(initial?.color ?? 'blue');

  const handleSubmit = () => {
    if (!name || !targetAmount) return;
    if (initial) {
      updateSavingGoal(initial.id, {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount),
        deadline: deadline ? new Date(deadline + 'T12:00:00').toISOString() : undefined,
        icon,
        color,
      });
    } else {
      addSavingGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        deadline: deadline ? new Date(deadline + 'T12:00:00').toISOString() : undefined,
        icon,
        color,
      });
    }
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
                  ? 'bg-[#007AFF]/15 ring-1 ring-[#007AFF]'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
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
              style={{
                backgroundColor: colorMap[c].hex,
              }}
            />
          ))}
        </div>
      </div>

      <Input
        label="Nombre de la meta"
        placeholder="Ej. Fondo de emergencia"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="Monto objetivo"
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        prefix="$"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
      />
      <Input
        label="Ya tengo ahorrado"
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        prefix="$"
        value={currentAmount}
        onChange={(e) => setCurrentAmount(e.target.value)}
      />
      <Input
        label="Fecha límite (opcional)"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <div className="pb-2">
        <Button fullWidth size="lg" onClick={handleSubmit} disabled={!name || !targetAmount}>
          {initial ? 'Guardar cambios' : 'Crear meta de ahorro'}
        </Button>
      </div>
    </div>
  );
}

function AddAmountForm({ goal, onClose }: { goal: SavingGoal; onClose: () => void }) {
  const { addToSaving } = useStore();
  const [amount, setAmount] = useState('');

  const remaining = goal.targetAmount - goal.currentAmount;

  const handleSubmit = () => {
    if (!amount) return;
    addToSaving(goal.id, parseFloat(amount));
    onClose();
  };

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl p-4 flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[goal.color].light}`}>
          <span className="text-2xl">{goal.icon}</span>
        </div>
        <div>
          <p className="font-semibold text-[#1C1C1E] dark:text-white">{goal.name}</p>
          <p className="text-sm text-[#8E8E93]">Faltan {formatCompact(remaining)}</p>
        </div>
      </div>
      <Input
        label="Monto a añadir"
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        prefix="$"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <div className="pb-2">
        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          disabled={!amount}
          className="!bg-[#34C759]"
        >
          Añadir al ahorro
        </Button>
      </div>
    </div>
  );
}

export function Savings() {
  const { savingGoals, deleteSavingGoal } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [addAmountGoal, setAddAmountGoal] = useState<SavingGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const completed = savingGoals.filter((g) => g.currentAmount >= g.targetAmount);
  const active = savingGoals.filter((g) => g.currentAmount < g.targetAmount);

  const totalSaved = savingGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = savingGoals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <PageWrapper>
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-[#1C1C1E] dark:text-white tracking-tight mb-5">
          Metas de Ahorro
        </h1>

        {/* Summary */}
        {savingGoals.length > 0 && (
          <motion.div
            className="rounded-3xl p-5 mb-5"
            style={{ background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/70 text-sm mb-1">Total ahorrado</p>
            <p className="text-3xl font-bold text-white mb-4">{formatCompact(totalSaved)}</p>
            <ProgressBar
              value={percentage(totalSaved, totalTarget)}
              color="rgba(255,255,255,0.9)"
              height={6}
            />
            <div className="flex justify-between mt-2">
              <span className="text-white/70 text-xs">0</span>
              <span className="text-white/70 text-xs">Meta: {formatCompact(totalTarget)}</span>
            </div>
          </motion.div>
        )}

        {/* Active goals */}
        {active.length > 0 && (
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#1C1C1E] dark:text-white mb-3">En progreso</h2>
            <div className="space-y-3">
              <AnimatePresence>
                {active.map((goal, i) => {
                  const colors = colorMap[goal.color];
                  const pct = percentage(goal.currentAmount, goal.targetAmount);
                  return (
                    <motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors.light}`}>
                            <span className="text-2xl">{goal.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#1C1C1E] dark:text-white">{goal.name}</p>
                            <p className="text-xs text-[#8E8E93] mt-0.5">
                              {formatCompact(goal.currentAmount)} / {formatCompact(goal.targetAmount)}
                            </p>
                            {goal.deadline && (
                              <p className="text-xs text-[#8E8E93]">📅 {formatDate(goal.deadline)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setAddAmountGoal(goal)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#34C759]/10 text-[#34C759]"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteId(goal.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#C7C7CC] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <ProgressBar value={pct} color={colors.hex} className="flex-1" />
                          <span className={`text-sm font-bold ${colors.text}`}>{pct}%</span>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Completed goals */}
        {completed.length > 0 && (
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#1C1C1E] dark:text-white mb-3">Completadas 🎉</h2>
            <div className="space-y-3">
              {completed.map((goal) => {
                return (
                  <Card key={goal.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#34C759]/15">
                        <span className="text-2xl">{goal.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1C1C1E] dark:text-white">{goal.name}</p>
                        <p className="text-xs text-[#34C759] font-medium mt-0.5">
                          ✓ Meta alcanzada — {formatCompact(goal.targetAmount)}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeleteId(goal.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#C7C7CC] hover:text-[#FF3B30] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {savingGoals.length === 0 && (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#34C759]/10 flex items-center justify-center mb-4">
              <Target size={36} className="text-[#34C759]" />
            </div>
            <h3 className="font-semibold text-[#1C1C1E] dark:text-white text-lg mb-2">Sin metas de ahorro</h3>
            <p className="text-sm text-[#8E8E93] max-w-xs mb-6">
              Crea tu primera meta y empieza a ahorrar para lo que más te importa.
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#34C759] rounded-full flex items-center justify-center shadow-apple-lg z-20"
        onClick={() => setShowAdd(true)}
        whileTap={{ scale: 0.92 }}
      >
        <Plus size={24} className="text-white" />
      </motion.button>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nueva Meta">
        <GoalForm onClose={() => setShowAdd(false)} />
      </Modal>

      <Modal
        isOpen={!!addAmountGoal}
        onClose={() => setAddAmountGoal(null)}
        title="Añadir al Ahorro"
      >
        {addAmountGoal && (
          <AddAmountForm goal={addAmountGoal} onClose={() => setAddAmountGoal(null)} />
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar meta">
        <div className="px-5 py-4 space-y-4">
          <p className="text-[#3A3A3C] dark:text-[#EBEBF5]/80">¿Eliminar esta meta de ahorro?</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                if (deleteId) deleteSavingGoal(deleteId);
                setDeleteId(null);
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

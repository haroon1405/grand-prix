import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Eye } from 'lucide-react';
import { usePowerUpStore, POWER_UP_DEFS } from '../../store/powerUpStore';
import { useBattleStore } from '../../store/battleStore';
import { PAINTRESS_ATTACKS } from '../../data/attacks';
import { PowerUpType } from '../../types/battle';
import { sfx } from '../../lib/sounds';

const POWER_UP_ICONS: Record<PowerUpType, typeof Shield> = {
  ink_shield: Shield,
  time_fracture: Clock,
  gommage_lens: Eye,
};

const POWER_UP_ORDER: PowerUpType[] = ['ink_shield', 'time_fracture', 'gommage_lens'];

function CooldownRing({ type, size = 36 }: { type: PowerUpType; size?: number }) {
  const cooldownEnd = usePowerUpStore((s) => s.cooldowns[type]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (cooldownEnd <= Date.now()) { setProgress(0); return; }
    const def = POWER_UP_DEFS[type];
    const update = () => {
      const remaining = cooldownEnd - Date.now();
      if (remaining <= 0) { setProgress(0); return; }
      setProgress(remaining / def.cooldownMs);
    };
    update();
    const id = window.setInterval(update, 100);
    return () => window.clearInterval(id);
  }, [cooldownEnd, type]);

  if (progress <= 0) return null;

  const r = (size - 4) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);

  return (
    <svg className="pointer-events-none absolute inset-0" width={size} height={size}
      style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(201, 169, 89, 0.35)" strokeWidth={2}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

export function PowerUpBar() {
  const credits = usePowerUpStore((s) => s.credits);
  const activate = usePowerUpStore((s) => s.activate);
  const canAfford = usePowerUpStore((s) => s.canAfford);
  const isOnCooldown = usePowerUpStore((s) => s.isOnCooldown);

  const handleActivate = (type: PowerUpType) => {
    const ok = activate(type);
    if (ok) {
      sfx.play('power_up');

      // Handle Time Fracture — tell battleStore to freeze timer
      if (type === 'time_fracture') {
        useBattleStore.setState({
          timerFrozen: true,
          timerFrozenUntil: Date.now() + POWER_UP_DEFS[type].durationMs,
        });
      }

      // Handle Gommage Lens — reveal next Paintress attack
      if (type === 'gommage_lens') {
        const nextAttack = PAINTRESS_ATTACKS[Math.floor(Math.random() * PAINTRESS_ATTACKS.length)];
        useBattleStore.setState({ revealedPaintressAttack: nextAttack.id });
        useBattleStore.getState().addLog('system', `Gommage Lens reveals: next attack will be "${nextAttack.name}"`, '#c9a959');
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-ivory-muted uppercase tracking-widest font-display">
          Artifacts
        </p>
        <span className="text-[10px] font-tabular text-gold">{credits} credits</span>
      </div>
      <div className="flex gap-1.5">
        {POWER_UP_ORDER.map(type => {
          const def = POWER_UP_DEFS[type];
          const Icon = POWER_UP_ICONS[type];
          const affordable = canAfford(type);
          const onCd = isOnCooldown(type);
          const disabled = !affordable || onCd;

          return (
            <motion.button
              key={type}
              whileHover={disabled ? undefined : { scale: 1.05 }}
              whileTap={disabled ? undefined : { scale: 0.95 }}
              onClick={() => handleActivate(type)}
              disabled={disabled}
              className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg border text-[9px] flex-1
                ${disabled
                  ? 'bg-navy/20 border-ash/10 text-ivory-muted/40 cursor-not-allowed'
                  : 'bg-navy/40 border-gold/20 text-gold cursor-pointer hover:border-gold/40'
                }`}
              title={def.description}
            >
              <CooldownRing type={type} />
              <Icon size={14} />
              <span className="font-display truncate">{def.label}</span>
              <span className="font-tabular text-[8px] opacity-60">{def.cost}c</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

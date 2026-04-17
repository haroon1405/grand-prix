import { motion } from 'framer-motion';
import { Map, Swords, Tent, BookOpen, ScrollText, Cpu, Eye, Zap } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useMarketStore } from '../../store/marketStore';
import { useProgressionStore } from '../../store/progressionStore';
import { useBattleStore } from '../../store/battleStore';

type Page = 'continent' | 'battle' | 'camp' | 'bestiary' | 'chronicles';

const NAV_ITEMS: { id: Page; gameName: string; icon: typeof Map }[] = [
  { id: 'continent', gameName: 'The Continent', icon: Map },
  { id: 'battle', gameName: 'The Expedition', icon: Swords },
  { id: 'camp', gameName: 'The Camp', icon: Tent },
  { id: 'bestiary', gameName: 'The Bestiary', icon: BookOpen },
  { id: 'chronicles', gameName: 'The Chronicles', icon: ScrollText },
];

const TEAM_MEMBERS = [
  { name: 'Oracle AI', role: 'Predictive Analysis', icon: Cpu },
  { name: 'Executioner', role: 'Trade Specialist', icon: Zap },
  { name: 'Stargazer', role: 'Market Surveillance', icon: Eye },
];

export function Sidebar() {
  const { currentPage, setPage } = useUIStore();
  const { globalMood } = useMarketStore();
  const { totalXp, rank } = useProgressionStore();
  const battlePhase = useBattleStore((s) => s.phase);
  const paintressHP = useBattleStore((s) => s.paintressHP);
  const paintressMaxHP = useBattleStore((s) => s.paintressMaxHP);

  const questProgress = Math.round(((paintressMaxHP - paintressHP) / paintressMaxHP) * 100);

  return (
    <aside className="exp-sidebar flex flex-col">
      {/* Navigation */}
      <div className="mb-4">
        <p className="exp-section-title">Navigation</p>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(({ id, gameName, icon: Icon }) => {
            const isActive = currentPage === id;
            return (
              <motion.button
                key={id}
                onClick={() => setPage(id)}
                whileHover={{ x: 2 }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-left transition-all duration-150"
                style={{
                  background: isActive ? 'rgba(196,164,109,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(196,164,109,0.2)' : '1px solid transparent',
                  color: isActive ? 'var(--color-exp-gold)' : 'var(--color-ivory-muted)',
                }}
              >
                <Icon size={14} style={{ flexShrink: 0, color: isActive ? 'var(--color-exp-gold)' : 'inherit' }} />
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  {gameName}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(196,164,109,0.08)', margin: '0.5rem 0' }} />

      {/* Expedition Team */}
      <div className="flex-1">
        <p className="exp-section-title">Exploration Team</p>
        <div className="space-y-2">
          {TEAM_MEMBERS.map((member, i) => {
            const statuses = [
              globalMood === 'calm' ? 'Scanning...' : globalMood === 'stirring' ? 'WAIT' : globalMood === 'volatile' ? 'STRIKE' : 'COUNTER',
              'Ready',
              'Observing',
            ];
            const isActive = i === 0;

            return (
              <div
                key={member.name}
                className="flex items-center gap-2.5 p-2 transition-colors"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: isActive ? '1px solid rgba(196,164,109,0.15)' : '1px solid transparent',
                }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '1px solid rgba(196,164,109,0.25)',
                    background: 'rgba(0,0,0,0.4)',
                    color: 'var(--color-exp-gold)',
                  }}
                >
                  <member.icon size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.68rem', color: 'var(--color-ivory)' }}>
                    {member.name}
                  </h4>
                  <p style={{
                    fontSize: '0.55rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: isActive ? 'var(--color-exp-info)' : 'var(--color-ivory-muted)',
                    opacity: isActive ? 1 : 0.5,
                  }}>
                    {member.role}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.6rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'rgba(196,164,109,0.45)',
                }}>
                  {statuses[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Quest */}
      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(196,164,109,0.08)' }}>
        <p className="exp-section-title">Active Quest</p>
        {battlePhase === 'trading' ? (
          <div className="space-y-1.5">
            <p style={{ fontSize: '0.65rem', opacity: 0.55, lineHeight: 1.5, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              Defeat The Paintress before the Rift collapses.
            </p>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
              <motion.div
                style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  background: 'var(--color-exp-gold)',
                }}
                animate={{ width: `${questProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'rgba(196,164,109,0.4)' }}>
              <span>DAMAGE: {questProgress}%</span>
              <span>HP: {Math.round(paintressHP)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p style={{ fontSize: '0.65rem', opacity: 0.55, lineHeight: 1.5, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              Begin an Expedition to engage The Paintress.
            </p>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ height: '100%', width: '0%', background: 'var(--color-exp-gold)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'rgba(196,164,109,0.4)' }}>
              <span>XP: {totalXp.toLocaleString()}</span>
              <span>LVL {rank.level}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

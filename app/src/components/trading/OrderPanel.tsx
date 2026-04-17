import { useState } from 'react';
import { TrendingUp, TrendingDown, Shield, Target } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';
import { useMarketStore } from '../../store/marketStore';
import { useTradingStore } from '../../store/tradingStore';
import { useUIStore } from '../../store/uiStore';
import { getAssetBySymbol } from '../../data/assets';
import { TRADE_FLAVOR_TEXT } from '../../data/lore';
import { StakeLevel, TradeDirection } from '../../types/trading';

const STAKE_PRESETS: { level: StakeLevel; label: string; multiplier: number }[] = [
  { level: 'LOW', label: 'Cautious', multiplier: 0.02 },
  { level: 'MEDIUM', label: 'Balanced', multiplier: 0.05 },
  { level: 'HIGH', label: 'Aggressive', multiplier: 0.1 },
  { level: 'RECKLESS', label: 'Reckless', multiplier: 0.2 },
];

export function OrderPanel() {
  const { selectedSymbol, markets } = useMarketStore();
  const { capital, openPosition } = useTradingStore();
  const { selectedCharacter, addNotification } = useUIStore();
  const [stakeLevel, setStakeLevel] = useState<StakeLevel>('MEDIUM');
  const [customStake, setCustomStake] = useState('');
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [takeProfitEnabled, setTakeProfitEnabled] = useState(false);
  const [stopLossPercent] = useState(5);
  const [takeProfitPercent] = useState(10);

  const market = markets[selectedSymbol];
  const asset = getAssetBySymbol(selectedSymbol);
  if (!market || !asset) return null;

  const preset = STAKE_PRESETS.find(p => p.level === stakeLevel);
  const stake = customStake ? parseFloat(customStake) : capital * (preset?.multiplier ?? 0.05);
  const isValidStake = stake > 0 && stake <= capital;

  const executeTrade = (direction: TradeDirection) => {
    if (!isValidStake) return;

    const stopLoss = stopLossEnabled ? (stake * stopLossPercent) / 100 : undefined;
    const takeProfit = takeProfitEnabled ? (stake * takeProfitPercent) / 100 : undefined;

    openPosition(
      {
        symbol: selectedSymbol,
        direction,
        stake: +stake.toFixed(2),
        stakeLevel,
        stopLoss,
        takeProfit,
        characterId: selectedCharacter,
      },
      market.lastPrice
    );

    const flavor = TRADE_FLAVOR_TEXT[direction];
    addNotification(flavor.action, 'lore');
    setCustomStake('');
  };

  return (
    <div className="bg-surface/50 border border-ash/20 rounded-xl p-4 space-y-4">
      {/* Asset info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-gold font-semibold">{asset.gameName}</h3>
          <p className="text-[10px] text-ivory-muted">{asset.symbol} &middot; {asset.gameCategory}</p>
        </div>
        <div className="text-right">
          <p className="font-tabular text-xl text-ivory">{market.lastPrice.toFixed(2)}</p>
          <p className={`font-tabular text-xs ${market.change >= 0 ? 'text-teal' : 'text-crimson'}`}>
            {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)} ({market.changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Stake level */}
      <div>
        <p className="text-[10px] text-ivory-muted uppercase tracking-widest font-display mb-2">Commitment</p>
        <div className="grid grid-cols-4 gap-1.5">
          {STAKE_PRESETS.map(p => (
            <button
              key={p.level}
              onClick={() => { setStakeLevel(p.level); setCustomStake(''); }}
              className={`
                px-2 py-1.5 rounded text-xs font-display transition-all cursor-pointer
                ${stakeLevel === p.level && !customStake
                  ? 'bg-gold/20 border border-gold/40 text-gold'
                  : 'bg-navy border border-ash/20 text-ivory-muted hover:border-ash-light'}
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom stake */}
      <div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={customStake}
            onChange={(e) => setCustomStake(e.target.value)}
            placeholder={`${stake.toFixed(2)}`}
            className="flex-1 bg-navy border border-ash/30 rounded px-3 py-2 text-sm font-tabular text-ivory
              placeholder:text-ivory-muted/40 focus:outline-none focus:border-gold/40 transition-colors"
          />
          <span className="text-xs text-ivory-muted">of {capital.toFixed(0)}</span>
        </div>
      </div>

      {/* SL/TP toggles */}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={stopLossEnabled}
            onChange={(e) => setStopLossEnabled(e.target.checked)}
            className="accent-crimson"
          />
          <Shield size={12} className="text-crimson" />
          <span className="text-xs text-ivory-muted">Brace {stopLossPercent}%</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={takeProfitEnabled}
            onChange={(e) => setTakeProfitEnabled(e.target.checked)}
            className="accent-teal"
          />
          <Target size={12} className="text-teal" />
          <span className="text-xs text-ivory-muted">Prophecy {takeProfitPercent}%</span>
        </label>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <GlowButton
          variant="teal"
          size="lg"
          onClick={() => executeTrade('STRIKE_UP')}
          disabled={!isValidStake}
          className="flex items-center justify-center gap-2"
        >
          <TrendingUp size={16} />
          <span>Strike Up</span>
        </GlowButton>
        <GlowButton
          variant="crimson"
          size="lg"
          onClick={() => executeTrade('STRIKE_DOWN')}
          disabled={!isValidStake}
          className="flex items-center justify-center gap-2"
        >
          <TrendingDown size={16} />
          <span>Strike Down</span>
        </GlowButton>
      </div>

      {/* Flavor text */}
      <p className="text-[10px] text-ivory-muted/50 font-display italic text-center">
        "{asset.loreText}"
      </p>
    </div>
  );
}

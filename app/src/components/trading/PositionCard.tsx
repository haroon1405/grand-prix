import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { Position } from '../../types/trading';
import { getAssetBySymbol } from '../../data/assets';
import { useTradingStore } from '../../store/tradingStore';
import { useMarketStore } from '../../store/marketStore';
import { useUIStore } from '../../store/uiStore';
import { getCharacter } from '../../data/characters';
import { TRADE_FLAVOR_TEXT } from '../../data/lore';

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const closePosition = useTradingStore((s) => s.closePosition);
  const market = useMarketStore((s) => s.markets[position.symbol]);
  const addNotification = useUIStore((s) => s.addNotification);
  const asset = getAssetBySymbol(position.symbol);
  const character = getCharacter(position.characterId);
  const isProfitable = position.pnl >= 0;
  const isUp = position.direction === 'STRIKE_UP';

  const handleClose = () => {
    if (!market) return;
    closePosition(position.id, market.lastPrice);

    const flavor = TRADE_FLAVOR_TEXT.close;
    if (position.pnl > 0) {
      addNotification(flavor.profit, 'success');
    } else if (position.pnl < 0) {
      addNotification(flavor.loss, 'danger');
    } else {
      addNotification(flavor.breakeven, 'info');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        bg-navy/60 border rounded-lg p-3 space-y-2
        ${isProfitable ? 'border-teal/20' : 'border-crimson/20'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isUp ? (
            <TrendingUp size={14} className="text-teal" />
          ) : (
            <TrendingDown size={14} className="text-crimson" />
          )}
          <span className="font-display text-sm text-ivory">
            {asset?.gameName ?? position.symbol}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${isUp ? 'bg-teal/10 text-teal' : 'bg-crimson/10 text-crimson'}`}>
            {isUp ? 'STRIKE UP' : 'STRIKE DOWN'}
          </span>
        </div>
        <button
          onClick={handleClose}
          className="text-ivory-muted hover:text-crimson transition-colors p-1 cursor-pointer"
          title="Extract (Close Position)"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div>
          <p className="text-ivory-muted">Entry</p>
          <p className="font-tabular text-ivory">{position.entryPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-ivory-muted">Current</p>
          <p className="font-tabular text-ivory">{position.currentPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-ivory-muted">Stake</p>
          <p className="font-tabular text-gold">{position.stake.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-ivory-muted">P&L</p>
          <p className={`font-tabular ${isProfitable ? 'text-teal' : 'text-crimson'}`}>
            {isProfitable ? '+' : ''}{position.pnl.toFixed(2)}
          </p>
        </div>
      </div>

      {character && (
        <div className="flex items-center gap-1 text-[10px] text-ivory-muted/50">
          <span style={{ color: character.accentColor }}>{character.name}</span>
          <span>&middot; {position.stakeLevel}</span>
          {position.stopLoss && <span>&middot; Brace: -{position.stopLoss.toFixed(2)}</span>}
          {position.takeProfit && <span>&middot; Prophecy: +{position.takeProfit.toFixed(2)}</span>}
        </div>
      )}
    </motion.div>
  );
}

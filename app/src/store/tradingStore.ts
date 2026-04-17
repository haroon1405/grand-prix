import { create } from 'zustand';
import { Position, TradeOrder, PortfolioState, PositionStatus } from '../types/trading';

interface TradingStore extends PortfolioState {
  openPosition: (order: TradeOrder, currentPrice: number) => Position;
  closePosition: (positionId: string, currentPrice: number) => void;
  updatePositions: (prices: Record<string, number>) => void;
  getOpenPositions: () => Position[];
  getClosedPositions: () => Position[];
}

let positionIdCounter = 0;

function calculatePnl(position: Position, currentPrice: number): { pnl: number; pnlPercent: number } {
  const direction = position.direction === 'STRIKE_UP' ? 1 : -1;
  const priceDiff = (currentPrice - position.entryPrice) * direction;
  const pnl = (priceDiff / position.entryPrice) * position.stake;
  const pnlPercent = (priceDiff / position.entryPrice) * 100;
  return { pnl: +pnl.toFixed(2), pnlPercent: +pnlPercent.toFixed(4) };
}

export const useTradingStore = create<TradingStore>((set, get) => ({
  capital: 10000,
  startingCapital: 10000,
  totalPnl: 0,
  exposure: 0,
  resolve: 100,
  positions: [],
  closedPositions: [],
  tradeCount: 0,
  winCount: 0,
  lossCount: 0,

  openPosition: (order, currentPrice) => {
    const id = `pos_${++positionIdCounter}_${Date.now()}`;
    const position: Position = {
      id,
      symbol: order.symbol,
      direction: order.direction,
      entryPrice: currentPrice,
      currentPrice,
      stake: order.stake,
      stakeLevel: order.stakeLevel,
      pnl: 0,
      pnlPercent: 0,
      stopLoss: order.stopLoss,
      takeProfit: order.takeProfit,
      openTime: Date.now(),
      status: 'open',
      characterId: order.characterId,
    };

    set((state) => {
      const totalStaked = state.positions.reduce((sum, p) => sum + p.stake, 0) + order.stake;
      const exposure = Math.min(1, totalStaked / state.capital);

      return {
        positions: [...state.positions, position],
        capital: state.capital - order.stake,
        exposure,
        tradeCount: state.tradeCount + 1,
      };
    });

    return position;
  },

  closePosition: (positionId, currentPrice) => {
    set((state) => {
      const position = state.positions.find(p => p.id === positionId);
      if (!position) return state;

      const { pnl } = calculatePnl(position, currentPrice);
      const closedPosition: Position = {
        ...position,
        currentPrice,
        pnl,
        pnlPercent: (pnl / position.stake) * 100,
        closeTime: Date.now(),
        status: 'closed' as PositionStatus,
      };

      const isWin = pnl > 0;
      const newCapital = state.capital + position.stake + pnl;
      const remainingPositions = state.positions.filter(p => p.id !== positionId);
      const totalStaked = remainingPositions.reduce((sum, p) => sum + p.stake, 0);
      const exposure = newCapital > 0 ? Math.min(1, totalStaked / newCapital) : 1;

      // Resolve changes: wins boost, losses drain
      const resolveChange = isWin ? Math.min(5, pnl / 10) : Math.max(-10, pnl / 5);

      return {
        positions: remainingPositions,
        closedPositions: [closedPosition, ...state.closedPositions].slice(0, 100),
        capital: +newCapital.toFixed(2),
        totalPnl: +(state.totalPnl + pnl).toFixed(2),
        exposure,
        resolve: Math.max(0, Math.min(100, state.resolve + resolveChange)),
        winCount: isWin ? state.winCount + 1 : state.winCount,
        lossCount: !isWin ? state.lossCount + 1 : state.lossCount,
      };
    });
  },

  updatePositions: (prices) => {
    set((state) => {
      let shouldCheckSLTP = false;
      const updatedPositions = state.positions.map(p => {
        const currentPrice = prices[p.symbol];
        if (currentPrice === undefined) return p;

        const { pnl, pnlPercent } = calculatePnl(p, currentPrice);

        // Check stop loss / take profit
        if (p.stopLoss && pnl <= -p.stopLoss) {
          shouldCheckSLTP = true;
        }
        if (p.takeProfit && pnl >= p.takeProfit) {
          shouldCheckSLTP = true;
        }

        return { ...p, currentPrice, pnl, pnlPercent };
      });

      // Auto-close SL/TP positions
      if (shouldCheckSLTP) {
        const toClose: Position[] = [];
        const remaining: Position[] = [];

        for (const p of updatedPositions) {
          const shouldClose =
            (p.stopLoss && p.pnl <= -p.stopLoss) ||
            (p.takeProfit && p.pnl >= p.takeProfit);

          if (shouldClose) {
            toClose.push({
              ...p,
              closeTime: Date.now(),
              status: p.stopLoss && p.pnl <= -p.stopLoss ? 'liquidated' : 'closed',
            });
          } else {
            remaining.push(p);
          }
        }

        if (toClose.length > 0) {
          let capitalDelta = 0;
          let wins = 0;
          let losses = 0;
          let resolveChange = 0;

          for (const p of toClose) {
            capitalDelta += p.stake + p.pnl;
            if (p.pnl > 0) wins++;
            else losses++;
            resolveChange += p.pnl > 0 ? 3 : -5;
          }

          const newCapital = state.capital + capitalDelta;
          const totalStaked = remaining.reduce((sum, p) => sum + p.stake, 0);

          return {
            positions: remaining,
            closedPositions: [...toClose.reverse(), ...state.closedPositions].slice(0, 100),
            capital: +newCapital.toFixed(2),
            totalPnl: +(state.totalPnl + toClose.reduce((s, p) => s + p.pnl, 0)).toFixed(2),
            exposure: newCapital > 0 ? Math.min(1, totalStaked / newCapital) : 1,
            resolve: Math.max(0, Math.min(100, state.resolve + resolveChange)),
            winCount: state.winCount + wins,
            lossCount: state.lossCount + losses,
          };
        }

        return { positions: remaining };
      }

      return { positions: updatedPositions };
    });
  },

  getOpenPositions: () => get().positions.filter(p => p.status === 'open'),
  getClosedPositions: () => get().closedPositions,
}));

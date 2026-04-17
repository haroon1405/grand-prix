import { create } from 'zustand';
import { Tick, Candle, MarketState, MarketMood } from '../types/market';
import { ASSETS } from '../data/assets';
import { derivMarketService } from '../services/derivMarketService';

type DataMode = 'live' | 'synthetic' | 'connecting';

interface MarketStore {
  markets: Record<string, MarketState>;
  selectedSymbol: string;
  globalMood: MarketMood;
  dataMode: DataMode;

  setSelectedSymbol: (symbol: string) => void;
  updateTick: (tick: Tick) => void;
  getMarket: (symbol: string) => MarketState | undefined;
  startEngine: () => void;
  stopEngine: () => void;
}

function calculateTrend(candles: Candle[]): number {
  if (candles.length < 5) return 0;
  const recent = candles.slice(-10);
  const firstClose = recent[0].close;
  const lastClose = recent[recent.length - 1].close;
  const change = (lastClose - firstClose) / firstClose;
  return Math.max(-1, Math.min(1, change * 50));
}

function calculateVolatility(ticks: Tick[]): number {
  if (ticks.length < 5) return 0;
  const prices = ticks.map(t => t.quote);
  const returns = prices.slice(1).map((p, i) => Math.abs((p - prices[i]) / prices[i]));
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  return Math.min(1, avgReturn * 200);
}

function deriveGlobalMood(markets: Record<string, MarketState>): MarketMood {
  const volatilities = Object.values(markets).map(m => m.volatilityScore);
  if (volatilities.length === 0) return 'calm';
  const avgVol = volatilities.reduce((a, b) => a + b, 0) / volatilities.length;

  if (avgVol > 0.8) return 'anomaly';
  if (avgVol > 0.6) return 'tempest';
  if (avgVol > 0.4) return 'volatile';
  if (avgVol > 0.2) return 'stirring';
  return 'calm';
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  markets: {},
  selectedSymbol: '1HZ100V',
  globalMood: 'calm',
  dataMode: 'connecting',

  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

  updateTick: (tick) => {
    set((state) => {
      const market = state.markets[tick.symbol];
      if (!market) {
        // First tick for a symbol — bootstrap a minimal market entry
        return {
          markets: {
            ...state.markets,
            [tick.symbol]: {
              symbol: tick.symbol,
              lastPrice: tick.quote,
              previousPrice: tick.quote,
              change: 0,
              changePercent: 0,
              high24h: tick.quote,
              low24h: tick.quote,
              trendScore: 0,
              volatilityScore: 0,
              recentCandles: [],
              recentTicks: [tick],
            },
          },
        };
      }

      const newTicks = [...market.recentTicks, tick].slice(-100);
      const change = tick.quote - market.previousPrice;
      const changePercent = market.previousPrice !== 0 ? (change / market.previousPrice) * 100 : 0;

      // Aggregate into 1-minute candles
      let newCandles = [...market.recentCandles];
      const lastCandle = newCandles[newCandles.length - 1];
      const currentEpoch = Math.floor(tick.epoch / 60) * 60;

      if (lastCandle && Math.floor(lastCandle.epoch / 60) * 60 === currentEpoch) {
        const updated = { ...lastCandle };
        updated.close = tick.quote;
        updated.high = Math.max(updated.high, tick.quote);
        updated.low = Math.min(updated.low, tick.quote);
        newCandles[newCandles.length - 1] = updated;
      } else {
        newCandles.push({
          open: tick.quote,
          high: tick.quote,
          low: tick.quote,
          close: tick.quote,
          epoch: currentEpoch,
        });
        if (newCandles.length > 200) newCandles = newCandles.slice(-200);
      }

      const updatedMarket: MarketState = {
        ...market,
        lastPrice: tick.quote,
        change,
        changePercent,
        high24h: Math.max(market.high24h, tick.quote),
        low24h: Math.min(market.low24h, tick.quote),
        trendScore: calculateTrend(newCandles),
        volatilityScore: calculateVolatility(newTicks),
        recentCandles: newCandles,
        recentTicks: newTicks,
      };

      const newMarkets = { ...state.markets, [tick.symbol]: updatedMarket };
      return {
        markets: newMarkets,
        globalMood: deriveGlobalMood(newMarkets),
      };
    });
  },

  getMarket: (symbol) => get().markets[symbol],

  startEngine: () => {
    const store = get();

    // Track data mode
    derivMarketService.onStatusChange((mode) => {
      set({ dataMode: mode });
    });

    // Subscribe to ticks for all assets
    for (const asset of ASSETS) {
      derivMarketService.subscribe(asset.symbol, (tick) => {
        store.updateTick(tick);
      });
    }

    // Start service (connects to Deriv or falls back to synthetic)
    derivMarketService.start().then(async () => {
      // Fetch historical candles for all assets
      const historyPromises = ASSETS.map(async (asset) => {
        try {
          const candles = await derivMarketService.fetchHistory(asset.symbol, 100);
          if (candles.length > 0) {
            const lastCandle = candles[candles.length - 1];
            const prevCandle = candles.length > 1 ? candles[candles.length - 2] : null;
            const change = prevCandle ? lastCandle.close - prevCandle.close : 0;

            set((state) => ({
              markets: {
                ...state.markets,
                [asset.symbol]: {
                  symbol: asset.symbol,
                  lastPrice: lastCandle.close,
                  previousPrice: prevCandle?.close ?? lastCandle.open,
                  change,
                  changePercent: prevCandle ? (change / prevCandle.close) * 100 : 0,
                  high24h: Math.max(...candles.map(c => c.high)),
                  low24h: Math.min(...candles.map(c => c.low)),
                  trendScore: calculateTrend(candles),
                  volatilityScore: 0,
                  recentCandles: candles,
                  recentTicks: state.markets[asset.symbol]?.recentTicks ?? [],
                },
              },
            }));
          }
        } catch (err) {
          console.warn(`[MarketStore] Failed to fetch history for ${asset.symbol}`, err);
        }
      });

      await Promise.allSettled(historyPromises);
    });
  },

  stopEngine: () => {
    derivMarketService.stop();
  },
}));

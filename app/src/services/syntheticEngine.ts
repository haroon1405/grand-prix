import { Tick, Candle } from '../types/market';
import { ASSETS } from '../data/assets';

type TickCallback = (tick: Tick) => void;

class SyntheticEngine {
  private prices: Map<string, number> = new Map();
  private listeners: Map<string, Set<TickCallback>> = new Map();
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private candleBuffers: Map<string, Tick[]> = new Map();
  private running = false;

  constructor() {
    for (const asset of ASSETS) {
      this.prices.set(asset.symbol, asset.basePrice);
      this.listeners.set(asset.symbol, new Set());
      this.candleBuffers.set(asset.symbol, []);
    }
  }

  start() {
    if (this.running) return;
    this.running = true;

    for (const asset of ASSETS) {
      const interval = setInterval(() => {
        this.generateTick(asset.symbol, asset.volatility);
      }, 500 + Math.random() * 500); // tick every 0.5-1s

      this.intervals.set(asset.symbol, interval);
    }
  }

  stop() {
    this.running = false;
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }

  subscribe(symbol: string, callback: TickCallback): () => void {
    const listeners = this.listeners.get(symbol);
    if (!listeners) return () => {};
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  getCurrentPrice(symbol: string): number {
    return this.prices.get(symbol) ?? 0;
  }

  generateHistoricalCandles(symbol: string, count: number, granularity: number = 60): Candle[] {
    const asset = ASSETS.find(a => a.symbol === symbol);
    if (!asset) return [];

    const candles: Candle[] = [];
    let price = asset.basePrice * (0.95 + Math.random() * 0.1);
    const now = Math.floor(Date.now() / 1000);

    for (let i = count; i > 0; i--) {
      const epoch = now - i * granularity;
      const volatilityFactor = asset.volatility * 0.002;
      const drift = (Math.random() - 0.5) * volatilityFactor * price;

      const open = price;
      const movements = Array.from({ length: 10 }, () =>
        price + (Math.random() - 0.5) * volatilityFactor * price * 2
      );
      const high = Math.max(open, ...movements);
      const low = Math.min(open, ...movements);
      const close = open + drift + (Math.random() - 0.5) * volatilityFactor * price;

      candles.push({
        open: +open.toFixed(2),
        high: +high.toFixed(2),
        low: +low.toFixed(2),
        close: +close.toFixed(2),
        epoch,
      });

      price = close;
    }

    this.prices.set(symbol, price);
    return candles;
  }

  private generateTick(symbol: string, volatility: number) {
    const currentPrice = this.prices.get(symbol) ?? 10000;
    const volatilityFactor = volatility * 0.0008;

    // Brownian motion with slight mean-reversion
    const baseAsset = ASSETS.find(a => a.symbol === symbol);
    const meanPrice = baseAsset?.basePrice ?? currentPrice;
    const meanReversion = (meanPrice - currentPrice) * 0.0001;

    const change = (Math.random() - 0.5) * 2 * volatilityFactor * currentPrice + meanReversion;
    const newPrice = +(currentPrice + change).toFixed(2);

    this.prices.set(symbol, newPrice);

    const spread = newPrice * 0.0001;
    const tick: Tick = {
      symbol,
      quote: newPrice,
      bid: +(newPrice - spread).toFixed(2),
      ask: +(newPrice + spread).toFixed(2),
      epoch: Math.floor(Date.now() / 1000),
    };

    // Buffer for candle generation
    const buffer = this.candleBuffers.get(symbol);
    if (buffer) {
      buffer.push(tick);
      if (buffer.length > 200) buffer.shift();
    }

    // Notify listeners
    const listeners = this.listeners.get(symbol);
    if (listeners) {
      for (const cb of listeners) {
        cb(tick);
      }
    }
  }

  getRecentTicks(symbol: string, count: number = 50): Tick[] {
    const buffer = this.candleBuffers.get(symbol) ?? [];
    return buffer.slice(-count);
  }
}

export const syntheticEngine = new SyntheticEngine();

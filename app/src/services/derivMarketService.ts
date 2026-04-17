/**
 * High-level Deriv market data service.
 * Uses derivClient for transport, maps responses to app types.
 * Falls back to syntheticEngine if WS connection fails.
 */

import { derivClient } from './derivClient';
import { syntheticEngine } from './syntheticEngine';
import { ASSETS } from '../data/assets';
import type { Tick, Candle } from '../types/market';

type TickCallback = (tick: Tick) => void;
type StatusCallback = (status: 'live' | 'synthetic' | 'connecting') => void;

class DerivMarketService {
  private tickListeners = new Map<string, Set<TickCallback>>();
  private unsubscribers: (() => void)[] = [];
  private mode: 'live' | 'synthetic' | 'connecting' = 'connecting';
  private statusListeners = new Set<StatusCallback>();
  private running = false;

  get dataMode() {
    return this.mode;
  }

  onStatusChange(cb: StatusCallback): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private setMode(mode: 'live' | 'synthetic' | 'connecting') {
    this.mode = mode;
    for (const cb of this.statusListeners) cb(mode);
  }

  /**
   * Start the service. Tries Deriv WS first, falls back to synthetic.
   */
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.setMode('connecting');

    // Initialize tick listener sets
    for (const asset of ASSETS) {
      if (!this.tickListeners.has(asset.symbol)) {
        this.tickListeners.set(asset.symbol, new Set());
      }
    }

    try {
      await derivClient.connect();
      this.setMode('live');
      this.subscribeAllLive();
    } catch {
      console.warn('[DerivMarketService] WS connection failed, falling back to synthetic');
      this.startSyntheticFallback();
    }

    // Listen for disconnects to auto-fallback
    derivClient.onStatusChange((status) => {
      if (status === 'disconnected' || status === 'error') {
        if (this.mode === 'live') {
          console.warn('[DerivMarketService] Lost connection, switching to synthetic');
          this.startSyntheticFallback();
        }
      } else if (status === 'connected' && this.mode === 'synthetic') {
        console.info('[DerivMarketService] Reconnected, switching back to live');
        syntheticEngine.stop();
        this.setMode('live');
        this.subscribeAllLive();
      }
    });
  }

  stop() {
    this.running = false;
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
    derivClient.disconnect();
    syntheticEngine.stop();
  }

  /**
   * Subscribe to tick updates for a symbol.
   */
  subscribe(symbol: string, callback: TickCallback): () => void {
    let listeners = this.tickListeners.get(symbol);
    if (!listeners) {
      listeners = new Set();
      this.tickListeners.set(symbol, listeners);
    }
    listeners.add(callback);
    return () => listeners!.delete(callback);
  }

  /**
   * Fetch historical candles for a symbol.
   * Uses Deriv ticks_history if live, otherwise synthetic.
   */
  async fetchHistory(symbol: string, count: number = 100): Promise<Candle[]> {
    if (this.mode === 'live') {
      try {
        return await this.fetchDerivHistory(symbol, count);
      } catch (err) {
        console.warn(`[DerivMarketService] History fetch failed for ${symbol}, using synthetic`, err);
        return syntheticEngine.generateHistoricalCandles(symbol, count);
      }
    }
    return syntheticEngine.generateHistoricalCandles(symbol, count);
  }

  private subscribeAllLive() {
    // Clear any old subscriptions
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];

    for (const asset of ASSETS) {
      const unsub = derivClient.subscribeTicks(asset.symbol, (data) => {
        const tick = this.mapDerivTick(data);
        if (tick) {
          this.emitTick(tick);
        }
      });
      this.unsubscribers.push(unsub);
    }
  }

  private startSyntheticFallback() {
    this.setMode('synthetic');
    syntheticEngine.start();

    for (const asset of ASSETS) {
      syntheticEngine.subscribe(asset.symbol, (tick) => {
        this.emitTick(tick);
      });
    }
  }

  private emitTick(tick: Tick) {
    const listeners = this.tickListeners.get(tick.symbol);
    if (listeners) {
      for (const cb of listeners) cb(tick);
    }
  }

  /**
   * Map raw Deriv tick WS message to our Tick type.
   */
  private mapDerivTick(data: any): Tick | null {
    const t = data?.tick;
    if (!t) return null;

    return {
      symbol: t.symbol,
      quote: Number(t.quote),
      bid: Number(t.bid ?? t.quote),
      ask: Number(t.ask ?? t.quote),
      epoch: Number(t.epoch),
    };
  }

  /**
   * Fetch historical ticks from Deriv and convert to candles.
   */
  private async fetchDerivHistory(symbol: string, count: number): Promise<Candle[]> {
    // Try candle-style first (OHLC)
    try {
      const resp = await derivClient.send({
        ticks_history: symbol,
        count,
        end: 'latest',
        style: 'candles',
        granularity: 60,
      });

      if (resp.candles && Array.isArray(resp.candles)) {
        return resp.candles.map((c: any) => ({
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          epoch: Number(c.epoch),
        }));
      }
    } catch {
      // candles style might not be supported for all symbols, try ticks
    }

    // Fallback: fetch raw ticks and aggregate into 1-minute candles
    const resp = await derivClient.send({
      ticks_history: symbol,
      count: count * 5, // more ticks to build candles from
      end: 'latest',
      style: 'ticks',
    });

    if (resp.history?.prices && resp.history?.times) {
      const prices: number[] = resp.history.prices.map(Number);
      const times: number[] = resp.history.times.map(Number);
      return this.aggregateTicksToCandles(prices, times);
    }

    return [];
  }

  /**
   * Aggregate raw tick prices+times into 1-minute OHLC candles.
   */
  private aggregateTicksToCandles(prices: number[], times: number[]): Candle[] {
    if (prices.length === 0) return [];

    const candles: Candle[] = [];
    let currentMinute = Math.floor(times[0] / 60) * 60;
    let open = prices[0];
    let high = prices[0];
    let low = prices[0];
    let close = prices[0];

    for (let i = 0; i < prices.length; i++) {
      const minute = Math.floor(times[i] / 60) * 60;

      if (minute !== currentMinute) {
        candles.push({ open, high, low, close, epoch: currentMinute });
        currentMinute = minute;
        open = prices[i];
        high = prices[i];
        low = prices[i];
      }

      close = prices[i];
      high = Math.max(high, prices[i]);
      low = Math.min(low, prices[i]);
    }

    // Push last candle
    candles.push({ open, high, low, close, epoch: currentMinute });

    return candles;
  }
}

export const derivMarketService = new DerivMarketService();

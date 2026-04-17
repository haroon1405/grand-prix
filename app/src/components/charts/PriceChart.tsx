import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { useMarketStore } from '../../store/marketStore';
import type { Candle } from '../../types/market';

interface PriceChartProps {
  symbol: string;
  height?: number;
}

function candleToChartData(candle: Candle): CandlestickData<Time> {
  return {
    time: candle.epoch as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  };
}

export function PriceChart({ symbol, height }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const market = useMarketStore((s) => s.markets[symbol]);

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    const resolvedHeight = height ?? wrapperRef.current.clientHeight;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: resolvedHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#a89f8f',
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(74, 74, 90, 0.15)' },
        horzLines: { color: 'rgba(74, 74, 90, 0.15)' },
      },
      crosshair: {
        vertLine: { color: 'rgba(201, 169, 89, 0.3)', labelBackgroundColor: '#232340' },
        horzLine: { color: 'rgba(201, 169, 89, 0.3)', labelBackgroundColor: '#232340' },
      },
      timeScale: {
        borderColor: 'rgba(74, 74, 90, 0.3)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(74, 74, 90, 0.3)',
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#0d9488',
      downColor: '#c41e3a',
      borderUpColor: '#0d9488',
      borderDownColor: '#c41e3a',
      wickUpColor: '#0d948880',
      wickDownColor: '#c41e3a80',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (wrapperRef.current && containerRef.current) {
        const newHeight = height ?? wrapperRef.current.clientHeight;
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: newHeight,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(wrapperRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  // Update data when symbol changes
  useEffect(() => {
    if (!seriesRef.current || !market?.recentCandles) return;
    const data = market.recentCandles.map(candleToChartData);
    seriesRef.current.setData(data);
  }, [market?.recentCandles?.length, symbol]);

  // Live tick updates
  useEffect(() => {
    if (!seriesRef.current || !market?.recentCandles) return;
    const lastCandle = market.recentCandles[market.recentCandles.length - 1];
    if (lastCandle) {
      seriesRef.current.update(candleToChartData(lastCandle));
    }
  }, [market?.lastPrice]);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full rounded-lg overflow-hidden border border-ash/20 bg-void/50"
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

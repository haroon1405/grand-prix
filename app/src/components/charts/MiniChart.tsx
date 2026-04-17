import { useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import type { IChartApi, Time } from 'lightweight-charts';
import { useMarketStore } from '../../store/marketStore';

interface MiniChartProps {
  symbol: string;
  width?: number;
  height?: number;
}

export function MiniChart({ symbol, width = 120, height = 40 }: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const market = useMarketStore((s) => s.markets[symbol]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    const isPositive = market && market.change >= 0;
    const series = chart.addSeries(AreaSeries, {
      lineColor: isPositive ? '#0d9488' : '#c41e3a',
      topColor: isPositive ? 'rgba(13, 148, 136, 0.15)' : 'rgba(196, 30, 58, 0.15)',
      bottomColor: 'transparent',
      lineWidth: 1,
      crosshairMarkerVisible: false,
    });

    if (market?.recentCandles) {
      const data = market.recentCandles.slice(-30).map(c => ({
        time: c.epoch as Time,
        value: c.close,
      }));
      series.setData(data);
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [symbol, market?.recentCandles?.length]);

  return <div ref={containerRef} className="opacity-80" />;
}

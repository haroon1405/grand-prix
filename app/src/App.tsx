import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { TickerRibbon } from './components/trading/TickerRibbon';
import { Dashboard } from './pages/Dashboard';
import { Trading } from './pages/Trading';
import { Portfolio } from './pages/Portfolio';
import { Bestiary } from './pages/Bestiary';
import { Chronicles } from './pages/Chronicles';
import { useMarketStore } from './store/marketStore';
import { useTradingStore } from './store/tradingStore';
import { useUIStore } from './store/uiStore';

function PageRouter() {
  const currentPage = useUIStore((s) => s.currentPage);

  switch (currentPage) {
    case 'continent': return <Dashboard />;
    case 'expedition': return <Trading />;
    case 'camp': return <Portfolio />;
    case 'bestiary': return <Bestiary />;
    case 'chronicles': return <Chronicles />;
    default: return <Dashboard />;
  }
}

function App() {
  const startEngine = useMarketStore((s) => s.startEngine);
  const stopEngine = useMarketStore((s) => s.stopEngine);
  const markets = useMarketStore((s) => s.markets);
  const updatePositions = useTradingStore((s) => s.updatePositions);

  // Start synthetic data engine
  useEffect(() => {
    startEngine();
    return () => stopEngine();
  }, []);

  // Update position P&L with live prices
  useEffect(() => {
    const prices: Record<string, number> = {};
    for (const [symbol, market] of Object.entries(markets)) {
      prices[symbol] = market.lastPrice;
    }
    updatePositions(prices);
  }, [markets]);

  return (
    <Layout>
      <TickerRibbon />
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4">
        <PageRouter />
      </div>
    </Layout>
  );
}

export default App;

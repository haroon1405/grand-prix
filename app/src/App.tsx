import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Battle } from './pages/Battle';
import { Portfolio } from './pages/Portfolio';
import { Bestiary } from './pages/Bestiary';
import { Chronicles } from './pages/Chronicles';
import { useMarketStore } from './store/marketStore';
import { useTradingStore } from './store/tradingStore';
import { useUIStore } from './store/uiStore';
import { sfx } from './lib/sounds';

function PageRouter() {
  const currentPage = useUIStore((s) => s.currentPage);

  switch (currentPage) {
    case 'continent': return <Dashboard />;
    case 'battle': return <Battle />;
    case 'camp': return <Portfolio />;
    case 'bestiary': return <Bestiary />;
    case 'chronicles': return <Chronicles />;
    default: return <Dashboard />;
  }
}

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const startEngine = useMarketStore((s) => s.startEngine);
  const stopEngine = useMarketStore((s) => s.stopEngine);
  const markets = useMarketStore((s) => s.markets);
  const updatePositions = useTradingStore((s) => s.updatePositions);

  useEffect(() => {
    startEngine();
    sfx.prime();
    return () => stopEngine();
  }, []);

  useEffect(() => {
    const prices: Record<string, number> = {};
    for (const [symbol, market] of Object.entries(markets)) {
      prices[symbol] = market.lastPrice;
    }
    updatePositions(prices);
  }, [markets]);

  return (
    <>
      <AnimatePresence>
        {showLanding && (
          <motion.div
            key="landing"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            <Landing onStart={() => setShowLanding(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showLanding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-screen w-screen"
        >
          <Layout>
            <PageRouter />
          </Layout>
        </motion.div>
      )}
    </>
  );
}

export default App;

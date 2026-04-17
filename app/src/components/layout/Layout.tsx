import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ContextPanel } from './ContextPanel';
import { TickerRibbon } from '../trading/TickerRibbon';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(196, 164, 109, 0.04) 0%, transparent 65%), linear-gradient(to bottom, #050608, #080b12)' }}
    >
      {/* Decorative corner brackets */}
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      {/* 3-column grid */}
      <div className="app-container">
        {/* Header — spans all 3 columns */}
        <Header />

        {/* Left sidebar — navigation + team */}
        <Sidebar />

        {/* Main content area */}
        <main
          className="min-h-0 overflow-y-auto overflow-x-hidden"
          style={{
            background: 'rgba(0,0,0,0.15)',
            borderLeft: '1px solid rgba(196,164,109,0.08)',
            borderRight: '1px solid rgba(196,164,109,0.08)',
          }}
        >
          <div className="p-4 min-h-full">
            {children}
          </div>
        </main>

        {/* Right context panel */}
        <ContextPanel />

        {/* Footer — spans all 3 columns */}
        <footer
          className="col-span-3"
          style={{ borderTop: '1px solid rgba(196,164,109,0.12)' }}
        >
          <TickerRibbon />
        </footer>
      </div>
    </div>
  );
}

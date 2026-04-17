import { Region } from '../types/game';
import { MarketMood } from '../types/market';

export const REGIONS: Region[] = [
  {
    id: 'pale_exchange',
    name: 'The Pale Exchange',
    description: 'Where new expeditioners learn the language of numbers. Low volatility, clear trends.',
    assets: ['R_10', 'R_25', '1HZ10V', '1HZ25V'],
    difficulty: 1,
    moodBase: 'calm',
    colorAccent: '#7c9bb5',
  },
  {
    id: 'orchard_futures',
    name: 'Orchard of Futures',
    description: 'Delayed effects ripen here. Predictions are tested by time.',
    assets: ['R_50', '1HZ50V'],
    difficulty: 2,
    moodBase: 'stirring',
    colorAccent: '#c9a959',
  },
  {
    id: 'cathedral_leverage',
    name: 'Cathedral of Leverage',
    description: 'High risk echoes off vaulted ceilings. Fortunes are made and lost in moments.',
    assets: ['R_75', '1HZ75V', 'BOOM500', 'BOOM1000'],
    difficulty: 3,
    moodBase: 'volatile',
    colorAccent: '#c45e3a',
  },
  {
    id: 'river_slippage',
    name: 'River of Slippage',
    description: 'Nothing executes as expected here. The river shifts beneath every step.',
    assets: [],
    difficulty: 3,
    moodBase: 'volatile',
    colorAccent: '#6366f1',
  },
  {
    id: 'gallery_erased',
    name: 'Gallery of Erased Names',
    description: 'Where failed expeditions are remembered. Gommage events are frequent.',
    assets: ['CRASH500', 'CRASH1000'],
    difficulty: 4,
    moodBase: 'tempest',
    colorAccent: '#dc2626',
  },
  {
    id: 'black_index',
    name: 'The Black Index',
    description: 'The endgame. Synthetic instability at its peak. Only the worthy trade here.',
    assets: ['R_100', '1HZ100V'],
    difficulty: 5,
    moodBase: 'anomaly',
    colorAccent: '#c41e3a',
  },
];

export const MOOD_DESCRIPTIONS: Record<MarketMood, { title: string; description: string; ambiance: string }> = {
  calm: {
    title: 'The Market Breathes',
    description: 'Stillness pervades the exchange. Trends whisper softly.',
    ambiance: 'A gentle fog hangs over the charts. The ink flows steadily.',
  },
  stirring: {
    title: 'The Ink Stirs',
    description: 'Movement builds beneath the surface. Something approaches.',
    ambiance: 'Candlelight flickers. The Monolith hums a low note.',
  },
  volatile: {
    title: 'The Nevrons Awaken',
    description: 'Violent price action tears through the veil. Trade with discipline.',
    ambiance: 'Storm clouds gather over the Continent. The ink runs wild.',
  },
  tempest: {
    title: 'The Gommage Approaches',
    description: 'Maximum chaos. The Paintress extends her brush toward the ledger.',
    ambiance: 'Lightning fractures the charts. Numbers flicker and vanish. Hold fast.',
  },
  anomaly: {
    title: 'Anomaly Detected',
    description: 'Something unprecedented stirs in the data. The Curator watches.',
    ambiance: 'Reality bends. The chart paints itself. Trust nothing.',
  },
};

export const TRADE_FLAVOR_TEXT = {
  STRIKE_UP: {
    action: 'You read the momentum and commit upward.',
    success: 'The market answers your conviction. Capital flows.',
    fail: 'The market rejects your thesis. The Nevron bites back.',
  },
  STRIKE_DOWN: {
    action: 'You sense the descent and strike downward.',
    success: 'Gravity favors the disciplined. The fall yields profit.',
    fail: 'The reversal catches you. Exposure burns.',
  },
  close: {
    profit: 'You extract your gains. The expedition grows stronger.',
    loss: 'A wound, but not a fatal one. Discipline preserved.',
    breakeven: 'Neither victory nor defeat. The market grants passage.',
  },
};

export const LOADING_QUOTES = [
  '"The market did not roar. It inhaled." — The Steward',
  '"Every tick is a breath. Every chart is a prophecy." — Lune',
  '"Not yet. Let it declare itself." — Gustave',
  '"I have faced the Tempest and returned. Most who try are erased." — Verso',
  '"The harvest comes to those who wait. So does ruin." — Sciel',
  '"Don\'t wait for the perfect moment. Create it." — Maelle',
  '"Why be one thing when the market demands everything?" — Monoco',
  '"The Paintress does not hurry. Neither should you."',
  '"Expedition 33 is the last. Make every trade matter."',
  '"The Monolith speaks in numbers. Learn its language or perish."',
];

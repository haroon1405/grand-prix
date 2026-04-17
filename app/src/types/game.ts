export interface Character {
  id: string;
  name: string;
  title: string;
  role: string;
  description: string;
  weapon: string;
  color: string;
  accentColor: string;
  stats: CharacterStats;
  abilities: string[];
  loreQuote: string;
}

export interface CharacterStats {
  precision: number; // affects timing bonus
  might: number; // affects damage/profit multiplier
  agility: number; // affects trade speed
  defense: number; // affects stop-loss effectiveness
  luck: number; // affects critical trades
}

export type RegionId = 'pale_exchange' | 'orchard_futures' | 'cathedral_leverage' | 'river_slippage' | 'gallery_erased' | 'black_index';

export interface Region {
  id: RegionId;
  name: string;
  description: string;
  assets: string[];
  difficulty: number;
  moodBase: string;
  colorAccent: string;
}

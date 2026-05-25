// All 18 Pokemon types
export type PokemonTypeName =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass'
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'dark' | 'steel' | 'fairy';

// Raw PokeAPI response shapes
export interface PokeAPIStat {
  base_stat: number;
  stat: { name: string; url: string };
}

export interface PokeAPIType {
  slot: number;
  type: { name: PokemonTypeName; url: string };
}

export interface PokeAPISprites {
  front_default: string | null;
  front_shiny: string | null;
}

export interface PokeAPIResponse {
  id: number;
  name: string;
  sprites: PokeAPISprites;
  stats: PokeAPIStat[];
  types: PokeAPIType[];
}

// Normalized app-internal shape
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  defaultSprite: string | null;
  shinySprite: string | null;
  types: PokemonTypeName[];
  stats: PokemonStats;
}

// Team: exactly 6 slots enforced at compile time
export type TeamSlot = Pokemon | null;
export type Team = [TeamSlot, TeamSlot, TeamSlot, TeamSlot, TeamSlot, TeamSlot];

// Team analysis output
export interface TeamAnalysis {
  offensiveCoverage: Record<PokemonTypeName, number>;  // max effectiveness your team can hit each defending type
  defensiveExposure: Record<PokemonTypeName, number>;  // avg multiplier your team receives from each attacking type
}

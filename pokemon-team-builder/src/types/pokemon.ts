export type PokemonTypeName =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass'
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'dark' | 'steel' | 'fairy';

/** Slim creature loaded in bulk for the dex grid */
export interface SlimCreature {
  id: number;
  name: string;
  types: PokemonTypeName[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  bst: number;
  height: number;
  weight: number;
  abilities: { name: string; hidden: boolean }[];
  moveCount: number;
  speciesUrl: string;
}

/** Evolution chain node */
export interface EvoNode {
  name: string;
  id: number | null;
  trigger: string | null;
  depth: number;
}

/** A meaningful alternate form (regional variant or Mega Evolution) */
export interface PokemonFormVariant {
  name: string;        // API name: "rattata-alola", "charizard-mega-x"
  displayName: string; // Human-readable: "Alolan Form", "Mega X"
  isDefault: boolean;
}

/** Species data fetched on the detail page */
export interface SpeciesData {
  captureRate: number | null;
  flavorText: string;
  evolutionChainUrl: string | null;
  eggGroups: string[];
  variants: PokemonFormVariant[]; // regional + mega forms only
}

/** Move data for the move pool preview */
export interface MoveEntry {
  name: string;
  url: string;
  lvl: number;
  type?: string;
  power?: number | null;
  accuracy?: number | null;
  pp?: number | null;
  klass?: string;
}

// Raw PokeAPI shapes used in lib/pokeapi.ts
export interface PokeAPIStat {
  base_stat: number;
  stat: { name: string };
}
export interface PokeAPIType {
  slot: number;
  type: { name: string };
}
export interface PokeAPIAbility {
  ability: { name: string; url: string };
  is_hidden: boolean;
}
export interface PokeAPIMove {
  move: { name: string; url: string };
  version_group_details: { level_learned_at: number; move_learn_method: { name: string } }[];
}
export interface PokeAPIResponse {
  id: number;
  name: string;
  sprites: { front_default: string | null; front_shiny: string | null };
  stats: PokeAPIStat[];
  types: PokeAPIType[];
  abilities: PokeAPIAbility[];
  moves: PokeAPIMove[];
  height: number;
  weight: number;
  species: { url: string };
}

// Team: 6 slots stored as IDs, resolved against dex store
export type TeamSlot = SlimCreature | null;
export type Team = [TeamSlot, TeamSlot, TeamSlot, TeamSlot, TeamSlot, TeamSlot];


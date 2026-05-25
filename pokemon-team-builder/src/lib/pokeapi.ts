import type { Pokemon, PokeAPIResponse, PokemonStats, PokemonTypeName } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

/** Maps PokeAPI stat names to our internal PokemonStats keys */
function mapStats(apiStats: PokeAPIResponse['stats']): PokemonStats {
  const result: Partial<PokemonStats> = {};
  for (const entry of apiStats) {
    switch (entry.stat.name) {
      case 'hp':              result.hp = entry.base_stat; break;
      case 'attack':         result.attack = entry.base_stat; break;
      case 'defense':        result.defense = entry.base_stat; break;
      case 'special-attack': result.specialAttack = entry.base_stat; break;
      case 'special-defense':result.specialDefense = entry.base_stat; break;
      case 'speed':          result.speed = entry.base_stat; break;
    }
  }
  return result as PokemonStats;
}

/** Fetches a single Pokemon from PokeAPI and normalizes it to our Pokemon shape */
export async function fetchPokemon(nameOrId: string | number): Promise<Pokemon> {
  const query = typeof nameOrId === 'string' ? nameOrId.toLowerCase().trim() : nameOrId;
  const res = await fetch(`${BASE_URL}/pokemon/${query}`);

  if (!res.ok) {
    if (res.status === 404) throw new Error(`Pokemon "${nameOrId}" not found.`);
    throw new Error(`PokeAPI error: ${res.status} ${res.statusText}`);
  }

  const data: PokeAPIResponse = await res.json();

  return {
    id: data.id,
    name: data.name,
    defaultSprite: data.sprites.front_default,
    shinySprite: data.sprites.front_shiny,
    types: data.types
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name as PokemonTypeName),
    stats: mapStats(data.stats),
  };
}

/** Total number of Pokemon in PokeAPI (Gen 1–9) */
export const TOTAL_POKEMON = 1025;

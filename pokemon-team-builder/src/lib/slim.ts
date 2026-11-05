import type { SlimCreature, PokeAPIResponse } from '../types/pokemon';

// Kept free of runtime imports so `scripts/build-dex-snapshot.ts` can run it directly under Node.

/** Reduces a full `/pokemon/<id>` response to the summary the dex grid and team builder use. */
export function slimFromFull(p: PokeAPIResponse): SlimCreature {
  const stats: SlimCreature['stats'] = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
  for (const s of p.stats) {
    switch (s.stat.name) {
      case 'hp':               stats.hp = s.base_stat; break;
      case 'attack':           stats.attack = s.base_stat; break;
      case 'defense':          stats.defense = s.base_stat; break;
      case 'special-attack':   stats.specialAttack = s.base_stat; break;
      case 'special-defense':  stats.specialDefense = s.base_stat; break;
      case 'speed':            stats.speed = s.base_stat; break;
    }
  }
  return {
    id: p.id,
    name: p.name,
    types: p.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name as SlimCreature['types'][number]),
    stats,
    bst: Object.values(stats).reduce((a, b) => a + b, 0),
    height: p.height,
    weight: p.weight,
    abilities: p.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    moveCount: p.moves.length,
    speciesUrl: p.species.url,
  };
}

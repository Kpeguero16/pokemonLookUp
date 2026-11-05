// Writes public/dex.json: the slim summary of every base creature, which the app boots from.
// Run with `npm run dex:snapshot` (Node 22.18+ runs this TypeScript file directly).
// Re-run it when PokeAPI adds creatures or when `slimFromFull` changes shape.
import { writeFileSync } from 'node:fs';
import { slimFromFull } from '../src/lib/slim.ts';
import type { PokeAPIResponse, SlimCreature } from '../src/types/pokemon.ts';

const TOTAL = 1025; // keep in sync with TOTAL_POKEMON in src/lib/pokeapi.ts
const CONCURRENCY = 16;
const OUT = new URL('../public/dex.json', import.meta.url);

async function fetchCreature(id: number): Promise<SlimCreature> {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return slimFromFull((await r.json()) as PokeAPIResponse);
    } catch (e) {
      if (attempt >= 3) throw new Error(`creature ${id}: ${e}`);
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
}

const creatures: SlimCreature[] = new Array(TOTAL);
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < TOTAL) {
      const i = next++;
      creatures[i] = await fetchCreature(i + 1);
    }
  }),
);

writeFileSync(OUT, JSON.stringify(creatures));
console.log(`wrote ${creatures.length} creatures to ${OUT.pathname}`);

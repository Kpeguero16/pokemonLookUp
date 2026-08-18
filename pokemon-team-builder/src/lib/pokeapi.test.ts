import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const CACHE_PREFIX = 'dexmeta:v5:';
const STALE_PREFIX = 'dexmeta:v4:';

function rawPokemon(id: number, name: string) {
  return {
    id,
    name,
    sprites: { front_default: null, front_shiny: null },
    stats: [
      { base_stat: 78, stat: { name: 'hp' } },
      { base_stat: 84, stat: { name: 'attack' } },
      { base_stat: 78, stat: { name: 'defense' } },
      { base_stat: 109, stat: { name: 'special-attack' } },
      { base_stat: 85, stat: { name: 'special-defense' } },
      { base_stat: 100, stat: { name: 'speed' } },
    ],
    types: [{ slot: 1, type: { name: 'fire' } }],
    abilities: [{ ability: { name: 'blaze', url: '' }, is_hidden: false }],
    moves: [
      {
        move: { name: 'flamethrower', url: '' },
        version_group_details: [
          { level_learned_at: 36, move_learn_method: { name: 'level-up' } },
        ],
      },
    ],
    height: 17,
    weight: 905,
    species: { url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
  };
}

function mockFetchOnce(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => body };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('fetchSlimCreature caching', () => {
  it('caches only the derived summary, not the full raw response', async () => {
    const { fetchSlimCreature } = await import('./pokeapi');
    const raw = rawPokemon(6, 'charizard');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchOnce(raw)));

    await fetchSlimCreature(6);

    const cached = localStorage.getItem(`${CACHE_PREFIX}/pokemon/6`);
    expect(cached).not.toBeNull();
    const parsed = JSON.parse(cached!);
    // Trimmed shape: no raw `moves`/`sprites`, but the resolved summary fields are present.
    expect(parsed.moves).toBeUndefined();
    expect(parsed.sprites).toBeUndefined();
    expect(parsed.bst).toBe(78 + 84 + 78 + 109 + 85 + 100);
    expect(parsed.types).toEqual(['fire']);

    // Cached payload should be far smaller than the raw response would have been.
    expect(cached!.length).toBeLessThan(JSON.stringify(raw).length);
  });

  it('a cache hit on the summary key does not break callers that need the raw moves list', async () => {
    const { fetchSlimCreature, fetchLevelUpMoves } = await import('./pokeapi');
    const raw = rawPokemon(6, 'charizard');
    const fetchMock = vi.fn().mockResolvedValue(mockFetchOnce(raw));
    vi.stubGlobal('fetch', fetchMock);

    // Warm the summary cache first (as happens during Dex boot).
    await fetchSlimCreature(6);

    // Move detail lookups for the same Pokémon must still see the full moves list,
    // not the cached summary (which has no `.moves`).
    const moveDetailFetch = vi.fn().mockResolvedValue(
      mockFetchOnce({
        type: { name: 'fire' },
        power: 90,
        accuracy: 100,
        pp: 15,
        damage_class: { name: 'special' },
      })
    );
    vi.stubGlobal('fetch', (url: string) =>
      url.includes('/move/') ? moveDetailFetch() : fetchMock()
    );

    const moves = await fetchLevelUpMoves(6);
    expect(moves).toEqual([
      expect.objectContaining({ name: 'flamethrower', lvl: 36, type: 'fire' }),
    ]);
  });
});

describe('cache-prefix eviction', () => {
  it('purges stale-prefix entries and succeeds once a v5 write hits quota pressure', async () => {
    localStorage.setItem(`${STALE_PREFIX}/pokemon/999`, JSON.stringify({ bloat: 'x'.repeat(100) }));

    let shouldThrow = true;
    const realSetItem = Storage.prototype.setItem.bind(localStorage);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      if (shouldThrow) {
        shouldThrow = false; // only the first write (before eviction) fails
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      }
      realSetItem(key, value);
    });

    const { fetchSlimCreature } = await import('./pokeapi');
    const raw = rawPokemon(6, 'charizard');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchOnce(raw)));

    await fetchSlimCreature(6);

    expect(localStorage.getItem(`${STALE_PREFIX}/pokemon/999`)).toBeNull();
    expect(localStorage.getItem(`${CACHE_PREFIX}/pokemon/6`)).not.toBeNull();
  });
});

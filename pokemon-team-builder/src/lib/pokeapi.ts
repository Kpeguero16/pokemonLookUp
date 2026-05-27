import type { SlimCreature, PokeAPIResponse, SpeciesData, EvoNode, MoveEntry, PokemonFormVariant } from '../types/pokemon';
import { concurrentMap } from '../utils/concurrentMap';

const BASE = 'https://pokeapi.co/api/v2';
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const CACHE_PREFIX = 'dexmeta:v4:';
const FETCH_TIMEOUT_MS = 10_000;

// ── LocalStorage cache ──────────────────────────────────────────────────────

function cacheGet<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(CACHE_PREFIX + key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

function cacheSet(key: string, val: unknown): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(val));
  } catch {
    // Quota exceeded — flush old cache entries
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith('dexmeta:v') && !k.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(val));
    } catch { /* ignore */ }
  }
}

const inflight: Partial<Record<string, Promise<unknown>>> = {};

async function fetchJSON<T>(url: string): Promise<T> {
  const key = url.replace(BASE, '');
  const cached = cacheGet<T>(key);
  if (cached) return cached;
  if (inflight[key]) return inflight[key] as Promise<T>;
  inflight[key] = (async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      cacheSet(key, j);
      return j;
    } finally {
      clearTimeout(timer);
      delete inflight[key];
    }
  })();
  return inflight[key] as Promise<T>;
}

// ── Sprite URLs ─────────────────────────────────────────────────────────────

export function spriteOfficial(id: number): string {
  return `${SPRITE_BASE}/other/official-artwork/${id}.png`;
}
export function spritePixel(id: number): string {
  return `${SPRITE_BASE}/${id}.png`;
}

// ── Creature fetching ────────────────────────────────────────────────────────

function slimFromFull(p: PokeAPIResponse): SlimCreature {
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

export async function fetchSlimCreature(idOrName: string | number): Promise<SlimCreature> {
  const data = await fetchJSON<PokeAPIResponse>(`${BASE}/pokemon/${idOrName}`);
  return slimFromFull(data);
}

/** Bulk-fetch creatures with parallelism and progress callback */
export async function fetchCreaturesRange(
  ids: number[],
  onProgress?: (done: number, total: number) => void
): Promise<SlimCreature[]> {
  const results = await concurrentMap(
    ids,
    (id) => fetchSlimCreature(id),
    16,
    onProgress
  );
  return results.filter(Boolean) as SlimCreature[];
}

// ── Species & Evolution ──────────────────────────────────────────────────────

/** Only keep variants with meaningful gameplay differences (regional / mega). */
const MEANINGFUL_FORM_RE = /-(alola|galar|hisui|paldea|mega)/;

const FORM_SUFFIX_LABELS: Record<string, string> = {
  'alola':  'Alolan Form',
  'galar':  'Galarian Form',
  'hisui':  'Hisuian Form',
  'paldea': 'Paldean Form',
  'mega':   'Mega',
  'mega-x': 'Mega X',
  'mega-y': 'Mega Y',
};

export function getFormDisplayName(speciesName: string, formApiName: string): string {
  const suffix = formApiName.startsWith(`${speciesName}-`)
    ? formApiName.slice(speciesName.length + 1)
    : formApiName;
  return (
    FORM_SUFFIX_LABELS[suffix] ??
    suffix.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  );
}

export async function fetchSpecies(url: string): Promise<SpeciesData> {
  const data = await fetchJSON<{
    name: string;
    capture_rate: number;
    flavor_text_entries: { flavor_text: string; language: { name: string } }[];
    evolution_chain?: { url: string };
    egg_groups: { name: string }[];
    varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
  }>(url);

  const entry = data.flavor_text_entries.find((e) => e.language.name === 'en');

  const variants: PokemonFormVariant[] = (data.varieties ?? [])
    .filter((v) => !v.is_default && MEANINGFUL_FORM_RE.test(v.pokemon.name))
    .map((v) => ({
      name: v.pokemon.name,
      displayName: getFormDisplayName(data.name, v.pokemon.name),
      isDefault: false,
    }));

  return {
    captureRate: data.capture_rate ?? null,
    flavorText: entry ? entry.flavor_text.replace(/[\f\n\r]/g, ' ') : '',
    evolutionChainUrl: data.evolution_chain?.url ?? null,
    eggGroups: data.egg_groups?.map((g) => g.name.replace(/-/g, ' ')) ?? [],
    variants,
  };
}

interface PokeAPIEvoNode {
  species: { name: string; url: string };
  evolution_details: {
    min_level?: number;
    item?: { name: string };
    trigger?: { name: string };
  }[];
  evolves_to: PokeAPIEvoNode[];
}

export async function fetchEvolutionChain(url: string): Promise<EvoNode[]> {
  const data = await fetchJSON<{ chain: PokeAPIEvoNode }>(url);
  const nodes: EvoNode[] = [];

  function walk(node: PokeAPIEvoNode, depth: number, trigger: string | null) {
    const urlParts = node.species.url.split('/').filter(Boolean);
    const id = parseInt(urlParts[urlParts.length - 1], 10);
    nodes.push({ name: node.species.name, id: isNaN(id) ? null : id, trigger, depth });
    for (const next of node.evolves_to) {
      const d = next.evolution_details?.[0] ?? {};
      let trig = '→';
      if (d.min_level) trig = `Lv ${d.min_level}`;
      else if (d.item) trig = d.item.name.replace(/-/g, ' ');
      else if (d.trigger) trig = d.trigger.name.replace(/-/g, ' ');
      walk(next, depth + 1, trig);
    }
  }

  walk(data.chain, 0, null);
  return nodes;
}

// ── Move fetching ────────────────────────────────────────────────────────────

export async function fetchLevelUpMoves(creatureId: number): Promise<MoveEntry[]> {
  const raw = await fetchJSON<PokeAPIResponse>(`${BASE}/pokemon/${creatureId}`);
  const lvlMoves = raw.moves
    .map((m) => {
      const lvls = m.version_group_details
        .filter((v) => v.move_learn_method.name === 'level-up')
        .map((v) => v.level_learned_at)
        .filter((l) => l > 0);
      return { name: m.move.name, url: m.move.url, lvl: lvls.length ? Math.min(...lvls) : null };
    })
    .filter((m): m is { name: string; url: string; lvl: number } => m.lvl !== null)
    .sort((a, b) => a.lvl - b.lvl);

  const details = await Promise.all(
    lvlMoves.map(async (m) => {
      try {
        const d = await fetchJSON<{
          type: { name: string };
          power: number | null;
          accuracy: number | null;
          pp: number | null;
          damage_class: { name: string };
        }>(`${BASE}/move/${m.name}`);
        return { ...m, type: d.type.name, power: d.power, accuracy: d.accuracy, pp: d.pp, klass: d.damage_class.name };
      } catch {
        return null;
      }
    })
  );

  return details.filter(Boolean) as MoveEntry[];
}

export async function fetchMovesDB(limit = 400): Promise<{ name: string; url: string }[]> {
  const list = await fetchJSON<{ results: { name: string; url: string }[] }>(`${BASE}/move?limit=${limit}`);
  return list.results;
}

export async function fetchMoveDetail(name: string): Promise<{
  name: string; type: string; klass: string;
  power: number | null; accuracy: number | null; pp: number | null;
  priority: number; generation: string; effect: string;
}> {
  const d = await fetchJSON<{
    name: string;
    type: { name: string };
    damage_class: { name: string };
    power: number | null;
    accuracy: number | null;
    pp: number | null;
    priority: number;
    generation: { name: string };
    effect_entries: { short_effect: string; language: { name: string } }[];
  }>(`${BASE}/move/${name}`);
  return {
    name: d.name,
    type: d.type.name,
    klass: d.damage_class.name,
    power: d.power,
    accuracy: d.accuracy,
    pp: d.pp,
    priority: d.priority,
    generation: d.generation.name.replace('generation-', '').toUpperCase(),
    effect: d.effect_entries.find((e) => e.language.name === 'en')?.short_effect ?? '',
  };
}

export async function fetchPokemonMoveSections(creatureId: number): Promise<{
  levelUp: MoveEntry[];
  tm: MoveEntry[];
  egg: MoveEntry[];
  tutor: MoveEntry[];
}> {
  const raw = await fetchJSON<PokeAPIResponse>(`${BASE}/pokemon/${creatureId}`);

  async function resolveDetails(items: { name: string; url: string; lvl: number }[]): Promise<MoveEntry[]> {
    const results = await concurrentMap(items, async (m): Promise<MoveEntry | null> => {
      try {
        const d = await fetchJSON<{
          type: { name: string };
          power: number | null;
          accuracy: number | null;
          pp: number | null;
          damage_class: { name: string };
        }>(`${BASE}/move/${m.name}`);
        return { ...m, type: d.type.name, power: d.power, accuracy: d.accuracy, pp: d.pp, klass: d.damage_class.name };
      } catch { return null; }
    }, 16);
    return results.filter(Boolean) as MoveEntry[];
  }

  const levelUpItems = raw.moves
    .map((m) => {
      const lvls = m.version_group_details
        .filter((v) => v.move_learn_method.name === 'level-up')
        .map((v) => v.level_learned_at)
        .filter((l) => l > 0);
      return { name: m.move.name, url: m.move.url, lvl: lvls.length ? Math.min(...lvls) : null };
    })
    .filter((m): m is { name: string; url: string; lvl: number } => m.lvl !== null)
    .sort((a, b) => a.lvl - b.lvl);

  function byMethod(method: string) {
    return raw.moves
      .filter((m) => m.version_group_details.some((v) => v.move_learn_method.name === method))
      .map((m) => ({ name: m.move.name, url: m.move.url, lvl: 0 }));
  }

  const [levelUp, tm, egg, tutor] = await Promise.all([
    resolveDetails(levelUpItems),
    resolveDetails(byMethod('machine')),
    resolveDetails(byMethod('egg')),
    resolveDetails(byMethod('tutor')),
  ]);

  return { levelUp, tm, egg, tutor };
}

export async function fetchAbilitiesDB(limit = 300): Promise<{ name: string; url: string }[]> {
  const list = await fetchJSON<{ results: { name: string; url: string }[] }>(`${BASE}/ability?limit=${limit}`);
  return list.results;
}

export async function fetchAbilityDetail(name: string): Promise<{
  name: string; generation: string; effect: string;
}> {
  const d = await fetchJSON<{
    name: string;
    generation: { name: string };
    effect_entries: { short_effect: string; language: { name: string } }[];
  }>(`${BASE}/ability/${name}`);
  return {
    name: d.name,
    generation: d.generation.name.replace('generation-', ''),
    effect: d.effect_entries.find((e) => e.language.name === 'en')?.short_effect ?? '',
  };
}

/** Total Pokémon in Gen 1–9 */
export const TOTAL_POKEMON = 1025;

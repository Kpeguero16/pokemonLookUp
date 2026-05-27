import { useState, useEffect, useMemo, useRef } from 'react';
import { ALL_TYPES } from '../constants/typeChart';
import { TypeBadge } from '../components/layout/TypeBadge';
import { fetchMovesDB, fetchMoveDetail, fetchAbilitiesDB, fetchAbilityDetail } from '../lib/pokeapi';
import { concurrentMap } from '../utils/concurrentMap';
import type { PokemonTypeName } from '../types/pokemon';

const MOVES_CACHE_KEY = 'dexmeta-moves-v2';
const ABILITIES_CACHE_KEY = 'dexmeta-abilities-v1';

function saveToSession(key: string, data: unknown) {
  try { sessionStorage.setItem(key, JSON.stringify(data)); } catch { /* quota exceeded or private browsing */ }
}
function loadFromSession<T>(key: string): T[] | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed as T[] : null;
  } catch { return null; }
}

type Tab = 'moves' | 'abilities';

interface MoveRow {
  name: string;
  type: string;
  klass: string;
  power: number | null;
  accuracy: number | null;
  priority: number;
  generation: string;
  effect: string;
}

const ALL_GENS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

interface AbilityRow {
  name: string;
  generation: string;
  effect: string;
}


const CLASS_CHIP_STYLES: Record<string, React.CSSProperties> = {
  physical: { padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: 'rgba(255,122,61,.2)',    color: 'var(--accent-hot)' },
  special:  { padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: 'rgba(184,92,201,.2)',   color: 'var(--stat-spa)' },
  status:   { padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: 'rgba(255,255,255,.06)', color: 'var(--fg-2)' },
};

export function MovesPage() {
  const [tab, setTab] = useState<Tab>('moves');
  const [inputVal, setInputVal] = useState('');
  const [q, setQ] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(val: string) {
    setInputVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQ(val), 300);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  useEffect(() => {
    document.title = `${tab === 'moves' ? 'Moves' : 'Abilities'} Codex — Pokémon Look Up`;
  }, [tab]);
  const [typeFilter, setTypeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [genFilter, setGenFilter] = useState('');
  const [moves, setMoves] = useState<MoveRow[]>([]);
  const [abilities, setAbilities] = useState<AbilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState(80);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shouldLoadRef = useRef(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && shouldLoadRef.current) setShowCount((n) => n + 80); },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setShowCount(80);

    if (tab === 'moves') {
      const cached = loadFromSession<MoveRow>(MOVES_CACHE_KEY);
      if (cached) {
        setMoves(cached);
        setLoading(false);
        return;
      }
      setMoves([]);
      (async () => {
        try {
          const list = await fetchMovesDB(10000);
          const out = await concurrentMap(
            list,
            async (item): Promise<MoveRow | null> => {
              const d = await fetchMoveDetail(item.name);
              return { name: d.name, type: d.type, klass: d.klass, power: d.power, accuracy: d.accuracy, priority: d.priority, generation: d.generation, effect: d.effect };
            },
            20
          );
          if (!cancel) {
            const result = out.filter(Boolean) as MoveRow[];
            setMoves(result);
            saveToSession(MOVES_CACHE_KEY, result);
          }
        } finally {
          if (!cancel) setLoading(false);
        }
      })();
    } else {
      const cached = loadFromSession<AbilityRow>(ABILITIES_CACHE_KEY);
      if (cached) {
        setAbilities(cached);
        setLoading(false);
        return;
      }
      setAbilities([]);
      (async () => {
        try {
          const list = await fetchAbilitiesDB(300);
          const out = await concurrentMap(
            list,
            async (item): Promise<AbilityRow | null> => {
              const d = await fetchAbilityDetail(item.name);
              return { name: d.name, generation: d.generation, effect: d.effect };
            },
            20
          );
          if (!cancel) {
            const result = out.filter(Boolean) as AbilityRow[];
            setAbilities(result);
            saveToSession(ABILITIES_CACHE_KEY, result);
          }
        } finally {
          if (!cancel) setLoading(false);
        }
      })();
    }

    return () => { cancel = true; };
  }, [tab]);

  const filteredMoves = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return moves.filter((m) => {
      if (ql && !m.name.includes(ql) && !m.effect.toLowerCase().includes(ql)) return false;
      if (typeFilter && m.type !== typeFilter) return false;
      if (classFilter && m.klass !== classFilter) return false;
      if (genFilter && m.generation !== genFilter) return false;
      return true;
    });
  }, [moves, q, typeFilter, classFilter, genFilter]);

  const filteredAbilities = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return abilities.filter((a) => {
      if (ql && !a.name.includes(ql) && !a.effect.toLowerCase().includes(ql)) return false;
      return true;
    });
  }, [abilities, q]);

  const filtered = tab === 'moves' ? filteredMoves : filteredAbilities;

  return (
    <div className="moves-screen">
      <div className="moves-toolbar">
        <div className="moves-tabs">
          <button data-on={tab === 'moves'} onClick={() => setTab('moves')}>Moves</button>
          <button data-on={tab === 'abilities'} onClick={() => setTab('abilities')}>Abilities</button>
        </div>
        <div className="search-input" style={{ flex: 1, minWidth: 200 }}>
          <span className="si-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={tab === 'moves' ? 'search moves...' : 'search abilities...'}
            value={inputVal}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {tab === 'moves' && (
          <>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="dex-select">
              <option value="">All types</option>
              {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="dex-select">
              <option value="">All classes</option>
              <option value="physical">Physical</option>
              <option value="special">Special</option>
              <option value="status">Status</option>
            </select>
            <select value={genFilter} onChange={(e) => setGenFilter(e.target.value)} className="dex-select">
              <option value="">All gens</option>
              {ALL_GENS.map((g) => <option key={g} value={g}>Gen {g}</option>)}
            </select>
          </>
        )}
        <div className="dex-count" style={{ marginLeft: 'auto' }}>
          {loading
            ? <span><span className="loader-dot" /> loading…</span>
            : <span><strong>{filtered.length}</strong> results</span>
          }
        </div>
      </div>

      {/* ── Desktop table layout ── */}
      <div className="moves-table">
        {tab === 'moves' ? (
          <>
            <div className="row row-header">
              <div>Name</div>
              <div>Type</div>
              <div>Class</div>
              <div>Power</div>
              <div>Acc</div>
              <div>Pri</div>
              <div>Effect</div>
            </div>
            {(filteredMoves as MoveRow[]).slice(0, showCount).map((m) => (
              <div className="row row-click" key={m.name}>
                <div className="nm">{m.name.replace(/-/g, ' ')}</div>
                <div>
                  {ALL_TYPES.includes(m.type as PokemonTypeName)
                    ? <TypeBadge type={m.type as PokemonTypeName} size="sm" />
                    : <span style={{ fontSize: 11 }}>{m.type}</span>
                  }
                </div>
                <div>
                  <span className="cls" style={CLASS_CHIP_STYLES[m.klass] ?? CLASS_CHIP_STYLES.status}>{m.klass.slice(0, 3).toUpperCase()}</span>
                </div>
                <div>{m.power ?? '—'}</div>
                <div>{m.accuracy ?? '—'}</div>
                <div style={{ fontWeight: m.priority !== 0 ? 700 : 400, color: m.priority > 0 ? 'var(--accent)' : m.priority < 0 ? 'var(--accent-hot)' : 'var(--fg-3)' }}>
                  {m.priority > 0 ? `+${m.priority}` : m.priority === 0 ? '0' : m.priority}
                </div>
                <div style={{ color: 'var(--fg-2)', fontSize: 11 }}>
                  {m.effect.replace(/\$effect_chance%/g, 'X%')}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="row row-header" style={{ gridTemplateColumns: '1fr 100px 2fr' }}>
              <div>Name</div>
              <div>Gen</div>
              <div>Effect</div>
            </div>
            {(filteredAbilities as AbilityRow[]).slice(0, showCount).map((a) => (
              <div className="row row-click" key={a.name} style={{ gridTemplateColumns: '1fr 100px 2fr' }}>
                <div className="nm">{a.name.replace(/-/g, ' ')}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{a.generation}</div>
                <div style={{ color: 'var(--fg-2)', fontSize: 11 }}>
                  {a.effect.replace(/\$effect_chance%/g, 'X%')}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Mobile card list layout ── */}
      <div className="moves-card-list">
        {tab === 'moves'
          ? (filteredMoves as MoveRow[]).slice(0, showCount).map((m) => (
              <div className="moves-card" key={m.name}>
                <div className="mc-top">
                  <span className="mc-name">{m.name.replace(/-/g, ' ')}</span>
                  <div className="mc-chips">
                    {ALL_TYPES.includes(m.type as PokemonTypeName)
                      ? <TypeBadge type={m.type as PokemonTypeName} size="sm" />
                      : <span style={{ fontSize: 10 }}>{m.type}</span>
                    }
                    <span className="cls" style={CLASS_CHIP_STYLES[m.klass] ?? CLASS_CHIP_STYLES.status}>
                      {m.klass.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mc-stats">
                  Pow {m.power ?? '—'} · Acc {m.accuracy ?? '—'} · Pri{' '}
                  <span style={{ fontWeight: m.priority !== 0 ? 700 : 400, color: m.priority > 0 ? 'var(--accent)' : m.priority < 0 ? 'var(--accent-hot)' : undefined }}>
                    {m.priority > 0 ? `+${m.priority}` : m.priority}
                  </span>
                </div>
                <div className="mc-effect">{m.effect.replace(/\$effect_chance%/g, 'X%')}</div>
              </div>
            ))
          : (filteredAbilities as AbilityRow[]).slice(0, showCount).map((a) => (
              <div className="moves-card" key={a.name}>
                <div className="mc-top">
                  <span className="mc-name">{a.name.replace(/-/g, ' ')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>{a.generation}</span>
                </div>
                <div className="mc-effect">{a.effect.replace(/\$effect_chance%/g, 'X%')}</div>
              </div>
            ))
        }
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
      {filtered.length > showCount && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button className="btn" onClick={() => setShowCount((n) => n + 80)}>Load more</button>
        </div>
      )}
    </div>
  );
}

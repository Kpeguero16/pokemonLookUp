import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDexStore } from '../store/dexStore';
import { useTeamStore } from '../store/teamStore';
import { useToastStore } from '../store/toastStore';
import { ALL_TYPES } from '../constants/typeChart';
import { TYPE_HEX } from '../constants/typeColors';
import { TypeBadge } from '../components/layout/TypeBadge';
import { CreatureCard } from '../components/lookup/CreatureCard';
import { Sprite } from '../components/lookup/Sprite';
import { generationOf } from '../utils/format';
import { POKEMON_WITH_FORMS } from '../constants/forms';
import type { SlimCreature, PokemonTypeName } from '../types/pokemon';

function ListRow({ creature, onSelect, onAdd }: {
  creature: SlimCreature;
  onSelect: () => void;
  onAdd?: () => void;
}) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  }

  return (
    <div
      className="list-row"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-label={`View ${creature.name.replace(/-/g, ' ')}, #${creature.id}, ${creature.types.join('/')} type, BST ${creature.bst}`}
    >
      <div className="lr-id">#{String(creature.id).padStart(3, '0')}</div>
      <div className="lr-sprite"><Sprite id={creature.id} kind="pixel" /></div>
      <div className="lr-name">{creature.name.replace(/-/g, ' ')}</div>
      <div className="lr-types">
        {creature.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
      <div className="lr-bst">BST {creature.bst}</div>
      <div className="lr-add">
        {onAdd && (
          <button
            className="icon-btn"
            style={{ width: 36, height: 36 }}
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            aria-label={`Add ${creature.name.replace(/-/g, ' ')} to team`}
          >+</button>
        )}
      </div>
    </div>
  );
}

const genPillStyle: React.CSSProperties = { flex: '1 0 30%', justifyContent: 'center' };

export function LookupPage() {
  const creatures = useDexStore((s) => s.creatures);
  const { teamIds, addById } = useTeamStore();
  const teamIdSet = useMemo(() => new Set(teamIds), [teamIds]);
  const showToast = useToastStore((s) => s.showToast);
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [typesOn, setTypesOn] = useState<Set<PokemonTypeName>>(new Set());
  const [bstMin, setBstMin] = useState(0);
  const [sort, setSort] = useState('id');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [genFilter, setGenFilter] = useState('all');
  const [showCount, setShowCount] = useState(120);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shouldLoadRef = useRef(false);

  useEffect(() => { document.title = 'Dex — Pokémon Look Up'; }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && shouldLoadRef.current) {
          setShowCount((n) => n + 120);
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = creatures.filter((c) => {
      if (ql && !c.name.includes(ql) && !String(c.id).includes(ql)) return false;
      if (typesOn.size > 0) {
        for (const t of typesOn) if (!c.types.includes(t)) return false;
      }
      if (bstMin > 0 && c.bst < bstMin) return false;
      if (genFilter !== 'all' && generationOf(c.id) !== Number(genFilter)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'name': return a.name.localeCompare(b.name);
        case 'bst-desc': return b.bst - a.bst;
        case 'bst-asc': return a.bst - b.bst;
        case 'hp-desc': return b.stats.hp - a.stats.hp;
        case 'atk-desc': return b.stats.attack - a.stats.attack;
        case 'spe-desc': return b.stats.speed - a.stats.speed;
        default: return a.id - b.id;
      }
    });
    return list;
  }, [creatures, q, typesOn, bstMin, sort, genFilter]);

  shouldLoadRef.current = filtered.length > showCount;

  function toggleType(t: PokemonTypeName) {
    setTypesOn((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  function handleAdd(c: SlimCreature) {
    if (teamIdSet.has(c.id)) { showToast(`${c.name} already in team`); return; }
    if (teamIds.length >= 6) { showToast('Team is full (6/6)'); return; }
    addById(c.id);
    showToast(`+ ${c.name} added`);
  }

  const activeFilterCount = typesOn.size + (bstMin > 0 ? 1 : 0) + (genFilter !== 'all' ? 1 : 0);
  const hasActiveFilters = q.trim().length > 0 || typesOn.size > 0 || bstMin > 0 || genFilter !== 'all' || sort !== 'id';

  function resetAllFilters() {
    setQ('');
    setTypesOn(new Set());
    setBstMin(0);
    setGenFilter('all');
    setSort('id');
  }

  return (
    <div className="dex">
      {filtersOpen && (
        <div className="filter-backdrop open" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
      )}
      <aside className={`dex-sidebar${filtersOpen ? ' open' : ''}`} aria-label="Filters">
        <div className="sidebar-mobile-header">
          <span className="smh-title">Filters</span>
          <button className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Close filters">×</button>
        </div>
        <div>
          <div className="filter-label">Generation</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[['all','All'],['1','I'],['2','II'],['3','III'],['4','IV'],['5','V'],['6','VI'],['7','VII'],['8','VIII'],['9','IX']].map(([k, l]) => (
              <button
                key={k}
                className="type-filter-pill"
                data-on={genFilter === k}
                aria-pressed={genFilter === k}
                style={genPillStyle}
                onClick={() => setGenFilter(k)}
              >{l}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="filter-label">
            Types {typesOn.size > 0 && <span style={{ color: 'var(--accent-text)' }}>({typesOn.size})</span>}
          </div>
          <div className="type-filter-grid">
            {ALL_TYPES.map((t) => (
              <button
                key={t}
                className="type-filter-pill"
                data-on={typesOn.has(t)}
                aria-pressed={typesOn.has(t)}
                onClick={() => toggleType(t)}
                style={typesOn.has(t) ? { color: TYPE_HEX[t] } : undefined}
              >
                <span className="swatch" style={{ background: TYPE_HEX[t] }} />
                {t}
              </button>
            ))}
          </div>
          {typesOn.size > 0 && (
            <button
              onClick={() => setTypesOn(new Set())}
              style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}
            >× clear types</button>
          )}
        </div>

        <div className="range-row">
          <div className="filter-label">Min BST</div>
          <input
            type="range"
            min="0" max="700" step="10"
            value={bstMin}
            onChange={(e) => setBstMin(Number(e.target.value))}
          />
          <div className="row-vals">
            <span>0</span>
            <span style={{ color: 'var(--accent)' }}>{bstMin}</span>
            <span>700</span>
          </div>
        </div>

        <div>
          <div className="filter-label">Sort by</div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="dex-select" style={{ width: '100%' }}>
            <option value="id">Dex number</option>
            <option value="name">Name (A→Z)</option>
            <option value="bst-desc">BST (high→low)</option>
            <option value="bst-asc">BST (low→high)</option>
            <option value="hp-desc">HP (high→low)</option>
            <option value="atk-desc">Attack (high→low)</option>
            <option value="spe-desc">Speed (high→low)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            className="reset-filters-btn"
            onClick={resetAllFilters}
            aria-label="Reset all filters"
          >↺ Reset Filters</button>
        )}
      </aside>

      <div className="dex-main">
        <div className="search-row">
          <div className="search-input">
            <span className="si-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <label htmlFor="dex-search" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
              Search Pokémon by name or Pokédex number
            </label>
            <input
              id="dex-search"
              ref={inputRef}
              type="search"
              placeholder="search by name or #id..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <span className="kbd-hint" aria-hidden="true">/</span>
          </div>
        </div>

        <div className="dex-toolbar">
          <button
            className="filter-toggle-btn"
            onClick={() => setFiltersOpen(true)}
            aria-expanded={filtersOpen}
            aria-label="Open filters"
          >
            <span aria-hidden="true">⚙</span> Filters
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </button>
          <div className="dex-count">
            Showing <strong>{Math.min(showCount, filtered.length)}</strong> of <strong>{filtered.length}</strong>
          </div>
          <div className="view-toggle">
            <button data-on={view === 'grid'} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>Grid</button>
            <button data-on={view === 'list'} aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon" aria-hidden="true">×_×</div>
            <div>NO MATCHES</div>
            <div style={{ marginTop: 6, color: 'var(--fg-3)' }}>try clearing some filters</div>
          </div>
        ) : view === 'grid' ? (
          <div className="cards-grid">
            {filtered.slice(0, showCount).map((c) => (
              <CreatureCard
                key={c.id}
                creature={c}
                onSelect={() => navigate(`/detail/${c.id}`)}
                onAdd={() => handleAdd(c)}
                inTeam={teamIdSet.has(c.id)}
                hasForms={POKEMON_WITH_FORMS.has(c.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 6 }}>
            {filtered.slice(0, showCount).map((c) => (
              <ListRow
                key={c.id}
                creature={c}
                onSelect={() => navigate(`/detail/${c.id}`)}
                onAdd={() => handleAdd(c)}
              />
            ))}
          </div>
        )}

        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
      </div>
    </div>
  );
}

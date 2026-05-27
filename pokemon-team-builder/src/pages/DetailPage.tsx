import { useState, useEffect, useMemo, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDexStore } from '../store/dexStore';
import { useTeamStore } from '../store/teamStore';
import { useToastStore } from '../store/toastStore';
import { fetchSpecies, fetchEvolutionChain, fetchAbilityDetail, fetchPokemonMoveSections, fetchSlimCreature } from '../lib/pokeapi';
import { defensiveProfileExport } from '../hooks/useTeamAnalysis';
import { generationOf } from '../utils/format';
import { ALL_TYPES } from '../constants/typeChart';
import { TYPE_HEX } from '../constants/typeColors';
import { TypeBadge } from '../components/layout/TypeBadge';
import { Sprite } from '../components/lookup/Sprite';
import { StatBars } from '../components/lookup/StatBars';
import type { SlimCreature, PokemonTypeName, SpeciesData, EvoNode, MoveEntry, PokemonFormVariant } from '../types/pokemon';


function MatchupPill({ type, mult }: { type: PokemonTypeName; mult: number }) {
  const col = TYPE_HEX[type];
  const label = mult === 0 ? '0×' : mult === 0.25 ? '¼×' : mult === 0.5 ? '½×' : mult === 4 ? '4×' : `${mult}×`;
  return (
    <div className="matchup-cell" data-mult={String(mult)}>
      <span className="t-glyph" style={{ background: col }}>{type.slice(0, 3).toUpperCase()}</span>
      <span className="mult">{label}</span>
    </div>
  );
}

type MoveTab = 'levelUp' | 'tm' | 'egg' | 'tutor';
const MOVE_TAB_LABELS: Record<MoveTab, string> = {
  levelUp: 'Level Up', tm: 'TM / HM', egg: 'Egg', tutor: 'Tutor',
};

function MovePoolPreview({ creature }: { creature: SlimCreature }) {
  const [sections, setSections] = useState<{
    levelUp: MoveEntry[]; tm: MoveEntry[]; egg: MoveEntry[]; tutor: MoveEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<MoveTab>('levelUp');

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setSections(null);
    setTab('levelUp');
    fetchPokemonMoveSections(creature.id)
      .then((s) => { if (!cancel) setSections(s); })
      .catch(() => { if (!cancel) setSections({ levelUp: [], tm: [], egg: [], tutor: [] }); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [creature.id]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 6 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 28 }} />
        ))}
      </div>
    );
  }

  const moves = sections?.[tab] ?? [];

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['levelUp', 'tm', 'egg', 'tutor'] as MoveTab[]).map((t) => (
          <button
            key={t}
            className="btn btn-ghost"
            style={{
              fontSize: 11, padding: '3px 10px',
              opacity: tab === t ? 1 : 0.5,
              borderColor: tab === t ? 'var(--accent)' : undefined,
              color: tab === t ? 'var(--accent)' : undefined,
            }}
            onClick={() => setTab(t)}
          >
            {MOVE_TAB_LABELS[t]}
            {sections && (
              <span style={{ marginLeft: 5, color: 'var(--fg-3)', fontWeight: 400 }}>
                ({sections[t].length})
              </span>
            )}
          </button>
        ))}
      </div>
      {moves.length === 0
        ? <div className="empty-state">No {MOVE_TAB_LABELS[tab].toLowerCase()} moves.</div>
        : (
          <div className="move-table">
            <div className="mh">Move</div>
            <div className="mh">Type</div>
            <div className="mh">Class</div>
            <div className="mh">Pow</div>
            <div className="mh">Acc</div>
            <div className="mh">PP</div>
            {moves.map((m) => (
              <Fragment key={m.name}>
                <div className="mc mc-name">
                  {tab === 'levelUp' && `Lv ${m.lvl} · `}{m.name.replace(/-/g, ' ')}
                </div>
                <div className="mc">
                  {m.type && <TypeBadge type={m.type as PokemonTypeName} size="sm" />}
                </div>
                <div className="mc mc-class">
                  <span className={`cls-${m.klass ?? 'status'}`}>
                    {(m.klass ?? 'sta').slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <div className="mc">{m.power ?? '—'}</div>
                <div className="mc mc-acc">{m.accuracy ?? '—'}</div>
                <div className="mc mc-pp">{m.pp ?? '—'}</div>
              </Fragment>
            ))}
          </div>
        )
      }
    </div>
  );
}

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const creatures = useDexStore((s) => s.creatures);
  const creature = creatures.find((c) => c.id === Number(id));
  const { teamIds, addById, setForm } = useTeamStore();
  const inTeam = teamIds.includes(Number(id));
  const showToast = useToastStore((s) => s.showToast);
  const navigate = useNavigate();

  const [species, setSpecies] = useState<SpeciesData | null>(null);
  const [evoChain, setEvoChain] = useState<EvoNode[] | null>(null);
  const [flavor, setFlavor] = useState('');
  const [abilityEffects, setAbilityEffects] = useState<Record<string, string>>({});

  // Form selector state
  const [selectedFormName, setSelectedFormName] = useState<string | null>(null);
  const [formCreature, setFormCreature] = useState<SlimCreature | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (creature) {
      document.title = `${creature.name.replace(/-/g, ' ')} — Pokémon Look Up`;
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: title only needs to update when the pokemon id changes, not on every store reference update
  }, [creature?.id]);

  useEffect(() => {
    if (!creature) return;
    let cancelled = false;
    setSpecies(null); setEvoChain(null); setFlavor('');
    (async () => {
      try {
        const sp = await fetchSpecies(creature.speciesUrl);
        if (cancelled) return;
        setSpecies(sp);
        if (sp.flavorText) setFlavor(sp.flavorText);
        if (sp.evolutionChainUrl) {
          const evo = await fetchEvolutionChain(sp.evolutionChainUrl);
          if (!cancelled) setEvoChain(evo);
        }
      } catch { /* species/evo data is non-critical; page still renders without it */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-fetch when the pokemon id changes, speciesUrl is stable per id
  }, [creature?.id]);

  useEffect(() => {
    if (!creature) return;
    let cancelled = false;
    setAbilityEffects({});
    (async () => {
      const effects: Record<string, string> = {};
      await Promise.all(
        creature.abilities.map(async (a) => {
          try {
            const d = await fetchAbilityDetail(a.name);
            effects[a.name] = d.effect;
          } catch { /* non-critical */ }
        })
      );
      if (!cancelled) setAbilityEffects(effects);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creature?.id]);

  // Reset form selection when navigating to a different Pokémon
  useEffect(() => {
    setSelectedFormName(null);
    setFormCreature(null);
  }, [creature?.id]);

  // Fetch form creature when a form chip is selected
  useEffect(() => {
    if (!selectedFormName) { setFormCreature(null); return; }
    let cancelled = false;
    setFormLoading(true);
    fetchSlimCreature(selectedFormName)
      .then((c) => { if (!cancelled) setFormCreature(c); })
      .catch(() => { if (!cancelled) setFormCreature(null); })
      .finally(() => { if (!cancelled) setFormLoading(false); });
    return () => { cancelled = true; };
  }, [selectedFormName]);

  // Use form creature for display when one is selected; fall back to base creature
  const activeCreature = formCreature ?? creature;
  const tint = activeCreature ? (TYPE_HEX[activeCreature.types[0]] ?? '#666') : '#666';

  const defProfile = useMemo(
    () => (activeCreature ? defensiveProfileExport(activeCreature.types) : {} as Record<PokemonTypeName, number>),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCreature?.types.join(',')]
  );

  const groups = useMemo(() => {
    const g: Record<string, PokemonTypeName[]> = { x4: [], x2: [], x0: [], x05: [], x025: [] };
    for (const t of ALL_TYPES) {
      const m = (defProfile as Record<PokemonTypeName, number>)[t];
      if (m === 4) g.x4.push(t);
      else if (m === 2) g.x2.push(t);
      else if (m === 0) g.x0.push(t);
      else if (m === 0.5) g.x05.push(t);
      else if (m === 0.25) g.x025.push(t);
    }
    return g;
  }, [defProfile]);

  function handleAdd() {
    if (!creature) return;
    if (inTeam) { showToast(`${creature.name} already in team`); return; }
    if (teamIds.length >= 6) { showToast('Team is full (6/6)'); return; }
    addById(creature.id);
    if (selectedFormName && formCreature) {
      setForm(creature.id, selectedFormName, formCreature);
    }
    const displayName = formCreature
      ? formCreature.name.replace(/-/g, ' ')
      : creature.name.replace(/-/g, ' ');
    showToast(`+ ${displayName} added`);
  }

  if (!creature) {
    return (
      <div className="detail">
        <div style={{ padding: 40, color: 'var(--fg-2)' }}>Pokémon not found.</div>
      </div>
    );
  }

  return (
    <div className="detail">
      <button className="detail-back" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-header" style={{ '--card-tint': tint } as React.CSSProperties}>
        <div className="detail-art" style={{ '--card-tint': tint } as React.CSSProperties}>
          <div className="pixel-id">N°{String(creature.id).padStart(4, '0')}</div>
          {formLoading
            ? <div className="skeleton" style={{ width: 200, height: 200, borderRadius: 16 }} />
            : <Sprite id={activeCreature!.id} kind="official" alt={activeCreature!.name} />
          }
          <div className="pixel-strip">
            <Sprite id={activeCreature!.id} kind="pixel" alt="" />
            <span>SPRITE_8BIT</span>
          </div>
        </div>
        <div className="detail-meta">
          <div className="d-id">
            #{String(creature.id).padStart(3, '0')} / GEN {generationOf(creature.id)}
          </div>
          <h1>{activeCreature!.name.replace(/-/g, ' ')}</h1>
          <div className="types-row">
            {activeCreature!.types.map((t) => <TypeBadge key={t} type={t} size="lg" />)}
          </div>

          {/* Form selector chips — shown when species has alternate variants */}
          {species && species.variants.length > 0 && (
            <div className="form-selector" aria-label="Select form">
              <button
                className="form-chip"
                data-active={selectedFormName === null}
                onClick={() => setSelectedFormName(null)}
              >
                Base Form
              </button>
              {species.variants.map((v: PokemonFormVariant) => (
                <button
                  key={v.name}
                  className="form-chip"
                  data-active={selectedFormName === v.name}
                  onClick={() => setSelectedFormName(v.name === selectedFormName ? null : v.name)}
                >
                  {v.displayName}
                </button>
              ))}
            </div>
          )}

          <div className="flavor">
            {flavor || (species === null ? <span className="loader-dot" /> : '—')}
          </div>
          <div className="kv-grid">
            <div className="kv">
              <div className="k">HEIGHT</div>
              <div className="v">{(activeCreature!.height / 10).toFixed(1)}<span className="unit">m</span></div>
            </div>
            <div className="kv">
              <div className="k">WEIGHT</div>
              <div className="v">{(activeCreature!.weight / 10).toFixed(1)}<span className="unit">kg</span></div>
            </div>
            <div className="kv">
              <div className="k">CAPTURE</div>
              <div className="v">{species ? (species.captureRate ?? '—') : '—'}</div>
            </div>
            <div className="kv">
              <div className="k">BST</div>
              <div className="v" style={{ color: 'var(--accent)' }}>{activeCreature!.bst}</div>
            </div>
            <div className="kv" style={{ gridColumn: '1 / -1' }}>
              <div className="k">EGG GROUPS</div>
              <div className="v" style={{ fontSize: 13, textTransform: 'capitalize' }}>
                {species ? (species.eggGroups.length ? species.eggGroups.join(' · ') : '—') : '—'}
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn btn-primary" onClick={handleAdd} disabled={inTeam}>
              {inTeam ? '✓ In team' : '+ Add to team'}
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Browse dex</button>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="section">
          <h3>Base stats</h3>
          <StatBars stats={activeCreature!.stats} />
        </div>
        <div className="section">
          <h3>
            Type matchup{' '}
            <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, marginLeft: 8, color: 'var(--fg-3)' }}>
              (defensive)
            </span>
          </h3>
          {(groups.x4.length + groups.x2.length) > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div className="filter-label" style={{ marginBottom: 6 }}>Weak to</div>
              <div className="matchup-grid">
                {groups.x4.map((t) => <MatchupPill key={t} type={t} mult={4} />)}
                {groups.x2.map((t) => <MatchupPill key={t} type={t} mult={2} />)}
              </div>
            </div>
          )}
          {(groups.x05.length + groups.x025.length) > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div className="filter-label" style={{ marginBottom: 6 }}>Resists</div>
              <div className="matchup-grid">
                {groups.x025.map((t) => <MatchupPill key={t} type={t} mult={0.25} />)}
                {groups.x05.map((t) => <MatchupPill key={t} type={t} mult={0.5} />)}
              </div>
            </div>
          )}
          {groups.x0.length > 0 && (
            <div>
              <div className="filter-label" style={{ marginBottom: 6 }}>Immune</div>
              <div className="matchup-grid">
                {groups.x0.map((t) => <MatchupPill key={t} type={t} mult={0} />)}
              </div>
            </div>
          )}
          {groups.x4.length + groups.x2.length + groups.x05.length + groups.x025.length + groups.x0.length === 0 && (
            <div style={{ color: 'var(--fg-3)', fontSize: 13 }}>Normal effectiveness across all types.</div>
          )}
        </div>
      </div>

      <div className="section">
        <h3>Abilities</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeCreature!.abilities.map((a) => (
            <div
              key={a.name}
              style={{
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: abilityEffects[a.name] ? 6 : 0 }}>
                <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>
                  {a.name.replace(/-/g, ' ')}
                </span>
                {a.hidden && <span className="hidden-tag">HIDDEN</span>}
              </div>
              {abilityEffects[a.name]
                ? <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.6 }}>{abilityEffects[a.name]}</div>
                : <div className="skeleton" style={{ height: 14, width: '70%', marginTop: 4 }} />
              }
            </div>
          ))}
        </div>
      </div>

      {evoChain && evoChain.length > 1 && (
        <div className="section">
          <h3>Evolution line</h3>
          <div className="evo-chain">
            {evoChain.map((n, i) => {
              const evoCreature = creatures.find((c) => c.name === n.name);
              const evoId = evoCreature?.id ?? n.id;
              return (
                <Fragment key={n.name + i}>
                  {i > 0 && (
                    <div className="evo-arrow">
                      →
                      {n.trigger && <span className="trig">{n.trigger}</span>}
                    </div>
                  )}
                  <button
                    className="evo-node"
                    onClick={() => { if (evoId) navigate(`/detail/${evoId}`); }}
                  >
                    {evoId && <Sprite id={evoId} kind="pixel" />}
                    <div className="nm">{n.name.replace(/-/g, ' ')}</div>
                    <div className="eid">{evoId ? `#${String(evoId).padStart(3, '0')}` : '—'}</div>
                  </button>
                </Fragment>
              );
            })}
          </div>
        </div>
      )}

      <div className="section">
        <h3>
          Moves{' '}
          <span style={{ color: 'var(--fg-3)', fontWeight: 500, letterSpacing: 0, textTransform: 'none', marginLeft: 8 }}>
            ({activeCreature!.moveCount} total)
          </span>
        </h3>
        <MovePoolPreview creature={activeCreature!} />
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDexStore } from '../store/dexStore';
import { useTeamStore } from '../store/teamStore';
import { useToastStore } from '../store/toastStore';
import { useTeam, useTeamSlots } from '../hooks/useTeam';
import { TYPE_HEX } from '../constants/typeColors';
import { TypeBadge } from '../components/layout/TypeBadge';
import { Sprite } from '../components/lookup/Sprite';
import { PickerModal } from '../components/team/PickerModal';
import { Analysis } from '../components/team/Analysis';
import type { SlimCreature } from '../types/pokemon';

type Layout = 'horizontal' | 'grid' | 'sidebar';

// ── Team Slot ─────────────────────────────────────────────────────────────────
function TeamSlotCard({ index, creature, baseId, onAdd, onRemove, onSelect }: {
  index: number;
  creature: SlimCreature | null;
  /** Base dex ID (1-1025) — for display and navigation; may differ from creature.id for form creatures */
  baseId: number | null;
  onAdd: () => void;
  onRemove: () => void;
  onSelect: (c: SlimCreature, baseId: number) => void;
}) {
  if (!creature) {
    return (
      <button className="team-slot empty" onClick={onAdd} aria-label={`Add Pokémon to slot ${index + 1}`}>
        <span className="plus">+</span>
        <span className="ts-label">slot {index + 1}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>click to pick</span>
      </button>
    );
  }
  const dexId = baseId ?? creature.id;
  const tint = TYPE_HEX[creature.types[0]] ?? '#666';
  return (
    <div
      className="team-slot filled"
      style={{ '--card-tint': tint } as React.CSSProperties}
      onClick={() => onSelect(creature, dexId)}
    >
      <div className="slot-id">#{String(dexId).padStart(3, '0')}</div>
      <button className="slot-x" aria-label="Remove" onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</button>
      <div className="slot-art">
        <Sprite id={creature.id} kind="official" />
      </div>
      <div>
        <div className="slot-name">{creature.name.replace(/-/g, ' ')}</div>
        <div className="slot-types">
          {creature.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textAlign: 'center', marginTop: 8 }}>
        BST {creature.bst} · SPE {creature.stats.speed}
      </div>
    </div>
  );
}

// ── TeamPage ──────────────────────────────────────────────────────────────────
export function TeamPage() {
  const team = useTeam();
  const slots = useTeamSlots();
  const { teamIds, teamForms, teamFormData, teamName, removeSlot, clearTeam, randomizeIds, setSlot, setTeamName, setForm } = useTeamStore();
  const creatures = useDexStore((s) => s.creatures);
  const showToast = useToastStore((s) => s.showToast);
  const navigate = useNavigate();

  const [layout, setLayout] = useState<Layout>('horizontal');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    document.title = `${teamName} — Pokémon Look Up`;
  }, [teamName]);

  function removeAt(i: number) {
    const creature = slots[i];
    const baseId = teamIds[i];
    if (!creature || baseId === null) return;
    const formName = teamForms[i];
    const formCreature = teamFormData[i];
    removeSlot(i);
    showToast(
      `Removed ${creature.name.replace(/-/g, ' ')}`,
      { label: 'Undo', fn: () => {
        if (useTeamStore.getState().teamIds[i] !== null) {
          showToast("Can't undo — that slot is no longer empty");
          return;
        }
        setSlot(i, baseId);
        if (formName && formCreature) {
          setForm(i, formName, formCreature);
        }
      }}
    );
  }

  function handleRandomize() {
    if (creatures.length === 0) return;
    randomizeIds(creatures.map((c) => c.id));
  }

  async function handleExport() {
    const blocks = team.map((c) => {
      const abilityObj = c.abilities.find((a) => !a.hidden) ?? c.abilities[0];
      const abilityName = abilityObj
        ? abilityObj.name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'No Ability';
      // Use the stored form name for Showdown export (e.g. "rattata-alola" → "Rattata-Alola")
      // teamForms is keyed by base ID; for form creatures c.name already is the form name
      const showdownName = c.name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
      return [showdownName, `Ability: ${abilityName}`, '- Move 1', '- Move 2', '- Move 3', '- Move 4'].join('\n');
    });
    const text = blocks.join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    showToast('Showdown format copied to clipboard');
  }

  function openPicker(slot: number) {
    setPickerSlot(slot);
    setPickerOpen(true);
  }

  function pickIntoSlot(c: SlimCreature, formName: string | null, formCreature: SlimCreature | null) {
    setSlot(pickerSlot, c.id);
    if (formName && formCreature) {
      setForm(pickerSlot, formName, formCreature);
    }
    setPickerOpen(false);
    const displayName = formCreature ? formCreature.name.replace(/-/g, ' ') : c.name.replace(/-/g, ' ');
    showToast(`+ ${displayName}`);
  }

  return (
    <div className="team-screen">
      <div className="team-header">
        <div className="team-title">
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, color: 'var(--accent-text)' }}>TEAM ▸</span>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            aria-label="Team name"
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)', fontWeight: 500 }}>
            {team.length}/6
          </span>
        </div>
        <div className="team-actions">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {(['horizontal', 'grid', 'sidebar'] as Layout[]).map((l) => (
              <button
                key={l}
                className="btn btn-ghost"
                style={{ opacity: layout === l ? 1 : 0.5, padding: '4px 8px', fontSize: 11 }}
                aria-pressed={layout === l}
                onClick={() => setLayout(l)}
              >{l}</button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={handleRandomize}>↺ Randomize</button>
          <button className="btn btn-ghost" onClick={handleExport} disabled={team.length === 0}>↗ Showdown</button>
          {confirmClear ? (
            <>
              <button
                className="btn"
                style={{ color: 'var(--accent-hot)', borderColor: 'var(--accent-hot)' }}
                onClick={() => { clearTeam(); setConfirmClear(false); }}
              >Confirm clear</button>
              <button className="btn btn-ghost" onClick={() => setConfirmClear(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => setConfirmClear(true)} disabled={team.length === 0}>× Clear</button>
          )}
        </div>
      </div>

      {layout === 'horizontal' && (
        <div className="team-bar">
          {slots.map((c, i) => (
            <TeamSlotCard
              key={i}
              index={i}
              creature={c}
              baseId={teamIds[i]}
              onAdd={() => openPicker(i)}
              onRemove={() => removeAt(i)}
              onSelect={(_cr, dexId) => navigate(`/detail/${dexId}`)}
            />
          ))}
        </div>
      )}

      {layout === 'grid' && (
        <div className="team-grid-2x3">
          {slots.map((c, i) => (
            <TeamSlotCard
              key={i}
              index={i}
              creature={c}
              baseId={teamIds[i]}
              onAdd={() => openPicker(i)}
              onRemove={() => removeAt(i)}
              onSelect={(_cr, dexId) => navigate(`/detail/${dexId}`)}
            />
          ))}
        </div>
      )}

      {layout === 'sidebar' && (
        <div className="team-with-sidebar">
          <div className="team-sidebar-list">
            {slots.map((c, i) => {
              const dexId = teamIds[i] ?? c?.id;
              return (
                <div
                  key={i}
                  className={`ts-slot${c ? ' filled' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => c ? navigate(`/detail/${dexId}`) : openPicker(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (c) navigate(`/detail/${dexId}`);
                      else openPicker(i);
                    }
                  }}
                  aria-label={c ? `View ${c.name.replace(/-/g, ' ')}` : `Pick Pokémon for slot ${i + 1}`}
                  style={c ? { '--card-tint': TYPE_HEX[c.types[0]] } as React.CSSProperties : undefined}
                >
                  <div className="num">{i + 1}</div>
                  {c ? (
                    <>
                      <Sprite id={c.id} kind="pixel" />
                      <div style={{ minWidth: 0 }}>
                        <div className="nm">{c.name.replace(/-/g, ' ')}</div>
                        <div className="tts">{c.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', color: 'var(--fg-3)' }}>+</div>
                      <div className="nm" style={{ color: 'var(--fg-3)' }}>Empty slot</div>
                    </>
                  )}
                  {c && (
                    <button
                      className="icon-btn"
                      aria-label={`Remove ${c.name.replace(/-/g, ' ')}`}
                      onClick={(e) => { e.stopPropagation(); removeAt(i); }}
                      style={{ width: 30, height: 30 }}
                    >×</button>
                  )}
                </div>
              );
            })}
          </div>
          <div><Analysis /></div>
        </div>
      )}

      {layout !== 'sidebar' && (
        team.length > 0
          ? <Analysis />
          : (
            <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 24, color: 'var(--accent-text)', marginBottom: 12 }}>
                NO TEAM YET
              </div>
              <div style={{ color: 'var(--fg-2)', marginBottom: 18, maxWidth: 420, margin: '0 auto 18px' }}>
                Add Pokémon to see type coverage, role distribution, speed tiers, and synergy notes.
              </div>
              <button className="btn btn-primary" onClick={() => openPicker(0)}>+ Add first Pokémon</button>
            </div>
          )
      )}

      {pickerOpen && (
        <PickerModal
          creatures={creatures}
          onPick={(c, formName, formCreature) => pickIntoSlot(c, formName, formCreature)}
          onClose={() => setPickerOpen(false)}
          slotNum={pickerSlot + 1}
        />
      )}
    </div>
  );
}
